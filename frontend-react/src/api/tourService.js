import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export const uploadAndRunTour = async (data) => {
  const res = await axios.post(`${API_BASE}/optimize`, data);
  return res.data; 
};
