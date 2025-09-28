import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import useParams and Link

const MovieDetails = () => {
  const { id } = useParams(); // expects route: /movie/:id (imdbID)
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await fetch(`/api/movies/${id}`);
        const data = await res.json();

        if (!data?.success) throw new Error(data?.message || 'Failed to fetch');
        
        setMovie(data.data); // Assuming `data.data` contains the movie information
      } catch (e) {
        setErr(e.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) return <div className="p-6 text-gray-700">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!movie) return <div className="p-6">No movie found</div>;

  const imdbUrl = movie.imdbID ? `https://www.imdb.com/title/${movie.imdbID}/` : null;
  const ottQuery = movie.title ? `https://www.justwatch.com/in/search?q=${encodeURIComponent(movie.title)}` : null;

  const ratingBadge = (r) => {
    if (!r && r !== 0) return 'rating-average';
    if (r >= 8) return 'rating-excellent';
    if (r >= 7) return 'rating-good';
    if (r >= 5) return 'rating-average';
    return 'rating-poor';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Movie Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <img
            src={movie.poster && movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/400x600?text=No+Poster'}
            alt={movie.title}
            className="w-full rounded-lg shadow-md object-cover"
            loading="lazy"
          />
          <div className="mt-4 flex gap-3">
            {imdbUrl && (
              <a
                href={imdbUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full text-center"
                aria-label="Open IMDb page"
              >
                Open IMDb
              </a>
            )}
            {ottQuery && (
              <a
                href={ottQuery}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary w-full text-center"
                aria-label="Find movie on OTT platforms"
              >
                Find on OTT
              </a>
            )}
          </div>
        </div>

        {/* Movie Information Section */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{movie.title}</h1>
          
          {/* Year Section */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Year</h2>
            <p className="text-gray-600">{movie.year}</p>
          </section>

          {/* Genre Section */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Genre</h2>
            <div className="text-gray-600">
              {Array.isArray(movie.genre) && movie.genre.length > 0
                ? movie.genre.join(', ')
                : 'N/A'}
            </div>
          </section>

          {/* Runtime Section */}
          {movie.runtime && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Runtime</h2>
              <p className="text-gray-600">{movie.runtime} minutes</p>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {typeof movie.imdbRating !== 'undefined' && movie.imdbRating !== null && (
              <span className={`rating-badge ${ratingBadge(movie.imdbRating)}`}>
                IMDb {movie.imdbRating}
              </span>
            )}
          </div>

          {/* Plot Section */}
          {movie.plot && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Plot</h2>
              <p className="text-gray-800 leading-relaxed">{movie.plot}</p>
            </section>
          )}

          {/* Cast, Director, Writer, Languages Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4">
              <h3 className="font-semibold mb-2">Cast</h3>
              <p className="text-gray-700">
                {Array.isArray(movie.actors) && movie.actors.length
                  ? movie.actors.join(', ')
                  : 'N/A'}
              </p>
            </div>
            <div className="card p-4">
              <h3 className="font-semibold mb-2">Director</h3>
              <p className="text-gray-700">{movie.director || 'N/A'}</p>
            </div>
            <div className="card p-4">
              <h3 className="font-semibold mb-2">Writer</h3>
              <p className="text-gray-700">
                {movie.writer && typeof movie.writer === 'string'
                  ? movie.writer
                  : 'N/A'}
              </p>
            </div>
            <div className="card p-4">
              <h3 className="font-semibold mb-2">Languages</h3>
              <p className="text-gray-700">
                {Array.isArray(movie.language) && movie.language.length
                  ? movie.language.join(', ')
                  : 'N/A'}
              </p>
            </div>
          </section>

          {/* Back Button */}
          <div className="mt-6">
            <Link to="/" className="btn-ghost">← Back to search</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
