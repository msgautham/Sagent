import api from './api';

export const makePayment = async (payload) => {
  const { data } = await api.post('/payments', payload);
  return data.data;
};
