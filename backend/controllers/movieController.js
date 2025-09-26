const Movie = require('../models/Movie');
const omdbService = require('../services/omdbService');
const cacheService = require('../services/cacheService');
const { validationResult } = require('express-validator');

// Search movies with caching
exports.searchMovies = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      search,
      sort = 'relevance',
      filter,
      page = 1,
      limit = 10,
      year,
      type = 'movie'
    } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    let mongoFilter = {};
    
    // Text search
    if (search) {
      mongoFilter.$text = { $search: search };
    }

    // Year filter
    if (year) {
      mongoFilter.year = parseInt(year);
    }

    // Type filter
    if (type && type !== 'all') {
      mongoFilter.type = type;
    }

    // Genre filter
    if (filter && filter.startsWith('genre:')) {
      const genre = filter.replace('genre:', '');
      mongoFilter.genre = { $in: [genre] };
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'rating':
        sortObj = { imdbRating: -1 };
        break;
      case 'year':
        sortObj = { year: -1 };
        break;
      case 'title':
        sortObj = { title: 1 };
        break;
      case 'popularity':
        sortObj = { popularity: -1 };
        break;
      default:
        sortObj = { score: { $meta: 'textScore' } };
    }

    // Search in cache first
    let cachedMovies = await Movie.find(mongoFilter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    let totalCount = await Movie.countDocuments(mongoFilter);

    // If no cached results or insufficient results, fetch from API
    if (cachedMovies.length === 0 || (cachedMovies.length < limitNum && pageNum === 1)) {
      try {
        const apiResults = await omdbService.searchMovies(search, pageNum, type);
        
        if (apiResults.Search && apiResults.Search.length > 0) {
          // Cache the results
          const cachedMoviePromises = apiResults.Search.map(async (movie) => {
            try {
              // Get full movie details
              const fullMovie = await omdbService.getMovieDetails(movie.imdbID);
              
              // Save to cache
              const cachedMovie = await cacheService.cacheMovie(fullMovie);
              return cachedMovie;
            } catch (error) {
              console.error(`Error caching movie ${movie.imdbID}:`, error);
              return null;
            }
          });

          const newCachedMovies = await Promise.all(cachedMoviePromises);
          const validCachedMovies = newCachedMovies.filter(movie => movie !== null);

          // Re-run the search with updated cache
          cachedMovies = await Movie.find(mongoFilter)
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .select('-__v');

          totalCount = await Movie.countDocuments(mongoFilter);
        }
      } catch (apiError) {
        console.error('API search error:', apiError);
        // Continue with cached results even if API fails
      }
    }

    // Update search count for found movies
    const movieIds = cachedMovies.map(movie => movie._id);
    await Movie.updateMany(
      { _id: { $in: movieIds } },
      { $inc: { searchCount: 1, popularity: 1 } }
    );

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        movies: cachedMovies,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Search movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get movie details by ID
exports.getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }

    // Check cache first
    let movie = await Movie.findOne({
      $or: [
        { imdbID: id },
        { _id: id }
      ]
    }).select('-__v');

    // If not in cache or cache expired, fetch from API
    if (!movie || movie.isCacheExpired) {
      try {
        const apiMovie = await omdbService.getMovieDetails(id);
        movie = await cacheService.cacheMovie(apiMovie);
      } catch (apiError) {
        if (!movie) {
          return res.status(404).json({
            success: false,
            message: 'Movie not found'
          });
        }
        // Use cached version even if expired when API fails
      }
    }

    // Increment view count
    await movie.incrementSearchCount();

    res.json({
      success: true,
      data: movie
    });

  } catch (error) {
    console.error('Get movie details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get popular movies
exports.getPopularMovies = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    const popularMovies = await Movie.find({})
      .sort({ popularity: -1, imdbRating: -1 })
      .limit(limitNum)
      .select('-__v');

    res.json({
      success: true,
      data: popularMovies
    });

  } catch (error) {
    console.error('Get popular movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Refresh cache for a movie
exports.refreshMovieCache = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }

    // Fetch fresh data from API
    const apiMovie = await omdbService.getMovieDetails(id);
    const movie = await cacheService.cacheMovie(apiMovie);

    res.json({
      success: true,
      message: 'Movie cache refreshed successfully',
      data: movie
    });

  } catch (error) {
    console.error('Refresh movie cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh movie cache',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Clear expired cache
exports.clearExpiredCache = async (req, res) => {
  try {
    const result = await Movie.cleanupExpiredCache();

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} expired cache entries`
    });

  } catch (error) {
    console.error('Clear expired cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear expired cache',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export movie data as CSV
exports.exportMoviesCSV = async (req, res) => {
  try {
    const { search, filter } = req.query;

    let mongoFilter = {};
    
    if (search) {
      mongoFilter.$text = { $search: search };
    }

    if (filter && filter.startsWith('genre:')) {
      const genre = filter.replace('genre:', '');
      mongoFilter.genre = { $in: [genre] };
    }

    const movies = await Movie.find(mongoFilter)
      .select('title year genre director imdbRating runtime type')
      .limit(1000); // Limit to prevent large exports

    // Convert to CSV format
    const csvHeader = 'Title,Year,Genre,Director,Rating,Runtime,Type\n';
    const csvRows = movies.map(movie => {
      const genre = Array.isArray(movie.genre) ? movie.genre.join('; ') : movie.genre || '';
      return `"${movie.title}",${movie.year},"${genre}","${movie.director || ''}",${movie.imdbRating || ''},"${movie.runtime || ''}","${movie.type}"`;
    });

    const csvContent = csvHeader + csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="movies.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Export movies CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export movies CSV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};