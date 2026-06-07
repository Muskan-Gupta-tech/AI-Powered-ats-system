import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{ background: '#4f46e5', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}> ATS System</span>
        <Link to="/" style={{ color: '#c7d2fe', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/jobs" style={{ color: '#c7d2fe', textDecoration: 'none' }}>Jobs</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 14 }}>Hi, {user?.name}</span>
        <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer' }}>Logout</button>
      </div>
    </nav>
  );
}
