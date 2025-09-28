import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto'; // Importing Chart.js

const StatsDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [moviesData, setMoviesData] = useState([]);
  const [genresDistribution, setGenresDistribution] = useState({});
  const [avgRatingsByGenre, setAvgRatingsByGenre] = useState({});
  const [avgRuntimeByYear, setAvgRuntimeByYear] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const search = queryParams.get('search') || '';
        const genres = queryParams.get('genres') || '';
        const year = queryParams.get('year') || '';
        const sort = queryParams.get('sort') || 'relevance';
        const page = queryParams.get('page') || 1;

        // Fetch movies with the current query params
        const response = await fetch(`/api/movies?search=${search}&genres=${genres}&year=${year}&sort=${sort}&page=${page}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to load movies');
        }

        setMoviesData(data.data.movies);

        // Process the data for different charts
        processGenresDistribution(data.data.movies);
        processAvgRatingsByGenre(data.data.movies);
        processAvgRuntimeByYear(data.data.movies);
      } catch (error) {
        console.error('Error fetching movie data:', error);
      }
    };

    fetchData();
  }, [location.search]);

  const processGenresDistribution = (movies) => {
    const genreCount = {};
    movies.forEach((movie) => {
      movie.genre.forEach((genre) => {
        genreCount[genre] = genreCount[genre] ? genreCount[genre] + 1 : 1;
      });
    });

    setGenresDistribution(genreCount);
    renderPieChart(genreCount);
  };

  const processAvgRatingsByGenre = (movies) => {
    const ratingsByGenre = {};
    movies.forEach((movie) => {
      movie.genre.forEach((genre) => {
        if (!ratingsByGenre[genre]) {
          ratingsByGenre[genre] = { sum: 0, count: 0 };
        }
        ratingsByGenre[genre].sum += movie.rating || 0;
        ratingsByGenre[genre].count += 1;
      });
    });

    const avgRatings = {};
    for (const genre in ratingsByGenre) {
      avgRatings[genre] = ratingsByGenre[genre].sum / ratingsByGenre[genre].count;
    }

    setAvgRatingsByGenre(avgRatings);
    renderBarChart(avgRatings);
  };

  const processAvgRuntimeByYear = (movies) => {
    const runtimeByYear = {};
    movies.forEach((movie) => {
      const year = movie.year;
      if (!runtimeByYear[year]) {
        runtimeByYear[year] = { sum: 0, count: 0 };
      }
      runtimeByYear[year].sum += movie.runtime || 0;
      runtimeByYear[year].count += 1;
    });

    const avgRuntime = {};
    for (const year in runtimeByYear) {
      avgRuntime[year] = runtimeByYear[year].sum / runtimeByYear[year].count;
    }

    setAvgRuntimeByYear(avgRuntime);
    renderLineChart(avgRuntime);
  };

  const renderPieChart = (data) => {
    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', '#36A2EB'],
        }],
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false, // Let it resize freely based on container
      }
    });
  };

  const renderBarChart = (data) => {
    const ctx = document.getElementById('barChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Average Rating by Genre',
          data: Object.values(data),
          backgroundColor: '#FF6384',
        }],
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
      }
    });
  };

  const renderLineChart = (data) => {
    const ctx = document.getElementById('lineChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Average Runtime by Year',
          data: Object.values(data),
          fill: false,
          borderColor: '#36A2EB',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  };

  return (
    <div className="stats-dashboard">
      <h2>Stats Dashboard</h2>

      {/* Genres' Distribution Pie Chart */}
      <div className="chart-container">
        <h3>Genres' Distribution</h3>
        <canvas id="pieChart"></canvas>
      </div>

      {/* Average Ratings by Genre Bar Chart */}
      <div className="chart-container">
        <h3>Average Ratings by Genre</h3>
        <canvas id="barChart"></canvas>
      </div>

      {/* Average Runtime by Year Line Chart */}
      <div className="chart-container">
        <h3>Average Runtime by Year</h3>
        <canvas id="lineChart"></canvas>
      </div>

      {!moviesData.length && <p>No stats available at the moment.</p>}
    </div>
  );
};

export default StatsDashboard;
