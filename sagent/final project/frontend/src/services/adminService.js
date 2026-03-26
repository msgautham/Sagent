import api from './api';

export const fetchAdminUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data.data;
};

export const fetchAdminBookings = async () => {
  const { data } = await api.get('/admin/bookings');
  return data.data;
};

export const fetchAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data.data;
};

export const fetchPendingSpaces = async () => {
  const { data } = await api.get('/admin/spaces/pending');
  return data.data;
};

export const approveSpace = async (id) => {
  const { data } = await api.post(`/admin/approve-space/${id}`);
  return data.data;
};

export const blockUser = async (id) => {
  const { data } = await api.post(`/admin/block-user/${id}`);
  return data.data;
};
