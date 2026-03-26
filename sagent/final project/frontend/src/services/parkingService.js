import api from './api';

export const fetchParkingSpaces = async () => {
  const { data } = await api.get('/parking-spaces');
  return data.data;
};

export const fetchNearbySpaces = async (lat, lng, radius = 5) => {
  const { data } = await api.get(`/parking-spaces/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  return data.data;
};

export const fetchParkingDetails = async (id) => {
  const { data } = await api.get(`/parking-spaces/${id}`);
  return data.data;
};

export const fetchParkingSlots = async (id) => {
  const { data } = await api.get(`/parking-spaces/${id}/slots`);
  return data.data;
};

export const fetchAlternativeSpaces = async (id, startTime, endTime, radius = 5) => {
  const { data } = await api.get(
    `/parking-spaces/${id}/alternatives?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&radius=${radius}`
  );
  return data.data;
};

export const fetchParkingReviews = async (id) => {
  const { data } = await api.get(`/parking-spaces/${id}/reviews`);
  return data.data;
};

export const createParkingReview = async (id, payload) => {
  const { data } = await api.post(`/parking-spaces/${id}/reviews`, payload);
  return data.data;
};

export const geocodeAddress = async (query) => {
  const { data } = await api.get(`/parking-spaces/geocode?address=${encodeURIComponent(query)}`);
  return data.data;
};
