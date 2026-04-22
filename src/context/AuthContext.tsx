import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  token: string;
  role: 'STUDENT' | 'HOSTEL' | 'ADMIN';
  fullName: string;
  email: string;
  kycVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Start as true — we must read localStorage before rendering protected routes
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Synchronously read from localStorage to restore session on page refresh
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        const parsed: User = JSON.parse(storedUser);
        // Make sure the token in user object matches what's in localStorage
        setUser({ ...parsed, token: storedToken });
      }
    } catch {
      // Corrupt data — clear it
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      // Done reading — routes can now render
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (partial: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
