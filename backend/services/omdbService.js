const axios = require('axios');

class OMDbService {
  constructor() {
    this.apiKey = process.env.OMDB_API_KEY;
    this.baseURL = 'http://www.omdbapi.com/';
    
    if (!this.apiKey) {
      console.warn('Warning: OMDB_API_KEY not found in environment variables');
    }
  }

  // Search movies by title
  async searchMovies(title, page = 1, type = 'movie') {
    try {
      if (!this.apiKey) {
        throw new Error('OMDb API key is not configured');
      }

      const response = await axios.get(this.baseURL, {
        params: {
          apikey: this.apiKey,
          s: title,
          page: page,
          type: type
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data.Error) {
        throw new Error(response.data.Error);
      }

      return response.data;
    } catch (error) {
      console.error('OMDb search error:', error.message);
      throw error;
    }
  }

  // Get detailed movie information by IMDb ID
  async getMovieDetails(imdbID) {
    try {
      if (!this.apiKey) {
        throw new Error('OMDb API key is not configured');
      }

      const response = await axios.get(this.baseURL, {
        params: {
          apikey: this.apiKey,
          i: imdbID,
          plot: 'full'
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data.Error) {
        throw new Error(response.data.Error);
      }

      // Transform the response to match our schema
      const movieData = this.transformMovieData(response.data);
      return movieData;
    } catch (error) {
      console.error('OMDb details error:', error.message);
      throw error;
    }
  }

  // Get movie by title (more specific search)
  async getMovieByTitle(title, year = null) {
    try {
      if (!this.apiKey) {
        throw new Error('OMDb API key is not configured');
      }

      const params = {
        apikey: this.apiKey,
        t: title,
        plot: 'full'
      };

      if (year) {
        params.y = year;
      }

      const response = await axios.get(this.baseURL, params);

      if (response.data.Error) {
        throw new Error(response.data.Error);
      }

      const movieData = this.transformMovieData(response.data);
      return movieData;
    } catch (error) {
      console.error('OMDb title search error:', error.message);
      throw error;
    }
  }

  // Transform OMDb API response to match our database schema
  transformMovieData(omdbData) {
    try {
      const transformed = {
        imdbID: omdbData.imdbID,
        title: omdbData.Title,
        year: parseInt(omdbData.Year) || null,
        rated: omdbData.Rated !== 'N/A' ? omdbData.Rated : null,
        released: omdbData.Released !== 'N/A' ? new Date(omdbData.Released) : null,
        runtime: omdbData.Runtime !== 'N/A' ? omdbData.Runtime : null,
        genre: omdbData.Genre && omdbData.Genre !== 'N/A' 
          ? omdbData.Genre.split(',').map(g => g.trim()) 
          : [],
        director: omdbData.Director !== 'N/A' ? omdbData.Director : null,
        writer: omdbData.Writer !== 'N/A' ? omdbData.Writer : null,
        actors: omdbData.Actors && omdbData.Actors !== 'N/A' 
          ? omdbData.Actors.split(',').map(a => a.trim()) 
          : [],
        plot: omdbData.Plot !== 'N/A' ? omdbData.Plot : null,
        language: omdbData.Language && omdbData.Language !== 'N/A' 
          ? omdbData.Language.split(',').map(l => l.trim()) 
          : [],
        country: omdbData.Country && omdbData.Country !== 'N/A' 
          ? omdbData.Country.split(',').map(c => c.trim()) 
          : [],
        awards: omdbData.Awards !== 'N/A' ? omdbData.Awards : null,
        poster: omdbData.Poster !== 'N/A' ? omdbData.Poster : null,
        ratings: this.transformRatings(omdbData.Ratings),
        imdbRating: omdbData.imdbRating !== 'N/A' ? parseFloat(omdbData.imdbRating) : null,
        imdbVotes: omdbData.imdbVotes !== 'N/A' ? omdbData.imdbVotes : null,
        type: omdbData.Type || 'movie',
        dvd: omdbData.DVD !== 'N/A' ? new Date(omdbData.DVD) : null,
        boxOffice: omdbData.BoxOffice !== 'N/A' ? omdbData.BoxOffice : null,
        production: omdbData.Production !== 'N/A' ? omdbData.Production : null,
        website: omdbData.Website !== 'N/A' ? omdbData.Website : null
      };

      // Extract runtime in minutes
      if (transformed.runtime) {
        const match = transformed.runtime.match(/(\d+)/);
        if (match) {
          transformed.runtimeMinutes = parseInt(match[1]);
        }
      }

      return transformed;
    } catch (error) {
      console.error('Data transformation error:', error);
      throw new Error('Failed to transform movie data');
    }
  }

  // Transform ratings array
  transformRatings(ratings) {
    if (!ratings || !Array.isArray(ratings)) {
      return [];
    }

    return ratings.map(rating => ({
      source: rating.Source,
      value: rating.Value
    }));
  }

  // Get multiple movie details by IMDb IDs
  async getMultipleMovieDetails(imdbIDs) {
    try {
      const promises = imdbIDs.map(id => this.getMovieDetails(id));
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Failed to fetch movie ${imdbIDs[index]}:`, result.reason);
          return null;
        }
      }).filter(movie => movie !== null);
    } catch (error) {
      console.error('Multiple movie details error:', error);
      throw error;
    }
  }

  // Check API key validity
  async validateAPIKey() {
    try {
      await this.searchMovies('test', 1);
      return true;
    } catch (error) {
      if (error.message.includes('Invalid API key')) {
        return false;
      }
      // Other errors don't necessarily mean invalid key
      return true;
    }
  }

  // Get API usage info (if available)
  async getAPIUsage() {
    // OMDb doesn't provide usage endpoint, but we can track requests
    // This could be implemented with a local counter or database tracking
    return {
      message: 'Usage tracking not available with OMDb API'
    };
  }
}

module.exports = new OMDbService();