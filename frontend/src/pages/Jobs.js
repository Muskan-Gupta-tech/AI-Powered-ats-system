import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs, createJob, deleteJob } from '../services/api';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', requiredSkills: '' });
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const load = () => getJobs().then(r => setJobs(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createJob(form);
    setForm({ title: '', description: '', requiredSkills: '' });
    setShow(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job?')) { await deleteJob(id); load(); }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2>Job Descriptions</h2>
        <button className="btn-primary" onClick={() => setShow(!show)}>{show ? 'Cancel' : '+ New Job'}</button>
      </div>

      {show && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2>Create Job</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input placeholder="Job Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <textarea placeholder="Job Description" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
            <input placeholder="Required Skills (comma separated, e.g. java, react, sql)" value={form.requiredSkills} onChange={e => setForm({...form, requiredSkills: e.target.value})} required />
            <button className="btn-success" type="submit" style={{ alignSelf: 'flex-start' }}>Save Job</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {jobs.length === 0 ? <div className="card"><p style={{ color: '#999' }}>No jobs found.</p></div> :
          jobs.map(j => (
            <div key={j.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{j.title}</div>
                <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{j.description}</div>
                <div style={{ marginTop: 8 }}>
                  {j.requiredSkills?.split(',').map((s, i) => (
                    <span key={i} style={{ background: '#ede9fe', color: '#5b21b6', borderRadius: 12, padding: '3px 10px', fontSize: 12, marginRight: 6 }}>{s.trim()}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0, marginLeft: 16 }}>
                <button className="btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => navigate(`/resumes/${j.id}`)}>Resumes</button>
                <button className="btn-danger" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => handleDelete(j.id)}>Delete</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
