import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs, getResumes } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ totalResumes: 0, avgScore: 0, topCandidates: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getJobs().then(async res => {
      setJobs(res.data);
      let total = 0, scoreSum = 0, top = 0;
      for (const job of res.data) {
        const r = await getResumes(job.id);
        total += r.data.length;
        r.data.forEach(rv => { scoreSum += rv.atsScore; if (rv.atsScore >= 70) top++; });
      }
      setStats({ totalResumes: total, avgScore: total ? Math.round(scoreSum / total) : 0, topCandidates: top });
    });
  }, []);

  const box = (label, val, color) => (
    <div className="card" style={{ textAlign: 'center', borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{val}</div>
      <div style={{ color: '#666', marginTop: 6, fontSize: 14 }}>{label}</div>
    </div>
  );

  return (
    <div className="page">
      <h2>Welcome back, {user?.name} </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 30 }}>
        {box('Total Jobs', jobs.length, '#4f46e5')}
        {box('Total Resumes', stats.totalResumes, '#10b981')}
        {box('Top Candidates (≥70%)', stats.topCandidates, '#f59e0b')}
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2>Recent Jobs</h2>
          <button className="btn-primary" onClick={() => navigate('/jobs')}>+ Add Job</button>
        </div>
        {jobs.length === 0 ? <p style={{ color: '#999' }}>No jobs yet. Create one!</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px' }}>Title</th>
              <th style={{ padding: '10px 12px' }}>Required Skills</th>
              <th style={{ padding: '10px 12px' }}>Action</th>
            </tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{j.title}</td>
                  <td style={{ padding: '10px 12px', color: '#555', fontSize: 13 }}>{j.requiredSkills}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button className="btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => navigate(`/resumes/${j.id}`)}>View Resumes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
