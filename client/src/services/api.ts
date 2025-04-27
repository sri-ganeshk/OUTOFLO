import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication
export const login = (email: string, password: string) => {
  return api.post('/auth/login', { email, password });
};

export const signup = (email: string, password: string, name: string) => {
  return api.post('/auth/signup', { email, password, name });
};

// Campaigns
export const getCampaigns = () => {
  return api.get('/campaigns');
};

export const getCampaign = (id: string) => {
  return api.get(`/campaigns/${id}`);
};

export const createCampaign = (campaign: { name: string; description: string; status: string; leads: string[] }) => {
  return api.post('/campaigns', campaign);
};

export const updateCampaign = (id: string, campaign: { name: string; description: string; leads: string[] }) => {
  return api.put(`/campaigns/${id}`, campaign);
};

export const deleteCampaign = (id: string) => {
  return api.delete(`/campaigns/${id}`);
};

// User profile
export const getUserProfile = () => {
  return api.get('/user/profile');
};

// Personalized Message
export const generateMessage = (data: { 
  profileData: { 
    name?: string; 
    job_title?: string; 
    company?: string; 
    location?: string; 
    summary?: string;
    profileUrl?: string;
    headline?: string;
    about?: string;
    experience?: {
      title?: string;
      company?: string;
    };
  };
  campaignData: {
    name: string;
    description: string;
  };

}) => {
  return api.post('/personalized-message', data);
};

export default api;