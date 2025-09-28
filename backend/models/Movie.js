const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  imdbID: { type: String, unique: true },
  title: String,
  year: String,
  genre: [String],
  director: String,
  actors: [String],
  rating: Number,
  poster: String,
  fetchedAt: { type: Date, default: Date.now },
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
