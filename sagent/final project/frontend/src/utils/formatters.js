const numberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0
});

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const formatNumber = (value) => numberFormatter.format(Number(value || 0));

export const currency = (value) => `Rs. ${currencyFormatter.format(Number(value || 0))}`;

export const dateTimeLocal = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};
