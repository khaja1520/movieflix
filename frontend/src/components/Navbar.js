import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('token');
  let userRole = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.user.role;
    } catch (e) {
      userRole = null;
    }
  }

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">MovieFlix</Link>
      <div className="space-x-4">
        <Link to="/">Home</Link>
        {token && userRole === 'admin' && <Link to="/stats">Stats</Link>}
        {!token && <Link to="/login">Login</Link>}
      </div>
    </nav>
  );
}
