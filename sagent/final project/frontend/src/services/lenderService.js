import api from './api';

export const fetchLenderSpaces = async () => {
  const { data } = await api.get('/lender/spaces');
  return data.data;
};

export const fetchLenderBookings = async () => {
  const { data } = await api.get('/lender/bookings');
  return data.data;
};

export const fetchLenderStats = async () => {
  const { data } = await api.get('/lender/stats');
  return data.data;
};

export const createLenderSpace = async (payload) => {
  const { data } = await api.post('/lender/spaces', payload);
  return data.data;
};
