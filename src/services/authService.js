import api from './api';

// Mock users for testing (Remove/Comment out to ensure backend is used)
const MOCK_USERS = [
  {
    id: 1,
    email: 'student@gmail.com',
    password: 'student123',
    firstName: 'John',
    lastName: 'Student',
    role: 'Student',
    roleValue: 1,
    department: 'Computer Science',
    departmentId: 1
  },
  {
    id: 2,
    email: 'teacher@gmail.com',
    password: 'teacher123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'Teacher',
    roleValue: 2,
    department: 'Computer Science',
    departmentId: 1
  },
  {
    id: 3,
    email: 'admin@gmail.com',
    password: 'admin123',
    firstName: 'Michael',
    lastName: 'Admin',
    role: 'Admin',
    department: 'Administration'
  }
];

export const authService = {
  login: async (credentials) => {
    try {
      // 1. Try real API first
      try {
        const response = await api.post('/auth/login', credentials);
        
        if (response.data.success) {
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          return response.data;
        }
      } catch (apiError) {
        // Fallback to mock for test users if API fails or user not found there
        console.warn('Backend login failed, trying mock users...', apiError.message);
      }

      // 2. Mock authentication for testing/dev users
      const emailLower = credentials.email.trim().toLowerCase();
      console.log('Searching mock users for:', emailLower);
      
      const mockUser = MOCK_USERS.find(
        user => user.email.toLowerCase() === emailLower && user.password === credentials.password
      );
      
      if (mockUser) {
        const { password, ...userWithoutPassword } = mockUser;
        const mockToken = `mock-token-${mockUser.id}`;
        
        // Ensure role is correctly named for frontend
        userWithoutPassword.role = userWithoutPassword.role || userWithoutPassword.Role;

        console.log(`Mock Login: ${userWithoutPassword.role} (${userWithoutPassword.email})`);
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        return {
          success: true,
          token: mockToken,
          user: userWithoutPassword,
          message: 'Login successful'
        };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Login failed');
      }
    }
  },

  register: async (userData) => {
    try {
      // 1. Try real API
      try {
        const response = await api.post('/auth/register', userData);
        
        if (response.data.success) {
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          return response.data;
        }
      } catch (apiError) {
        console.warn('Backend registration failed, trying mock...', apiError.message);
        if (apiError.response?.status === 409) {
             throw new Error('User with this email already exists');
        }
      }

      // 2. Mock registration for testing
      const emailLower = userData.email.trim().toLowerCase();
      const existingUser = MOCK_USERS.find(user => user.email.toLowerCase() === emailLower);
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      const newUser = {
        id: MOCK_USERS.length + 1,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'Student',
        roleValue: userData.role === 'Teacher' ? 2 : 1,
        department: userData.department || 'Computer Science'
      };
      
      const mockToken = `mock-token-${newUser.id}`;
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return {
        success: true,
        token: mockToken,
        user: newUser,
        message: 'Registration successful (Mock)'
      };
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 409) {
        throw new Error('User with this email already exists');
      } else if (error.label === 'Network Error') {
         throw new Error('Cannot connect to server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Registration failed');
      }
    }
  },

  googleLogin: async (idToken, role = 'Student', department = '') => {
    try {
      const response = await api.post('/auth/google-login', { 
        idToken, 
        role,
        department 
      });
      
      if (response.data.success) {
        const { token, user } = response.data;
        // Normalize role property
        if (user && !user.role && user.Role) user.role = user.Role;
        
        console.log('Google login success. Normalized user role:', user?.role);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return response.data;
      } else {
        throw new Error(response.data.message || 'Google login failed');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Google authentication failed');
      } else {
        throw new Error(error.message || 'Google login failed');
      }
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        const user = response.data.user;
        // Normalize role property
        if (user && !user.role && user.Role) user.role = user.Role;
        
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      } else {
        throw new Error('Failed to get user information');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        authService.logout();
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = authService.getStoredUser();
    return !!(token && user);
  },

  hasRole: (requiredRole) => {
    const user = authService.getStoredUser();
    return user?.role === requiredRole;
  },

  hasAnyRole: (requiredRoles) => {
    const user = authService.getStoredUser();
    return requiredRoles.includes(user?.role);
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to change password');
    }
  }
};