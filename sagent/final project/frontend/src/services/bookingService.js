import api from './api';

export const createBooking = async (payload) => {
  const { data } = await api.post('/bookings', payload);
  return data.data;
};

export const extendBooking = async (id, payload) => {
  const { data } = await api.post(`/bookings/${id}/extend`, payload);
  return data.data;
};

export const fetchMyBookings = async () => {
  const { data } = await api.get('/bookings/me');
  return data.data;
};

export const checkInBooking = async (id) => {
  const { data } = await api.post(`/bookings/${id}/check-in`);
  return data.data;
};

export const checkOutBooking = async (id) => {
  const { data } = await api.post(`/bookings/${id}/check-out`);
  return data.data;
};
