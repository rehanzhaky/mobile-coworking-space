// Safe imports with try-catch
let AsyncStorage = null;
let Platform = null;
let Alert = null;
let ApiService = null;

try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.log('⚠️ AsyncStorage not available:', e.message);
}

try {
  const RN = require('react-native');
  Platform = RN.Platform;
  Alert = RN.Alert;
} catch (e) {
  console.log('⚠️ React Native modules not available:', e.message);
}

try {
  ApiService = require('../services/api').default;
} catch (e) {
  console.log('⚠️ ApiService not available:', e.message);
}

console.log('🔥 Firebase service loading (v10.8.1 - ultra safe mode)...');

// Firebase configuration from google-services.json
const firebaseConfig = {
  projectId: 'co-working-space-48aa3',
  appId: '1:568073459500:android:dddc049dda6ac9c11e7e89',
  storageBucket: 'co-working-space-48aa3.firebasestorage.app',
  messagingSenderId: '568073459500',
  apiKey: 'AIzaSyD5iYZzmf1RT8QkL3-VeAGuXkpCe9QReJI',
};

console.log('🔥 Firebase Project ID:', firebaseConfig?.projectId || 'unknown');

class UltraSafeFirebaseService {
  constructor() {
    this.isInitialized = false;
    this.currentToken = null;
    this.isFirebaseAvailable = false;
    this.firebase = null;
    this.messaging = null;
    this.initializationPromise = null;

    console.log('🔥 Ultra Safe Firebase service created (v10.8.1 - crash-proof)');
  }

  /**
   * Initialize Firebase with ultra safe v10.8.1 (crash-proof)
   */
  async initialize() {
    // Prevent multiple initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  async _doInitialize() {
    try {
      console.log('🔄 Initializing Ultra Safe Firebase service...');

      // Try to load Firebase modules with ultra safe approach
      try {
        console.log('📦 Loading Firebase v10.8.1 modules (ultra safe)...');

        // Ultra safe Firebase imports
        let firebaseApp = null;
        let messaging = null;

        try {
          firebaseApp = await import('@react-native-firebase/app');
          console.log('✅ Firebase app module loaded');
        } catch (appError) {
          console.log('❌ Firebase app module failed:', appError?.message || 'unknown error');
          throw appError;
        }

        try {
          messaging = await import('@react-native-firebase/messaging');
          console.log('✅ Firebase messaging module loaded');
        } catch (msgError) {
          console.log('❌ Firebase messaging module failed:', msgError?.message || 'unknown error');
          throw msgError;
        }

        // Safe assignment with null checks
        if (firebaseApp && firebaseApp.default) {
          this.firebase = firebaseApp.default;
          console.log('✅ Firebase app assigned safely');
        } else {
          throw new Error('Firebase app module has no default export');
        }

        if (messaging && messaging.default) {
          this.messaging = messaging.default;
          console.log('✅ Firebase messaging assigned safely');
        } else {
          throw new Error('Firebase messaging module has no default export');
        }

        this.isFirebaseAvailable = true;

        // Ultra safe Firebase app initialization
        try {
          // Check if app is already initialized with safe access
          if (this.firebase && typeof this.firebase.app === 'function') {
            try {
              this.firebase.app();
              console.log('✅ Firebase app already initialized');
            } catch (error) {
              // App not initialized, create new one
              console.log('🔄 Initializing new Firebase app (ultra safe)...');
              if (typeof this.firebase.initializeApp === 'function') {
                this.firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase app initialized successfully (ultra safe)');
              } else {
                throw new Error('Firebase initializeApp method not available');
              }
            }
          } else {
            throw new Error('Firebase app method not available');
          }
        } catch (appInitError) {
          console.log('❌ Firebase app initialization failed:', appInitError?.message || 'unknown error');
          throw appInitError;
        }

        // Ultra safe messaging permission request
        try {
          console.log('🔄 Requesting messaging permission (ultra safe)...');

          if (!this.messaging || typeof this.messaging !== 'function') {
            throw new Error('Firebase messaging not available');
          }

          const messagingInstance = this.messaging();
          if (!messagingInstance || typeof messagingInstance.requestPermission !== 'function') {
            throw new Error('Firebase messaging requestPermission not available');
          }

          const authStatus = await messagingInstance.requestPermission();
          const enabled = authStatus === 1 || authStatus === 2; // AUTHORIZED || PROVISIONAL

          if (enabled) {
            console.log('✅ Firebase messaging permission granted');

            // Ultra safe FCM token retrieval
            try {
              console.log('🔄 Getting FCM token (ultra safe)...');

              if (typeof messagingInstance.getToken !== 'function') {
                throw new Error('Firebase messaging getToken not available');
              }

              const token = await messagingInstance.getToken();
              if (token && typeof token === 'string' && token.length > 0) {
                console.log('📱 FCM Token obtained successfully');
                this.currentToken = token;

                // Safe AsyncStorage usage
                if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
                  await AsyncStorage.setItem('fcm_token', token);
                }
              } else {
                throw new Error('Invalid or empty FCM token received');
              }
            } catch (tokenError) {
              console.log('⚠️ FCM token retrieval failed:', tokenError?.message || 'unknown error');
              const fallbackToken = `v10_safe_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
              this.currentToken = fallbackToken;

              if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
                await AsyncStorage.setItem('fcm_token', fallbackToken);
              }
            }
          } else {
            console.log('⚠️ Firebase messaging permission denied, using fallback');
            const fallbackToken = `v10_no_permission_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            this.currentToken = fallbackToken;

            if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
              await AsyncStorage.setItem('fcm_token', fallbackToken);
            }
          }
        } catch (permissionError) {
          console.log('❌ Messaging permission request failed:', permissionError?.message || 'unknown error');
          const fallbackToken = `v10_permission_error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          this.currentToken = fallbackToken;

          if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
            await AsyncStorage.setItem('fcm_token', fallbackToken);
          }
        }

        this.isInitialized = true;
        console.log('✅ Ultra Safe Firebase initialized successfully with v10.8.1');
        return true;

      } catch (firebaseError) {
        console.log('⚠️ Firebase v10.8.1 modules failed to load:', firebaseError?.message || 'unknown error');
        this.isFirebaseAvailable = false;

        // Generate ultra safe fallback token
        const fallbackToken = `v10_ultra_safe_error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        this.currentToken = fallbackToken;

        // Safe AsyncStorage usage
        if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
          try {
            await AsyncStorage.setItem('fcm_token', fallbackToken);
          } catch (storageError) {
            console.log('⚠️ AsyncStorage error:', storageError?.message || 'unknown error');
          }
        }

        this.isInitialized = true;
        console.log('✅ Ultra Safe Firebase initialized in fallback mode');
        return true;
      }

    } catch (error) {
      console.error('❌ Ultra Safe Firebase initialization error:', error?.message || 'unknown error');

      // Always succeed to prevent app crash - NEVER throw errors
      this.isInitialized = true;
      this.isFirebaseAvailable = false;

      // Generate ultra safe emergency fallback token
      const emergencyToken = `v10_ultra_emergency_${Date.now()}`;
      this.currentToken = emergencyToken;

      // Ultra safe storage with multiple fallbacks
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        try {
          await AsyncStorage.setItem('fcm_token', emergencyToken);
        } catch (storageError) {
          console.error('❌ Storage error:', storageError?.message || 'unknown error');
          // Even if storage fails, continue - don't crash the app
        }
      }

      console.log('✅ Ultra Safe Firebase initialized in emergency mode');
      return true; // ALWAYS return true to prevent app crash
    }
  }

  /**
   * Get FCM token safely
   */
  async getToken() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (this.currentToken) {
        console.log('📱 Returning cached token');
        return this.currentToken;
      }
      
      // Ultra safe stored token retrieval
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        try {
          const storedToken = await AsyncStorage.getItem('fcm_token');
          if (storedToken && typeof storedToken === 'string' && storedToken.length > 0) {
            this.currentToken = storedToken;
            return storedToken;
          }
        } catch (storageError) {
          console.log('⚠️ Storage retrieval error:', storageError?.message || 'unknown error');
        }
      }

      // Generate new ultra safe fallback token
      const newToken = `ultra_safe_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      this.currentToken = newToken;

      // Ultra safe storage
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        try {
          await AsyncStorage.setItem('fcm_token', newToken);
        } catch (storageError) {
          console.log('⚠️ Storage save error:', storageError?.message || 'unknown error');
        }
      }

      console.log('📱 Generated new ultra safe token');
      return newToken;

    } catch (error) {
      console.error('❌ Error getting token:', error?.message || 'unknown error');

      // Return ultra safe emergency token
      const emergencyToken = `ultra_emergency_${Date.now()}`;
      this.currentToken = emergencyToken;
      return emergencyToken;
    }
  }

  /**
   * Register token with backend safely
   */
  async registerTokenWithBackend(token) {
    try {
      console.log('📤 Registering token with backend...');
      
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('⚠️ No user token found, skipping backend registration');
        return;
      }
      
      const deviceInfo = {
        deviceType: Platform.OS,
        deviceId: await this.getDeviceId(),
        appVersion: '1.0.0',
      };

      const response = await ApiService.post(
        '/notifications/register-token',
        {
          token,
          ...deviceInfo,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.success) {
        console.log('✅ Token registered with backend');
      } else {
        console.warn('⚠️ Backend registration failed');
      }
    } catch (error) {
      console.error('❌ Error registering token with backend:', error.message);
      // Don't throw error - this is not critical
    }
  }

  /**
   * Get device ID safely
   */
  async getDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      return `device_${Date.now()}`;
    }
  }

  /**
   * Register token (public method)
   */
  async registerToken() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const token = await this.getToken();
      if (token) {
        await this.registerTokenWithBackend(token);
      }
    } catch (error) {
      console.error('❌ Error registering token:', error);
      // Don't throw - not critical
    }
  }

  /**
   * Setup message handlers for Firebase v10.8.1 (no BOM)
   */
  onMessageReceived(callback) {
    console.log('📨 Setting up Firebase v10.8.1 message listener (no BOM)...');

    if (!this.isFirebaseAvailable || !this.messaging) {
      console.log('⚠️ Firebase not available, using mock listener');
      return () => {
        console.log('📨 Mock message listener unsubscribed');
      };
    }

    try {
      // Setup foreground message handler (v10.8.1 API)
      const unsubscribe = this.messaging().onMessage(async remoteMessage => {
        console.log('📨 Foreground message received:', remoteMessage);
        if (callback) {
          callback(remoteMessage);
        }
      });

      console.log('✅ Firebase v10.8.1 message listener setup successfully');
      return unsubscribe;

    } catch (error) {
      console.error('❌ Error setting up message listener:', error);
      return () => {
        console.log('📨 Error message listener unsubscribed');
      };
    }
  }

  /**
   * Test Firebase functionality
   */
  async testFirebase() {
    console.log('🧪 Testing Legacy Stable Firebase v10.8.1 Configuration (no BOM)...');

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const token = await this.getToken();

      return {
        success: true,
        isReal: this.isFirebaseAvailable,
        token: token,
        projectId: firebaseConfig.projectId,
        mode: this.isFirebaseAvailable ? 'Real Firebase v10.8.1 (no BOM)' : 'Fallback Mode',
        version: '10.8.1',
        bom: false
      };
    } catch (error) {
      console.error('❌ Legacy Stable Firebase test failed:', error);
      return {
        success: false,
        isReal: false,
        error: error.message,
        token: null,
        mode: 'Error Mode',
        version: '10.8.1',
        bom: false
      };
    }
  }

  // Compatibility methods for existing code
  async getLocalNotifications() {
    try {
      const notifications = await AsyncStorage.getItem('local_notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      return [];
    }
  }

  async getStoredNotifications() {
    return this.getLocalNotifications();
  }

  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif,
      );
      await AsyncStorage.setItem('local_notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  async clearAllNotifications() {
    try {
      await AsyncStorage.removeItem('local_notifications');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }
}

// Create ultra safe Firebase service instance
const ultraSafeFirebaseService = new UltraSafeFirebaseService();

// Export both the service and test function with ultra safe wrappers
export default ultraSafeFirebaseService;

export const testFirebase = () => {
  try {
    return ultraSafeFirebaseService.testFirebase();
  } catch (error) {
    console.error('❌ Test Firebase error:', error?.message || 'unknown error');
    return {
      success: false,
      isReal: false,
      error: error?.message || 'unknown error',
      token: null,
      mode: 'Test Error Mode',
      version: '10.8.1'
    };
  }
};
