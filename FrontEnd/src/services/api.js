// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('findMyDonor_token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401 && data.message?.includes('expired')) {
        // Try to refresh token
        const refreshResult = await refreshAuthToken();
        if (refreshResult.success) {
          // Retry the original request with new token
          config.headers = getAuthHeaders();
          const retryResponse = await fetch(url, config);
          return await retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          localStorage.clear();
          window.location.href = '/login';
          return { success: false, error: 'Session expired. Please login again.' };
        }
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Login user
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Logout user
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST'
    });
  },

  // Get current user profile
  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return apiRequest(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  },

  // Verify email
  verifyEmail: async () => {
    return apiRequest('/auth/verify-email', {
      method: 'POST'
    });
  },

  // Verify email with token
  verifyEmailToken: async (token) => {
    return apiRequest(`/auth/verify-email/${token}`);
  }
};

// Refresh auth token
const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem('findMyDonor_refreshToken');
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem('findMyDonor_token', data.data.token);
      localStorage.setItem('findMyDonor_refreshToken', data.data.refreshToken);
      return { success: true };
    }

    return { success: false, error: data.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Users API calls
export const usersAPI = {
  // Get all users (with filters)
  getUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/users?${queryParams}`);
  },

  // Get donors
  getDonors: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/users/donors?${queryParams}`);
  },

  // Get hospitals
  getHospitals: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/users/hospitals?${queryParams}`);
  },

  // Get user by ID
  getUserById: async (userId) => {
    return apiRequest(`/users/${userId}`);
  },

  // Update user profile
  updateUser: async (userId, updates) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Delete/deactivate user
  deleteUser: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // Reactivate user (admin only)
  reactivateUser: async (userId) => {
    return apiRequest(`/users/${userId}/reactivate`, {
      method: 'POST'
    });
  },

  // Get donation history
  getDonationHistory: async (userId, page = 1, limit = 10) => {
    return apiRequest(`/users/${userId}/donation-history?page=${page}&limit=${limit}`);
  },

  // Get dashboard statistics (admin only)
  getDashboardStats: async () => {
    return apiRequest('/users/stats/dashboard');
  }
};

// Blood requests API calls
export const bloodRequestsAPI = {
  // Create blood request
  create: async (requestData) => {
    return apiRequest('/blood-requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  },

  // Get blood requests
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/blood-requests?${queryParams}`);
  },

  // Get blood request by ID
  getById: async (requestId) => {
    return apiRequest(`/blood-requests/${requestId}`);
  },

  // Update blood request
  update: async (requestId, updates) => {
    return apiRequest(`/blood-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Delete blood request
  delete: async (requestId) => {
    return apiRequest(`/blood-requests/${requestId}`, {
      method: 'DELETE'
    });
  },

  // Respond to blood request
  respond: async (requestId, responseData) => {
    return apiRequest(`/blood-requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
  },

  // Update response status
  updateResponse: async (requestId, donorId, status, additionalData = {}) => {
    return apiRequest(`/blood-requests/${requestId}/responses/${donorId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...additionalData })
    });
  }
};

// Blood inventory API calls
export const bloodInventoryAPI = {
  // Get blood inventory
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/blood-inventory?${queryParams}`);
  },

  // Get inventory by hospital
  getByHospital: async (hospitalId) => {
    return apiRequest(`/blood-inventory/hospital/${hospitalId}`);
  },

  // Update inventory
  update: async (inventoryId, updates) => {
    return apiRequest(`/blood-inventory/${inventoryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Add blood units
  addUnits: async (inventoryId, units, batchInfo) => {
    return apiRequest(`/blood-inventory/${inventoryId}/add-units`, {
      method: 'POST',
      body: JSON.stringify({ units, batchInfo })
    });
  },

  // Reserve units
  reserveUnits: async (inventoryId, units, reservedBy) => {
    return apiRequest(`/blood-inventory/${inventoryId}/reserve`, {
      method: 'POST',
      body: JSON.stringify({ units, reservedBy })
    });
  },

  // Distribute units
  distributeUnits: async (inventoryId, units, distributedTo) => {
    return apiRequest(`/blood-inventory/${inventoryId}/distribute`, {
      method: 'POST',
      body: JSON.stringify({ units, distributedTo })
    });
  },

  // Get low stock alerts
  getLowStockAlerts: async () => {
    return apiRequest('/blood-inventory/alerts/low-stock');
  },

  // Find nearby inventory
  findNearby: async (longitude, latitude, maxDistance = 50000) => {
    return apiRequest(`/blood-inventory/nearby?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`);
  }
};

// Donations API calls
export const donationsAPI = {
  // Schedule donation
  schedule: async (donationData) => {
    return apiRequest('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData)
    });
  },

  // Get donations
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/donations?${queryParams}`);
  },

  // Get donation by ID
  getById: async (donationId) => {
    return apiRequest(`/donations/${donationId}`);
  },

  // Update donation
  update: async (donationId, updates) => {
    return apiRequest(`/donations/${donationId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Cancel donation
  cancel: async (donationId, reason) => {
    return apiRequest(`/donations/${donationId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Complete donation
  complete: async (donationId, completionData) => {
    return apiRequest(`/donations/${donationId}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionData)
    });
  },

  // Get donation statistics
  getStats: async (hospitalId = null, dateRange = null) => {
    const params = {};
    if (hospitalId) params.hospitalId = hospitalId;
    if (dateRange) {
      params.startDate = dateRange.start;
      params.endDate = dateRange.end;
    }
    
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/donations/stats?${queryParams}`);
  }
};

// Utility API calls
export const utilityAPI = {
  // Health check
  healthCheck: async () => {
    return apiRequest('/health');
  },

  // Get sample data
  getSampleData: async () => {
    return apiRequest('/sample-data');
  },

  // Get API documentation
  getDocumentation: async () => {
    return apiRequest('');
  }
};

// File upload utility
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });

    return await response.json();
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

// Export all APIs
export default {
  auth: authAPI,
  users: usersAPI,
  bloodRequests: bloodRequestsAPI,
  bloodInventory: bloodInventoryAPI,
  donations: donationsAPI,
  utility: utilityAPI,
  uploadFile
};