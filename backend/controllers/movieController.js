const axios = require('axios');
const Movie = require('../models/Movie');
const cache = require('../services/cacheService');

const OMDB_URL = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}`;
const TTL_HOURS = parseInt(process.env.CACHE_EXPIRY_HOURS) || 24;

function isStale(movie) {
  if (!movie.lastFetched) return true;
  const ageMs = Date.now() - new Date(movie.lastFetched).getTime();
  return ageMs > TTL_HOURS * 3600 * 1000;
}

async function fetchFromOmdbById(id) {
  const resp = await axios.get(`${OMDB_URL}&i=${id}`);
  return resp.data;
}

async function fetchFromOmdbSearch(query) {
  if (!query) {
    throw new Error('Search query parameter is missing');
  }
  const url = `${OMDB_URL}&s=${encodeURIComponent(query)}`;
  console.log('Fetching OMDb API URL:', url);
  const resp = await axios.get(url);
  return resp.data;
}

exports.searchMovies = async (req, res, next) => {
  try {
    const { search, sort, filter, page = 1, limit = 10 } = req.query;

    if (!search || search.trim() === '') {
      return res.status(400).json({ success: false, message: 'Missing or empty search query parameter' });
    }

    const cacheKey = `search_${search}_${sort || ''}_${filter || ''}_${page}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Returning cached results');
      return res.json(cached);
    }

    const data = await fetchFromOmdbSearch(search);
    if (data.Response === 'False') {
      return res.status(404).json({ success: false, message: data.Error || 'No movies found' });
    }

    const results = data.Search || [];

    // Fetch & upsert full movie data concurrently
    const movies = await Promise.all(results.map(async (item) => {
      const full = await fetchFromOmdbById(item.imdbID);
      const updated = {
        imdbID: full.imdbID,
        title: full.Title,
        year: parseInt(full.Year),
        runtime: parseInt(full.Runtime) || 0,
        genre: full.Genre ? full.Genre.split(',').map(g => g.trim()) : [],
        director: full.Director,
        actors: full.Actors ? full.Actors.split(',').map(a => a.trim()) : [],
        plot: full.Plot,
        rating: parseFloat(full.imdbRating) || 0,
        lastFetched: new Date()
      };
      return await Movie.findOneAndUpdate(
        { imdbID: full.imdbID },
        updated,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }));

    // Filtering by genre or other field (only first genre if filter is genre)
    let filtered = movies;
    if (filter) {
      const [key, val] = filter.split(':');
      filtered = filtered.filter(m => {
        const field = m[key];
        if (Array.isArray(field)) {
          return field.includes(val);
        }
        return field === val;
      });
    }

    // Sorting logic
    if (sort) {
      if (sort === 'title') {
        filtered = filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      } else if (['year', 'rating', 'runtime'].includes(sort)) {
        filtered = filtered.sort((a, b) => (b[sort] || 0) - (a[sort] || 0));
      }
      // Add more sorting options if needed
    }

    // Pagination
    const pageInt = Math.max(1, parseInt(page));
    const limitInt = Math.max(1, parseInt(limit));
    const start = (pageInt - 1) * limitInt;
    const paginatedData = filtered.slice(start, start + limitInt);

    const result = {
      success: true,
      total: filtered.length,
      page: pageInt,
      limit: limitInt,
      data: {
        movies: paginatedData,
        pagination: {
          currentPage: pageInt,
          totalPages: Math.ceil(filtered.length / limitInt),
          totalCount: filtered.length,
          limit: limitInt
        }
      }
    };

    cache.set(cacheKey, result);
    res.json(result);

  } catch (err) {
    console.error('Error in searchMovies:', err.message);
    next(err);
  }
};

exports.getMovieById = async (req, res, next) => {
  try {
    const id = req.params.id;

    let m = await Movie.findOne({ imdbID: id });
    if (m && !isStale(m)) {
      return res.json({ success: true, data: m });
    }

    const full = await fetchFromOmdbById(id);
    if (full.Response === 'False') {
      return res.status(404).json({ success: false, message: full.Error || 'Movie not found' });
    }

    const updated = {
      imdbID: full.imdbID,
      title: full.Title,
      year: parseInt(full.Year),
      runtime: parseInt(full.Runtime) || 0,
      genre: full.Genre ? full.Genre.split(',').map(g => g.trim()) : [],
      director: full.Director,
      actors: full.Actors ? full.Actors.split(',').map(a => a.trim()) : [],
      plot: full.Plot,
      rating: parseFloat(full.imdbRating) || 0,
      lastFetched: new Date()
    };

    const movie = await Movie.findOneAndUpdate(
      { imdbID: id },
      updated,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: movie });

  } catch (err) {
    console.error('Error in getMovieById:', err.message);
    next(err);
  }
};
