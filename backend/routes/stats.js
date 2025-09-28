const express = require('express');
const Movie = require('../models/Movie'); // Movie Model
const router = express.Router();

// Endpoint to get aggregated stats
router.get('/', async (req, res) => {
  try {
    // Count occurrences of genres
    const genreCount = await Movie.aggregate([
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Calculate average rating of all searched movies
    const averageRating = await Movie.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    // Calculate average runtime grouped by release year (assuming this is a field)
    const averageRuntimeByYear = await Movie.aggregate([
      { $group: { _id: '$year', avgRuntime: { $avg: '$runtime' } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      genreCount,
      averageRating: averageRating[0]?.avgRating || 0,
      averageRuntimeByYear,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
