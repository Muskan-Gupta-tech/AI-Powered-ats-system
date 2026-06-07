import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getResumes, uploadResume, deleteResume, searchResumes } from '../services/api';

function ScoreBadge({ score }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const bg = score >= 70 ? '#d1fae5' : score >= 40 ? '#fef3c7' : '#fee2e2';
  return (
    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, borderRadius:'50%', border:`3px solid ${color}`, background:bg, color, fontWeight:700, fontSize:14, flexShrink:0 }}>
      {score}%
    </div>
  );
}

export default function Resumes() {
  const { jobId } = useParams();
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done:0, total:0 });
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef();

  const load = () => getResumes(jobId).then(r => setResumes(r.data));
  useEffect(() => { load(); }, [jobId]);

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    setSelectedFiles(prev => {
      const existingNames = prev.map(f => f.name);
      const unique = pdfs.filter(f => !existingNames.includes(f.name));
      return [...prev, ...unique];
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (name) => setSelectedFiles(prev => prev.filter(f => f.name !== name));

  const cleanName = (filename) => {
    return filename
      .replace(/\.pdf$/i, '')
      .replace(/[_\-\.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setProgress({ done:0, total:selectedFiles.length });

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fd = new FormData();
      fd.append('file', file);
      fd.append('jobId', jobId);
      fd.append('candidateName', cleanName(file.name));
      fd.append('email', `candidate${i+1}@upload.com`);
      try { await uploadResume(fd); } catch(e) { console.error('Failed:', file.name, e); }
      setProgress({ done:i+1, total:selectedFiles.length });
    }

    setSelectedFiles([]);
    setShow(false);
    setUploading(false);
    load();
  };

  const handleSearch = async () => {
    if (!search.trim()) { load(); return; }
    searchResumes(search).then(r => setResumes(r.data));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) { await deleteResume(id); load(); }
  };

  const filtered = resumes.filter(r => {
    if (filter === 'top') return r.atsScore >= 70;
    if (filter === 'mid') return r.atsScore >= 40 && r.atsScore < 70;
    if (filter === 'low') return r.atsScore < 40;
    return true;
  });

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
        <h2>Candidates ({resumes.length})</h2>
        <button className="btn-primary" onClick={() => { setShow(!show); setSelectedFiles([]); }}>
          {show ? 'Cancel' : '+ Upload Resumes'}
        </button>
      </div>

      {show && (
        <div className="card" style={{ marginBottom:24 }}>
          <h2>Bulk Upload Resumes</h2>
          <p style={{ color:'#666', fontSize:13, marginBottom:14 }}>
            Drag & drop multiple PDFs below, or click the zone to pick files. You can add files multiple times — they all stack up before uploading.
          </p>

          {/* DRAG DROP ZONE */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current.click()}
            style={{
              border:`2px dashed ${dragOver ? '#4f46e5' : '#bbb'}`,
              borderRadius:10, padding:'36px 20px', textAlign:'center',
              cursor:'pointer', background: dragOver ? '#ede9fe' : '#f8f9ff',
              marginBottom:16, transition:'all 0.2s'
            }}>
            <div style={{ fontSize:40 }}></div>
            <div style={{ fontWeight:700, fontSize:16, marginTop:8 }}>Drag & Drop PDF files here</div>
            <div style={{ color:'#888', fontSize:13, marginTop:4 }}>or click to browse — hold Ctrl to select multiple files</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              style={{ display:'none' }}
              onChange={handleFileInput}
            />
          </div>

          {/* SELECTED FILES LIST */}
          {selectedFiles.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontWeight:700, color:'#4f46e5' }}>
                  ✅ {selectedFiles.length} file(s) ready to upload
                </div>
                <button onClick={() => setSelectedFiles([])}
                  style={{ background:'none', border:'1px solid #ef4444', color:'#ef4444', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:12 }}>
                  Clear All
                </button>
              </div>
              <div style={{ maxHeight:220, overflowY:'auto', border:'1px solid #e5e7eb', borderRadius:8 }}>
                {selectedFiles.map((f, i) => (
                  <div key={f.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', borderBottom:'1px solid #f5f5f5', fontSize:13 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ color:'#888', width:24 }}>{i+1}.</span>
                      <span></span>
                      <div>
                        <div style={{ fontWeight:600 }}>{cleanName(f.name)}</div>
                        <div style={{ color:'#999', fontSize:11 }}>{f.name}</div>
                      </div>
                    </div>
                    <button onClick={() => removeFile(f.name)}
                      style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:18, lineHeight:1 }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROGRESS BAR */}
          {uploading && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, marginBottom:6, color:'#4f46e5', fontWeight:600 }}>
                Uploading & analyzing {progress.done} of {progress.total}...
              </div>
              <div style={{ background:'#e5e7eb', borderRadius:10, height:14, overflow:'hidden' }}>
                <div style={{
                  background:'linear-gradient(90deg,#4f46e5,#7c3aed)',
                  height:14, borderRadius:10,
                  width:`${(progress.done/progress.total)*100}%`,
                  transition:'width 0.4s ease'
                }} />
              </div>
              <div style={{ fontSize:12, color:'#888', marginTop:4 }}>
                {Math.round((progress.done/progress.total)*100)}% complete
              </div>
            </div>
          )}

          <button
            className="btn-success"
            onClick={handleUploadAll}
            disabled={uploading || selectedFiles.length === 0}
            style={{ fontSize:15, padding:'12px 24px' }}>
            {uploading
              ? ` Analyzing... (${progress.done}/${progress.total})`
              : ` Upload & Analyze All ${selectedFiles.length > 0 ? `(${selectedFiles.length} files)` : ''}`}
          </button>
        </div>
      )}

      {/* TOP CANDIDATES BANNER */}
      {resumes.length >= 2 && (
        <div className="card" style={{ marginBottom:20, background:'linear-gradient(135deg,#ede9fe,#dbeafe)' }}>
          <div style={{ fontWeight:700, marginBottom:12, fontSize:15 }}>🏆 Top Candidates</div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {resumes.slice(0,3).map((r,i) => (
              <div key={r.id} style={{ background:'#fff', borderRadius:8, padding:'10px 16px', display:'flex', alignItems:'center', gap:10, minWidth:180 }}>
                <span style={{ fontSize:24 }}>{['🥇','🥈','🥉'][i]}</span>
                <div>
                  <div style={{ fontWeight:700 }}>{r.candidateName}</div>
                  <div style={{ color:'#10b981', fontWeight:700, fontSize:15 }}>{Math.round(r.atsScore)}% match</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
        <input placeholder="Search by name..." value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key==='Enter' && handleSearch()}
          style={{ flex:1, minWidth:200 }} />
        <button className="btn-primary" onClick={handleSearch}>Search</button>
        <button style={{ background:'#e5e7eb', borderRadius:6, border:'none', padding:'10px 16px', cursor:'pointer' }}
          onClick={() => { setSearch(''); load(); }}>Reset</button>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding:10, borderRadius:6, border:'1px solid #ddd' }}>
          <option value="all">All Candidates</option>
          <option value="top">🟢 Strong (70%+)</option>
          <option value="mid">🟡 Average (40-69%)</option>
          <option value="low">🔴 Weak (below 40%)</option>
        </select>
      </div>

      {/* STATS ROW */}
      {resumes.length > 0 && (
        <div style={{ display:'flex', gap:10, marginBottom:14 }}>
          {[
            { label:'Total', val:resumes.length, color:'#4f46e5' },
            { label:'🟢 Strong', val:resumes.filter(r=>r.atsScore>=70).length, color:'#10b981' },
            { label:'🟡 Average', val:resumes.filter(r=>r.atsScore>=40&&r.atsScore<70).length, color:'#f59e0b' },
            { label:'🔴 Weak', val:resumes.filter(r=>r.atsScore<40).length, color:'#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', borderRadius:8, padding:'8px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', textAlign:'center' }}>
              <div style={{ fontWeight:700, color:s.color, fontSize:22 }}>{s.val}</div>
              <div style={{ fontSize:12, color:'#666' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* CANDIDATES LIST */}
      {filtered.length === 0
        ? <div className="card"><p style={{ color:'#999' }}>No resumes found.</p></div>
        : filtered.map((r,i) => (
          <div key={r.id} className="card" style={{
            display:'flex', gap:16, alignItems:'flex-start', marginBottom:12,
            borderLeft:`4px solid ${r.atsScore>=70?'#10b981':r.atsScore>=40?'#f59e0b':'#ef4444'}`
          }}>
            <div style={{ fontWeight:700, fontSize:16, color:'#bbb', width:28, paddingTop:16 }}>#{i+1}</div>
            <ScoreBadge score={Math.round(r.atsScore)} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:16 }}>{r.candidateName}</div>
              <div style={{ color:'#888', fontSize:13 }}>{r.email} · {r.fileName}</div>
              <div style={{ marginTop:8 }}>
                <strong style={{ fontSize:13 }}>Matched Skills: </strong>
                {r.extractedSkills
                  ? r.extractedSkills.split(',').map((s,idx) => (
                    <span key={idx} style={{ background:'#d1fae5', color:'#065f46', borderRadius:10, padding:'2px 8px', fontSize:12, marginRight:4, display:'inline-block', marginTop:3 }}>
                      {s.trim()}
                    </span>
                  ))
                  : <span style={{ color:'#999', fontSize:13 }}>None detected</span>
                }
              </div>
            </div>
            <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
              <span style={{ fontSize:11, color:'#bbb' }}>{new Date(r.uploadedAt).toLocaleDateString()}</span>
              <button className="btn-danger" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => handleDelete(r.id)}>Delete</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}