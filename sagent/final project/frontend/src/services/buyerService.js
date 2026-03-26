import api from './api';

export const fetchVehicles = async () => {
  const { data } = await api.get('/buyer/vehicles');
  return data.data;
};

export const addVehicle = async (payload) => {
  const { data } = await api.post('/buyer/vehicles', payload);
  return data.data;
};

export const fetchWallet = async () => {
  const { data } = await api.get('/buyer/wallet');
  return data.data;
};

export const topUpWallet = async (amount) => {
  const { data } = await api.post('/buyer/wallet/top-up', {
    amount,
    paymentMethod: 'HARDCODED',
    topUpCode: 'TOPUP-DEMO-2026'
  });
  return data.data;
};

export const fetchNotifications = async () => {
  const { data } = await api.get('/buyer/notifications');
  return data.data;
};
