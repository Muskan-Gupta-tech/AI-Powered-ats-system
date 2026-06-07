import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      loginUser(res.data);
      navigate('/');
    } catch { setError('Invalid credentials'); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f4f6fb' }}>
      <div className="card" style={{ width: 380 }}>
        <h2 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: 24 }}> ATS Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          {error && <div className="error">{error}</div>}
          <button className="btn-primary" type="submit">Login</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          No account? <Link to="/signup" style={{ color: '#4f46e5' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
