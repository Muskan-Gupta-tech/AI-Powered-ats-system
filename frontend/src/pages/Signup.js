import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/api';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      setSuccess('Registered! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) { setError(err.response?.data?.error || 'Error'); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f4f6fb' }}>
      <div className="card" style={{ width: 380 }}>
        <h2 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: 24 }}>Create Account</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <input placeholder="Company (optional)" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
          {error && <div className="error">{error}</div>}
          {success && <div style={{ color: '#10b981', fontSize: 13 }}>{success}</div>}
          <button className="btn-primary" type="submit">Sign Up</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          Have account? <Link to="/login" style={{ color: '#4f46e5' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
