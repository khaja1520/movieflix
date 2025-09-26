import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Components
import SearchBar from '../components/Dashboard/SearchBar';
import MoviesList from '../components/Dashboard/MoviesList';
import FilterSort from '../components/Dashboard/FilterSort';
import Pagination from '../components/Dashboard/Pagination';
import Loading from '../components/Common/Loading';
import ErrorMessage from '../components/Common/ErrorMessage';

// Services
import { searchMovies, getPopularMovies } from '../services/api';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });

  // Get search parameters from URL
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const sortBy = searchParams.get('sort') || 'relevance';
  const filterBy = searchParams.get('filter') || '';
  const yearFilter = searchParams.get('year') || '';

  // Load movies on component mount and when search params change
  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      loadPopularMovies();
    }
  }, [searchQuery, currentPage, sortBy, filterBy, yearFilter]);

  // Handle search
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchQuery,
        page: currentPage,
        limit: 10,
        sort: sortBy
      };

      if (filterBy) params.filter = filterBy;
      if (yearFilter) params.year = yearFilter;

      const response = await searchMovies(params);
      
      if (response.success) {
        setMovies(response.data.movies);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to search movies');
        toast.error('Failed to search movies');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching');
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Load popular movies
  const loadPopularMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPopularMovies({ limit: 20 });
      
      if (response.success) {
        setMovies(response.data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: response.data.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 20
        });
      } else {
        setError('Failed to load popular movies');
      }
    } catch (err) {
      console.error('Popular movies error:', err);
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearchSubmit = (query) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      newSearchParams.set('search', query.trim());
      newSearchParams.set('page', '1'); // Reset to first page
    } else {
      newSearchParams.delete('search');
      newSearchParams.delete('page');
    }
    setSearchParams(newSearchParams);
  };

  // Handle sorting
  const handleSort = (sortOption) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', sortOption);
    newSearchParams.set('page', '1'); // Reset to first page
    setSearchParams(newSearchParams);
  };

  // Handle filtering
  const handleFilter = (filterOption, year = '') => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (filterOption) {
      newSearchParams.set('filter', filterOption);
    } else {
      newSearchParams.delete('filter');
    }
    
    if (year) {
      newSearchParams.set('year', year);
    } else {
      newSearchParams.delete('year');
    }
    
    newSearchParams.set('page', '1'); // Reset to first page
    setSearchParams(newSearchParams);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Movie Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover, search, and explore movies with advanced filtering and analytics
        </p>
      </div>

      {/* Search and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Search Bar */}
          <div className="lg:col-span-6">
            <SearchBar
              initialQuery={searchQuery}
              onSearch={handleSearchSubmit}
              placeholder="Search movies by title..."
            />
          </div>

          {/* Filter and Sort Controls */}
          <div className="lg:col-span-4">
            <FilterSort
              currentSort={sortBy}
              currentFilter={filterBy}
              currentYear={yearFilter}
              onSort={handleSort}
              onFilter={handleFilter}
            />
          </div>

          {/* Clear Filters */}
          <div className="lg:col-span-2">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {!loading && movies.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {searchQuery ? (
              <>
                Showing {movies.length} of {pagination.totalCount} results for "{searchQuery}"
              </>
            ) : (
              <>Showing {movies.length} popular movies</>
            )}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && <Loading />}

      {/* Error State */}
      {error && !loading && (
        <ErrorMessage 
          message={error} 
          onRetry={() => searchQuery ? handleSearch() : loadPopularMovies()}
        />
      )}

      {/* Movies List */}
      {!loading && !error && (
        <>
          <MoviesList movies={movies} />
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
              />
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && !error && movies.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No movies found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search terms or filters
          </p>
          <div className="mt-6">
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;