import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('kroomcare_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('kroomcare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kroomcare_user');
    }
  }, [user]);

  // Sinkronisasi data pengguna otomatis dari database MySQL
  useEffect(() => {
    if (!user?.id) return;

    const syncUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`);
        const result = await response.json();
        if (response.ok && result.success) {
          const dbUser = result.data;
          setUser(prev => {
            if (!prev) return null;
            // Hanya update jika ada perubahan untuk mencegah loop rendering tak terbatas
            if (
              prev.name !== dbUser.name ||
              prev.email !== dbUser.email ||
              prev.points !== dbUser.points ||
              prev.avatar !== dbUser.avatar ||
              prev.status !== dbUser.status ||
              (prev as any).twoFactorEnabled !== dbUser.twoFactorEnabled
            ) {
              return {
                ...prev,
                name: dbUser.name,
                email: dbUser.email,
                points: dbUser.points,
                avatar: dbUser.avatar,
                status: dbUser.status,
                twoFactorEnabled: dbUser.twoFactorEnabled
              } as any;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Failed to sync profile from database:', error);
      }
    };

    syncUserProfile();
  }, [user?.id]);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
