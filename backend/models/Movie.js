const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  imdbID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  rated: String,
  released: Date,
  runtime: {
    type: String,
    index: true
  },
  runtimeMinutes: {
    type: Number,
    index: true
  },
  genre: [{
    type: String,
    index: true
  }],
  director: String,
  writer: String,
  actors: [String],
  plot: String,
  language: [String],
  country: [String],
  awards: String,
  poster: String,
  ratings: [{
    source: String,
    value: String
  }],
  imdbRating: {
    type: Number,
    index: true
  },
  imdbVotes: String,
  type: {
    type: String,
    enum: ['movie', 'series', 'episode'],
    default: 'movie',
    index: true
  },
  dvd: Date,
  boxOffice: String,
  production: String,
  website: String,
  
  // Cache-related fields
  lastFetched: {
    type: Date,
    default: Date.now,
    index: true
  },
  cacheExpiry: {
    type: Date,
    default: function() {
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + (parseInt(process.env.CACHE_EXPIRY_HOURS) || 24));
      return expiry;
    },
    index: true
  },
  
  // Additional metadata
  popularity: {
    type: Number,
    default: 0
  },
  searchCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
movieSchema.index({ title: 'text', plot: 'text' });
movieSchema.index({ genre: 1, year: 1 });
movieSchema.index({ imdbRating: -1 });
movieSchema.index({ year: -1 });
movieSchema.index({ cacheExpiry: 1 });

// Virtual for checking if cache is expired
movieSchema.virtual('isCacheExpired').get(function() {
  return new Date() > this.cacheExpiry;
});

// Method to update cache timestamp
movieSchema.methods.updateCache = function() {
  this.lastFetched = new Date();
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + (parseInt(process.env.CACHE_EXPIRY_HOURS) || 24));
  this.cacheExpiry = expiry;
  return this.save();
};

// Method to increment search count
movieSchema.methods.incrementSearchCount = function() {
  this.searchCount += 1;
  this.popularity += 1;
  return this.save();
};

// Static method to find expired cache entries
movieSchema.statics.findExpiredCache = function() {
  return this.find({
    cacheExpiry: { $lt: new Date() }
  });
};

// Static method to cleanup expired cache
movieSchema.statics.cleanupExpiredCache = function() {
  return this.deleteMany({
    cacheExpiry: { $lt: new Date() }
  });
};

// Pre-save middleware to normalize data
movieSchema.pre('save', function(next) {
  // Normalize genre array
  if (this.genre && typeof this.genre === 'string') {
    this.genre = this.genre.split(',').map(g => g.trim());
  }
  
  // Extract runtime in minutes
  if (this.runtime && !this.runtimeMinutes) {
    const match = this.runtime.match(/(\d+)/);
    if (match) {
      this.runtimeMinutes = parseInt(match[1]);
    }
  }
  
  // Convert IMDb rating to number
  if (this.imdbRating && typeof this.imdbRating === 'string') {
    const rating = parseFloat(this.imdbRating);
    if (!isNaN(rating)) {
      this.imdbRating = rating;
    }
  }
  
  // Parse release date
  if (this.released && typeof this.released === 'string') {
    const date = new Date(this.released);
    if (!isNaN(date.getTime())) {
      this.released = date;
    }
  }
  
  next();
});

module.exports = mongoose.model('Movie', movieSchema);