import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const genresList = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller', 'War', 'Western'
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('search') || '');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, totalCount: 0, limit: 12 });

  const sort = searchParams.get('sort') || 'relevance';
  const year = searchParams.get('year') || '';
  const selectedGenres = (searchParams.get('genres') || '').split(',').filter(Boolean);
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr('');
        const params = new URLSearchParams();
        if (q) params.set('search', q);
        if (sort && sort !== 'relevance') params.set('sort', sort);
        if (year) params.set('year', year);
        if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','));
        params.set('page', String(page));
        params.set('limit', '12');

        const res = await fetch(`/api/movies?${params.toString()}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to load movies');
        }
        const data = await res.json();

        if (!data.success) throw new Error(data.message || 'Failed to load movies');

        setMovies(data.data.movies || []);
        setPagination(data.data.pagination || { currentPage: 1, totalPages: 1, totalCount: data.total || 0, limit: 12 });
      } catch (e) {
        setErr(e.message || 'Something went wrong');
        setMovies([]);
        setPagination({ currentPage: 1, totalPages: 0, totalCount: 0, limit: 12 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q, sort, year, selectedGenres.join(','), page]);

  const submitSearch = (e) => {
    e.preventDefault();
    const sp = new URLSearchParams(searchParams);
    if (q) sp.set('search', q);
    else sp.delete('search');
    sp.set('page', '1');
    setSearchParams(sp);
  };

  const onSortChange = (e) => {
    const sp = new URLSearchParams(searchParams);
    if (e.target.value === 'relevance') sp.delete('sort');
    else sp.set('sort', e.target.value);
    sp.set('page', '1');
    setSearchParams(sp);
  };

  const onYearChange = (e) => {
    const sp = new URLSearchParams(searchParams);
    if (e.target.value) sp.set('year', e.target.value);
    else sp.delete('year');
    sp.set('page', '1');
    setSearchParams(sp);
  };

  const toggleGenre = (g) => {
    const set = new Set(selectedGenres);
    if (set.has(g)) set.delete(g);
    else set.add(g);

    const sp = new URLSearchParams(searchParams);
    const val = Array.from(set).join(',');
    if (val) sp.set('genres', val);
    else sp.delete('genres');
    sp.set('page', '1');
    setSearchParams(sp);
  };

  const gotoPage = (p) => {
    const sp = new URLSearchParams(searchParams);
    sp.set('page', String(p));
    setSearchParams(sp);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Search Bar */}
      <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Search movies..."
          value={q}
          onChange={e => setQ(e.target.value)}
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {/* Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-4 card p-4">
          <h3 className="font-semibold mb-2">Sort</h3>
          <select className="input-field w-full" value={sort} onChange={onSortChange}>
            <option value="relevance">Relevance</option>
            <option value="rating">Rating (High to Low)</option>
            <option value="year">Year (New to Old)</option>
            <option value="title">Title (A-Z)</option>
            <option value="popularity">Popularity</option>
          </select>
          <h3 className="font-semibold mt-4 mb-2">Year</h3>
          <input className="input-field w-full" placeholder="e.g. 2019" value={year} onChange={onYearChange} />
        </div>

        {/* Genre Filter Section */}
        <div className="lg:col-span-8 card p-4">
          <h3 className="font-semibold mb-3">Filter by Genres</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {genresList.map(g => (
              <label key={g} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(g)}
                  onChange={() => toggleGenre(g)}
                  className="h-4 w-4"
                />
                <span>{g}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Note: demo API uses the first selected genre server-side.</p>
        </div>
      </div>

      {/* Results */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">Search Results</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      {!loading && movies.length === 0 && <p className="text-gray-600">Try searching for a movie to see results.</p>}
      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
        {movies.map((m) => {
          const title = m.title || m.Title;
          const yearVal = m.year || m.Year;
          const poster = m.poster || m.Poster || 'https://via.placeholder.com/300x450?text=No+Poster';
          const imdbID = m.imdbID || m._id;
          const rating = typeof m.rating !== 'undefined' ? m.rating : m.imdbRating || m.Rating;
          return (
            <div key={`${imdbID}-${title}`} className="movie-card">
              <img src={poster} alt={title} className="movie-poster" />
              <div className="mt-3">
                <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                <p className="text-sm text-gray-600">{yearVal}</p>
                {rating != null && <p className="text-sm text-gray-700 mt-1">IMDb: {rating}</p>}
                <Link to={`/movie/${imdbID}`} className="btn-secondary mt-2 inline-block w-full text-center">
                  Movie Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button to go to stats dashboard */}
      <Link
        to={{
          pathname: '/stats',
          search: `?search=${q}&sort=${sort}&year=${year}&genres=${selectedGenres.join(',')}`
        }}
        className="btn-secondary mt-6 inline-block text-center"
      >
        View Stats Dashboard
      </Link>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center gap-2 mt-6">
          <button
            className="btn-ghost"
            disabled={pagination.currentPage <= 1}
            onClick={() => gotoPage(pagination.currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            className="btn-ghost"
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => gotoPage(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
