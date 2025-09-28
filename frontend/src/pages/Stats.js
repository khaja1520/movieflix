// Stats.js
import React, { useEffect, useState } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../services/auth'; // simple helper from auth.js
 
ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement
);
 
const palette = [
  '#60a5fa','#34d399','#f59e0b','#a78bfa','#f472b6',
  '#f87171','#22d3ee','#4ade80','#fb7185','#93c5fd',
];
 
const Stats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [genres, setGenres] = useState([]);        // [{genre, count, percentage}]
  const [ratings, setRatings] = useState([]);      // [{genre, averageRating, movieCount}]
  const [runtime, setRuntime] = useState([]);      // [{year, averageRuntime, movieCount}]
 
  useEffect(() => {
    // Protect route behind mock admin
    if (!isAdmin()) {
      navigate('/login?next=/stats');
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setErr('');
        const [gRes, rRes, tRes] = await Promise.all([
          fetch('/api/stats/genres'),
          fetch('/api/stats/ratings'),
          fetch('/api/stats/runtime'),
        ]);
        const [g, r, t] = await Promise.all([gRes.json(), rRes.json(), tRes.json()]);
        if (!g.success) throw new Error(g.message || 'Genres fetch failed');
        if (!r.success) throw new Error(r.message || 'Ratings fetch failed');
        if (!t.success) throw new Error(t.message || 'Runtime fetch failed');
        setGenres(g.data || []);
        setRatings(r.data || []);
        setRuntime(t.data || []);
      } catch (e) {
        setErr(e.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);
 
  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
 
  // Pie: Genres Distribution
  const genresData = {
    labels: genres.map(x => x.genre),
    datasets: [{
      data: genres.map(x => x.count),
      backgroundColor: genres.map((_, i) => palette[i % palette.length]),
      borderWidth: 1,
    }],
  };
 
  // Bar: Average Ratings by Genre
  const ratingsData = {
    labels: ratings.map(x => x.genre),
    datasets: [{
      label: 'Avg Rating',
      data: ratings.map(x => Number(x.averageRating || 0).toFixed(2)),
      backgroundColor: '#60a5fa',
    }],
  };
 
  // Line: Average Runtime by Year
  const runtimeData = {
    labels: runtime.map(x => x.year),
    datasets: [{
      label: 'Avg Runtime (min)',
      data: runtime.map(x => x.averageRuntime || 0),
      borderColor: '#34d399',
      backgroundColor: 'rgba(52, 211, 153, 0.2)',
      tension: 0.2,
      fill: true,
    }],
  };
 
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Statistics Dashboard</h1>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4">
          <h2 className="font-semibold mb-4">Genres Distribution</h2>
          <div className="chart-container">
            <Pie data={genresData} />
          </div>
        </div>
 
        <div className="card p-4 lg:col-span-2">
          <h2 className="font-semibold mb-4">Average Ratings by Genre</h2>
          <div className="chart-container">
            <Bar data={ratingsData} options={{ scales: { y: { min: 0, max: 10 }}}} />
          </div>
        </div>
 
        <div className="card p-4 lg:col-span-3">
          <h2 className="font-semibold mb-4">Average Runtime by Year</h2>
          <div className="chart-container">
            <Line data={runtimeData} />
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Stats;
 