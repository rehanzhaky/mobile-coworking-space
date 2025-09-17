import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporary storage solution - will be replaced with AsyncStorage when working
let tempUserStorage = null;

// Base URL untuk backend API
// Dinamis berdasarkan platform dan device type
const getBaseURL = () => {
  // Untuk Android Emulator - gunakan 10.0.2.2
  const EMULATOR_IP = '10.0.2.2';
  
  if (Platform.OS === 'android') {
    // Untuk Android Emulator
    return `http://${EMULATOR_IP}:5000/api`;
  } else if (Platform.OS === 'ios') {
    // Untuk iOS Simulator
    return 'http://localhost:5000/api';
  } else {
    // Fallback untuk web atau platform lain
    return 'http://localhost:5000/api';
  }
};

const BASE_URL = getBaseURL();

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service class
class ApiService {
  // Test connection to backend
  static async testConnection() {
    try {
      console.log('Testing connection to:', BASE_URL);

      // Try a simple test endpoint first
      const response = await api.get('/test', { timeout: 5000 });
      console.log('✅ Connection successful!', response.status);
      return { success: true, status: response.status };
    } catch (error) {
      console.error('❌ Connection failed:', error.message);

      // Try alternative endpoint if test fails
      try {
        console.log('Trying alternative endpoint...');
        const altResponse = await api.get('/nonadminusers', { timeout: 5000 });
        console.log(
          '✅ Alternative connection successful!',
          altResponse.status,
        );
        return { success: true, status: altResponse.status };
      } catch (altError) {
        console.error(
          '❌ Alternative connection also failed:',
          altError.message,
        );
        return {
          success: false,
          error: `Primary: ${error.message}, Alternative: ${altError.message}`,
        };
      }
    }
  }
  // User Registration
  static async registerUser(userData) {
    try {
      console.log('Attempting registration with:', userData.email);
      console.log('API URL:', `${BASE_URL}/nonadminusers`);

      const response = await api.post('/nonadminusers', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      console.log('Registration response:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Registrasi berhasil!',
      };
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Network error:', error.message);

      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.message ||
          'Registrasi gagal. Silakan coba lagi.',
      };
    }
  }

  // User Login - Support username or email
  static async loginUser(credentials) {
    try {
      console.log('Attempting login with:', credentials.email); // credentials.email dapat berisi username atau email
      console.log('API URL:', `${BASE_URL}/auth/login`);

      const response = await api.post('/auth/login', {
        email: credentials.email, // Backend akan mencari berdasarkan username atau email
        password: credentials.password,
      });

      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);

      if (response.data && response.data.token) {
        // Store user data in temporary storage
        tempUserStorage = {
          id: response.data.id,
          username: response.data.username,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          community: response.data.community,
          profilePhoto: response.data.profilePhoto,
          isAdmin: response.data.isAdmin,
        };

        // Store JWT token in AsyncStorage
        await AsyncStorage.setItem('userToken', response.data.token);
        console.log('✅ JWT token stored in AsyncStorage');

        // Also store user data as backup in AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(tempUserStorage));
        console.log('✅ User data backup stored in AsyncStorage');

        console.log('User data stored in tempUserStorage:', tempUserStorage);

        return {
          success: true,
          data: response.data,
          message: 'Login berhasil!',
        };
      } else {
        throw new Error('Login response missing token');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Login error response:', error.response?.data);
      console.error('Login error status:', error.response?.status);
      console.error('Login network error:', error.message);

      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.message ||
          'Login gagal. Periksa username/email dan password Anda.',
      };
    }
  }

  // Get current user from storage
  static async getCurrentUser() {
    try {
      console.log('🔍 Debug getCurrentUser - tempUserStorage:', tempUserStorage);
      
      // If no user data in memory, try to get from AsyncStorage
      if (!tempUserStorage) {
        console.log('⚠️ No tempUserStorage found, checking AsyncStorage for token...');
        const token = await AsyncStorage.getItem('userToken');
        
        if (token) {
          console.log('✅ Token found, attempting to fetch user profile from server');
          try {
            // Try to get user profile from server using the token
            const response = await api.get('/profile', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.data && response.data.success) {
              // Restore user data to temp storage
              tempUserStorage = {
                id: response.data.user.id,
                username: response.data.user.username,
                firstName: response.data.user.firstName,
                lastName: response.data.user.lastName,
                email: response.data.user.email,
                community: response.data.user.community,
                profilePhoto: response.data.user.profilePhoto,
                isAdmin: response.data.user.isAdmin,
              };
              console.log('✅ User data restored from server:', tempUserStorage);
              return tempUserStorage;
            }
          } catch (profileError) {
            console.error('❌ Failed to fetch profile from server:', profileError);
            // Token might be invalid, clear it
            await AsyncStorage.removeItem('userToken');
          }
        }
        
        // Check if we have stored user data in AsyncStorage as backup
        try {
          const storedUserData = await AsyncStorage.getItem('userData');
          if (storedUserData) {
            tempUserStorage = JSON.parse(storedUserData);
            console.log('✅ User data restored from AsyncStorage backup:', tempUserStorage);
            return tempUserStorage;
          }
        } catch (storageError) {
          console.error('❌ Failed to get user data from AsyncStorage:', storageError);
        }
        
        // If still no user data, use demo data for testing
        console.log('📋 No user data found, using demo data for testing');
        tempUserStorage = {
          id: 2, // Use ID 2 to match with our chat system
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@demo.com',
          community: 'Demo Community Jakarta',
          profilePhoto: null,
          isAdmin: false,
        };
        
        // Store demo data as backup
        await AsyncStorage.setItem('userData', JSON.stringify(tempUserStorage));
      }

      return tempUserStorage;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Logout user
  static async logoutUser() {
    try {
      tempUserStorage = null;
      // Clear token and user data from AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      console.log('✅ User token and data cleared from AsyncStorage');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  // Store user data (untuk Google Sign-In dan login lainnya)
  static async storeUserData(userData) {
    try {
      console.log('📦 Storing user data in tempUserStorage:', userData);
      
      tempUserStorage = {
        id: userData.id,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        community: userData.community || 'Mobile Coworking Space',
        profilePhoto: userData.profilePhoto || null,
        isAdmin: userData.isAdmin || false,
      };
      
      console.log('✅ User data stored successfully:', tempUserStorage);
      return { success: true };
    } catch (error) {
      console.error('❌ Store user data error:', error);
      return { success: false, error };
    }
  }

  // Check if user is logged in
  static async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('🔍 Debug isLoggedIn - Token:', token ? '✅ Found' : '❌ Not found');
      console.log('🔍 Debug isLoggedIn - tempUserStorage:', tempUserStorage ? '✅ Found' : '❌ Not found');
      
      const isLoggedIn = token !== null && tempUserStorage !== null;
      console.log('🔍 Debug isLoggedIn - Final result:', isLoggedIn);
      
      return isLoggedIn;
    } catch (error) {
      console.error('Check login status error:', error);
      return false;
    }
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    try {
      console.log('Updating profile for user:', userId);
      console.log('Profile data:', profileData);

      const response = await api.put(
        `/nonadminusers/profile/${userId}`,
        profileData,
      );

      console.log('Profile update response:', response.data);

      // Update tempUserStorage with new data
      if (tempUserStorage && tempUserStorage.id === userId) {
        tempUserStorage = {
          ...tempUserStorage,
          ...response.data,
        };
        console.log('Updated tempUserStorage:', tempUserStorage);
      }

      return {
        success: true,
        data: response.data,
        message: 'Profile berhasil diupdate!',
      };
    } catch (error) {
      console.error('Update profile error:', error);
      console.error('Update profile error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.error || 'Gagal update profile.',
      };
    }
  }

  // Get all items/products (for catalog)
  static async getItems() {
    try {
      const response = await api.get('/item');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get items error:', error);
      return {
        success: false,
        message: 'Gagal memuat data produk.',
      };
    }
  }

  // Get all promotions (for promo banner)
  static async getPromotions() {
    try {
      const response = await api.get('/promotion');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get promotions error:', error);
      return {
        success: false,
        message: 'Gagal memuat data promosi.',
      };
    }
  }

  // Get user profile data
  static async getUserProfile() {
    try {
      const user = tempUserStorage;
      if (!user) {
        return {
          success: false,
          message: 'User tidak login',
        };
      }

      // Return data from tempUserStorage (already available from login)
      console.log('Returning user profile from tempUserStorage:', user);
      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          community: user.community,
          profilePhoto: user.profilePhoto,
          isAdmin: user.isAdmin,
        },
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        message: 'Gagal memuat data profil.',
      };
    }
  }

  // ===== MIDTRANS PAYMENT INTEGRATION =====

  // Create Midtrans transaction
  static async createMidtransTransaction(orderData) {
    try {
      console.log('Creating Midtrans transaction with data:', orderData);

      // Use postSecure instead of post to include authentication header
      const response = await this.postSecure('/payment/midtrans/create', orderData);
      
      console.log('📥 Raw postSecure response:', response);
      console.log('🔍 Response structure:', {
        success: response.success,
        data: response.data,
        status: response.status,
        error: response.error
      });

      if (response.success && response.data && response.data.success) {
        console.log(
          'Midtrans transaction created successfully:',
          response.data,
        );
        return {
          success: true,
          data: response.data.data, // Contains snap_token, redirect_url, etc.
          message: 'Transaction created successfully',
        };
      } else {
        const errorMessage = response.data?.message || response.error || 'Failed to create transaction';
        console.log('❌ Transaction creation failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Create Midtrans transaction error:', error.message);
      // Return failure so UI can show demo mode
      return {
        success: false,
        message: 'Failed to create Midtrans transaction',
        error: error.message || 'NETWORK_ERROR',
      };
    }
  }

  // Check Midtrans transaction status
  static async checkMidtransStatus(orderId) {
    try {
      console.log('Checking Midtrans status for order:', orderId);

      const response = await api.get(`/payment/midtrans/status/${orderId}`);

      if (response.data.success) {
        console.log('Midtrans status check successful:', response.data);
        return {
          success: true,
          data: response.data.data, // Contains transaction_status, payment_type, etc.
        };
      } else {
        throw new Error(response.data.message || 'Failed to check status');
      }
    } catch (error) {
      console.log('Check Midtrans status error:', error.message);
      return {
        success: false,
        message: 'Failed to check payment status',
        error:
          error.response?.status === 404
            ? 'ENDPOINT_NOT_FOUND'
            : 'NETWORK_ERROR',
      };
    }
  }

  // Update order status (for PaymentSuccessScreen)
  static async updateOrderStatus(orderId, status) {
    try {
      console.log(`Updating order ${orderId} status to:`, status);

      const response = await api.put(`/payment/orders/${orderId}/status`, {
        status: status,
      });

      if (response.data.success) {
        console.log('Order status updated successfully:', response.data);
        return {
          success: true,
          data: response.data,
          message: 'Order status updated successfully',
        };
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.log('Update order status error:', error.message);
      return {
        success: false,
        message: 'Failed to update order status',
        error: error.response?.data?.error || error.message,
      };
    }
  }

  // Get payment methods from Midtrans
  static async getMidtransPaymentMethods() {
    try {
      console.log('Getting payment methods from backend API...');
      const response = await api.get('/payment/midtrans/methods');

      if (response.data.success) {
        console.log('Payment methods received from API:', response.data);
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new Error(
          response.data.message || 'Failed to get payment methods',
        );
      }
    } catch (error) {
      // Use default methods as fallback
      console.log('API endpoint not available, using default payment methods');
      return {
        success: true, // Return success with default data
        data: this.getDefaultPaymentMethods(),
        message: 'Using default payment methods (backend not available)',
      };
    }
  }

  // Default payment methods (fallback)
  static getDefaultPaymentMethods() {
    return {
      ewallet: {
        enabled: true,
        methods: ['gopay', 'shopeepay', 'dana', 'ovo', 'linkaja'],
      },
      bank_transfer: {
        enabled: true,
        methods: ['bca', 'bni', 'bri', 'mandiri', 'permata'],
      },
      credit_card: {
        enabled: true,
        methods: ['visa', 'mastercard', 'jcb'],
      },
      retail: {
        enabled: true,
        methods: ['indomaret', 'alfamart'],
      },
    };
  }

  // Generic static methods for direct API calls
  static async get(endpoint, config = {}) {
    try {
      console.log(`📡 GET request to: ${BASE_URL}${endpoint}`);
      const response = await api.get(endpoint, config);
      console.log(`✅ GET response:`, response.status);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error(`❌ GET error for ${endpoint}:`, error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      };
    }
  }

  // Authenticated GET request - adds Authorization header automatically
  static async getSecure(endpoint, config = {}) {
    try {
      console.log(`🔐 Secure GET request to: ${BASE_URL}${endpoint}`);
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('❌ No token found for authenticated request');
        return {
          success: false,
          error: 'No authentication token found',
          status: 401,
        };
      }

      console.log('🔐 Adding Authorization header with token');
      
      // Add Authorization header
      const authConfig = {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        },
      };

      const response = await api.get(endpoint, authConfig);
      console.log(`✅ Secure GET response:`, response.status);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error(`❌ Secure GET error for ${endpoint}:`, error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      };
    }
  }

  static async post(endpoint, data = {}, config = {}) {
    try {
      console.log(`📡 POST request to: ${BASE_URL}${endpoint}`);
      console.log(`📤 POST data:`, data);
      const response = await api.post(endpoint, data, config);
      console.log(`✅ POST response:`, response.status);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error(`❌ POST error for ${endpoint}:`, error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      };
    }
  }

  static async postSecure(endpoint, data = {}, config = {}) {
    try {
      console.log(`🔐 Secure POST request to: ${BASE_URL}${endpoint}`);
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('❌ No token found for authenticated request');
        return {
          success: false,
          error: 'No authentication token found',
          status: 401,
        };
      }

      console.log('🔐 Adding Authorization header with token');
      console.log('📝 POST data:', data);
      
      // Add Authorization header
      const authConfig = {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        },
      };

      const response = await api.post(endpoint, data, authConfig);
      console.log(`✅ Secure POST response:`, response.status);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error(`❌ Secure POST error for ${endpoint}:`, error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      };
    }
  }

  static async put(endpoint, data = {}, config = {}) {
    try {
      console.log(`📡 PUT request to: ${BASE_URL}${endpoint}`);
      const response = await api.put(endpoint, data, config);
      console.log(`✅ PUT response:`, response.status);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error(`❌ PUT error for ${endpoint}:`, error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      };
    }
  }

  static async delete(endpoint, config = {}) {
    try {
      console.log(`📡 DELETE request to: ${BASE_URL}${endpoint}`);
      const response = await api.delete(endpoint, config);
      console.log(`✅ DELETE response:`, response.status);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error(`❌ DELETE error for ${endpoint}:`, error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      };
    }
  }
}

export default ApiService;
