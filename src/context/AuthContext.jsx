// context/AuthContext.jsx
// Provides authentication state to the entire React application.
// Any component can read the current officer's data or call
// login/logout from here without prop drilling.

import { createContext, useState, useEffect } from 'react';

// Create the context object. This is what components import
// when they want to read auth state.
export const AuthContext = createContext();

// The AuthProvider wraps the entire app (in main.jsx) so every
// component inside it has access to the auth state.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // loading prevents the PrivateRoute from redirecting to login
  // before it has had a chance to check if a user is in localStorage
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When the app first loads, check if the officer was previously
    // logged in by looking for their data in localStorage.
    // If found, restore their session automatically.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Called when the officer logs in successfully.
  // Saves their data and token to localStorage so the session
  // persists even if they refresh the page.
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  // Called when the officer clicks logout.
  // Clears everything from state and localStorage.
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
