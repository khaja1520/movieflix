const express = require('express');
const axios = require('axios');
const Movie = require('../models/Movie'); // Movie Model
const router = express.Router();

const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Helper function to normalize movie data
const normalizeMovieData = (movie) => ({
  imdbID: movie.imdbID,
  title: movie.Title,
  year: movie.Year,
  genre: movie.Genre ? movie.Genre.split(', ') : [],
  director: movie.Director,
  actors: movie.Actors ? movie.Actors.split(', ') : [],
  rating: movie.imdbRating ? parseFloat(movie.imdbRating) : null,
  poster: movie.Poster || 'https://via.placeholder.com/300x450?text=No+Poster',
});

// Endpoint to search movies (cached or OMDb)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;

    // Check if the movie data is cached in the DB
    const cachedMovies = await Movie.find({ title: new RegExp(search, 'i') })
      .limit(limit)
      .skip((page - 1) * limit);
    
    if (cachedMovies.length > 0) {
      return res.json({
        success: true,
        data: {
          movies: cachedMovies,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(cachedMovies.length / limit),
            totalCount: cachedMovies.length,
            limit: limit,
          },
        },
      });
    }

    // If not cached, fetch data from OMDb API
    const apiUrl = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${search}&page=${page}`;
    const response = await axios.get(apiUrl);
    const movies = response.data.Search;

    if (!movies) throw new Error('No movies found');

    // Normalize the data and cache it in the database
    const normalizedMovies = movies.map(movie => normalizeMovieData(movie));
    await Movie.insertMany(normalizedMovies, { ordered: false });

    // Respond with normalized data
    res.json({
      success: true,
      data: {
        movies: normalizedMovies,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(response.data.totalResults / limit),
          totalCount: response.data.totalResults,
          limit: limit,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint to get movie details by imdbID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findOne({ imdbID: req.params.id });

    if (movie) {
      return res.json({ success: true, data: movie });
    }

    // If not found in DB, fetch from OMDb API
    const apiUrl = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${req.params.id}`;
    const response = await axios.get(apiUrl);
    const movieData = response.data;

    if (!movieData || movieData.Response === 'False') {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Normalize the movie data
    const normalizedMovie = normalizeMovieData(movieData);

    // Optionally cache it in DB
    await Movie.create(normalizedMovie);

    return res.json({ success: true, data: normalizedMovie });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
