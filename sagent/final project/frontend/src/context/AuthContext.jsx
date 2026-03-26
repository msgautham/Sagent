import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('parking_user');
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed?.token ? parsed : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('parking_user', JSON.stringify(user));
      localStorage.setItem('parking_token', user.token);
    } else {
      localStorage.removeItem('parking_user');
      localStorage.removeItem('parking_token');
    }
  }, [user]);

  const login = (payload) => setUser(payload);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: Boolean(user?.token) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
