import React from 'react';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <div className="border p-2">
      <h2 className="font-semibold">{movie.title} ({movie.year})</h2>
      <p>Rating: {movie.rating}</p>
      <Link to={`/movie/${movie.imdbID}`} className="text-blue-500">
        View Details
      </Link>
    </div>
  );
}
