const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const movieController = require('../controllers/movieController');
const auth = require('../middleware/auth');

// Validation middleware
const searchValidation = [
  body('search').optional().isLength({ min: 1 }).trim(),
  body('page').optional().isInt({ min: 1 }),
  body('limit').optional().isInt({ min: 1, max: 50 })
];

// Public routes
/**
 * @route   GET /api/movies
 * @desc    Search movies with filtering, sorting, and pagination
 * @access  Public
 * @params  search, sort, filter, page, limit, year, type
 */
router.get('/', movieController.searchMovies);

/**
 * @route   GET /api/movies/popular
 * @desc    Get popular movies
 * @access  Public
 */
router.get('/popular', movieController.getPopularMovies);

/**
 * @route   GET /api/movies/:id
 * @desc    Get movie details by ID
 * @access  Public
 */
router.get('/:id', movieController.getMovieDetails);

/**
 * @route   GET /api/movies/export/csv
 * @desc    Export movies as CSV
 * @access  Public
 */
router.get('/export/csv', movieController.exportMoviesCSV);

// Protected routes (Admin only)
/**
 * @route   POST /api/movies/:id/refresh
 * @desc    Refresh movie cache
 * @access  Private (Admin)
 */
router.post('/:id/refresh', auth, movieController.refreshMovieCache);

/**
 * @route   DELETE /api/movies/cache/expired
 * @desc    Clear expired cache entries
 * @access  Private (Admin)
 */
router.delete('/cache/expired', auth, movieController.clearExpiredCache);

module.exports = router;