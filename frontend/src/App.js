import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import StatsDashboard from './pages/StatsDashboard';
import MovieDetails from './pages/MovieDetails'; // Add MovieDetails component import
import './styles/global.css';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token'); // Check if the token exists

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <nav className="flex gap-6 items-center">
        <Link to="/" className="hover:text-yellow-400 font-semibold">MovieFlix</Link>
        {isLoggedIn && <Link to="/stats" className="hover:text-yellow-400">Stats</Link>}
      </nav>
      <div>
        {isLoggedIn ? (
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        ) : (
          <Link to="/login" className="btn-primary">Login</Link>
        )}
      </div>
    </header>
  );
};

function App() {
  return (
    <Router>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/stats" element={<StatsDashboard />} />
          <Route path="/movie/:id" element={<MovieDetails />} /> {/* Add Movie Details route */}
          <Route path="*" element={<p className="p-4">Page Not Found</p>} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
