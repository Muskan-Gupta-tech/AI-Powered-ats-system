import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const name = localStorage.getItem('name');
    return name ? { name } : null;
  });

  const loginUser = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.name);
    setUser({ name: data.name, id: data.id });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loginUser, logout }}>{children}</AuthContext.Provider>;
}
