import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const login = (data) => API.post('/auth/login', data);
export const signup = (data) => API.post('/auth/signup', data);

export const getJobs = () => API.get('/jobs');
export const createJob = (data) => API.post('/jobs', data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);

export const uploadResume = (formData) => API.post('/resumes/upload', formData);
export const getResumes = (jobId) => API.get(`/resumes/job/${jobId}`);
export const searchResumes = (name) => API.get(`/resumes/search?name=${name}`);
export const deleteResume = (id) => API.delete(`/resumes/${id}`);
