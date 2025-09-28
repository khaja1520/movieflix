// controllers/statsController.js

const Movie = require('../models/Movie'); // Assuming you're using Mongoose for MongoDB

// Get genre distribution
exports.genresStats = async (req, res, next) => {
  try {
    const { search, year, genres } = req.query;

    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' }; // Case-insensitive
    if (year) query.year = parseInt(year, 10); // Ensure year is a number
    if (genres) query.genre = { $in: genres.split(',') }; // Handle multiple genres

    // Aggregation pipeline
    const pipeline = [
      { $match: query },
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];

    const rows = await Movie.aggregate(pipeline);
    const total = rows.reduce((a, b) => a + b.count, 0);
    const data = rows.map(r => ({
      genre: r._id,
      count: r.count,
      percentage: total ? Number(((r.count / total) * 100).toFixed(2)) : 0
    }));

    res.json({ success: true, data });
  } catch (e) {
    console.error("Error:", e);
    next(e);
  }
};

// Get ratings by genre
exports.ratingsByGenre = async (req, res, next) => {
  try {
    const { search, year, genres } = req.query;

    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (year) query.year = parseInt(year, 10);
    if (genres) query.genre = { $in: genres.split(',') };

    const pipeline = [
      { $match: query },
      { $group: { _id: '$genre', averageRating: { $avg: '$rating' } } },
      { $sort: { averageRating: -1 } }
    ];

    const rows = await Movie.aggregate(pipeline);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("Error:", e);
    next(e);
  }
};

// Get average runtime by year
exports.runtimeByYear = async (req, res, next) => {
  try {
    const { search, year, genres } = req.query;

    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (year) query.year = parseInt(year, 10);
    if (genres) query.genre = { $in: genres.split(',') };

    const pipeline = [
      { $match: query },
      { $group: { _id: '$year', averageRuntime: { $avg: '$runtime' } } },
      { $sort: { _id: 1 } }
    ];

    const rows = await Movie.aggregate(pipeline);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("Error:", e);
    next(e);
  }
};
