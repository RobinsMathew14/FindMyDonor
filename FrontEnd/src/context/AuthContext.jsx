import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('findMyDonor_user');
        const loginTime = localStorage.getItem('findMyDonor_loginTime');
        
        if (savedUser && loginTime) {
          const currentTime = new Date().getTime();
          const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
          
          if (currentTime - parseInt(loginTime) < sessionDuration) {
            setUser(JSON.parse(savedUser));
          } else {
            // Session expired
            localStorage.removeItem('findMyDonor_user');
            localStorage.removeItem('findMyDonor_loginTime');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('findMyDonor_user');
        localStorage.removeItem('findMyDonor_loginTime');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }

      if (data.success) {
        const userInfo = {
          id: data.data.user._id,
          name: data.data.user.fullName,
          email: data.data.user.email,
          phone: data.data.user.phone,
          bloodGroup: data.data.user.bloodGroup,
          location: `${data.data.user.address?.city || ''}, ${data.data.user.address?.state || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
          userType: data.data.user.userType,
          avatar: data.data.user.avatar || null,
          joinDate: data.data.user.createdAt,
          lastLogin: new Date().toISOString(),
          token: data.data.token,
          refreshToken: data.data.refreshToken
        };

        setUser(userInfo);
        localStorage.setItem('findMyDonor_user', JSON.stringify(userInfo));
        localStorage.setItem('findMyDonor_token', data.data.token);
        localStorage.setItem('findMyDonor_refreshToken', data.data.refreshToken);
        localStorage.setItem('findMyDonor_loginTime', new Date().getTime().toString());
        
        return { success: true, user: userInfo };
      }

      return { success: false, error: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      // Call logout API if token exists
      const token = localStorage.getItem('findMyDonor_token');
      if (token) {
        try {
          await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.log('Logout API call failed:', error);
          // Continue with local logout even if API call fails
        }
      }

      setUser(null);
      localStorage.removeItem('findMyDonor_user');
      localStorage.removeItem('findMyDonor_token');
      localStorage.removeItem('findMyDonor_refreshToken');
      localStorage.removeItem('findMyDonor_loginTime');
      
      // Clear any other user-related data
      localStorage.removeItem('findMyDonor_preferences');
      localStorage.removeItem('findMyDonor_searchHistory');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Failed to logout' };
    }
  };

  const updateUser = (updates) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      const updatedUser = { ...user, ...updates, lastUpdated: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('findMyDonor_user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Failed to update user' };
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    getUserInitials
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};