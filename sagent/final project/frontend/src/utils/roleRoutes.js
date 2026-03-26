export const getHomeRouteForRole = (role) => {
  if (role === 'ADMIN') return '/admin';
  if (role === 'PARKING_SPACE_LENDER') return '/lender';
  return '/dashboard';
};
