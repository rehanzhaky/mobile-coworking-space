import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import ApiService from '../services/api';

// Firebase configuration from google-services.json
const firebaseConfig = {
  projectId: 'co-working-space-48aa3',
  appId: '1:568073459500:android:dddc049dda6ac9c11e7e89',
  storageBucket: 'co-working-space-48aa3.firebasestorage.app',
  messagingSenderId: '568073459500',
  apiKey: 'AIzaSyD5iYZzmf1RT8QkL3-VeAGuXkpCe9QReJI',
};

// Try to import Firebase app and messaging, but handle errors gracefully
let firebaseApp = null;
let messaging = null;
let isFirebaseAvailable = false;

try {
  // Import Firebase app first
  firebaseApp = require('@react-native-firebase/app').default;
  messaging = require('@react-native-firebase/messaging').default;

  // Check if app is initialized with real config
  if (firebaseApp.apps.length === 0) {
    console.log('🔧 Initializing Firebase app with real config...');
    firebaseApp.initializeApp(firebaseConfig);
  }

  isFirebaseAvailable = true;
  console.log('✅ Firebase app and messaging imported successfully');
  console.log('🔥 Firebase Project ID:', firebaseConfig.projectId);
  console.log('🔥 Firebase App ID:', firebaseConfig.appId);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  throw new Error(
    'Firebase is required but not properly configured: ' + error.message,
  );
}

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.currentToken = null;

    // Initialize Firebase app if available
    if (firebaseApp) {
      try {
        // Check if Firebase app is already initialized
        if (firebaseApp.apps.length === 0) {
          console.log(
            '🔧 No Firebase apps found, app should be initialized with config',
          );
        } else {
          console.log('✅ Firebase app already initialized');
          console.log('🔥 Number of Firebase apps:', firebaseApp.apps.length);
          console.log('🔥 Default app:', firebaseApp.app().name);
        }

        console.log('🚀 Firebase service initialized with real configuration');
      } catch (error) {
        console.error('❌ Firebase app initialization failed:', error.message);
        throw error;
      }
    } else {
      console.error('❌ Firebase app not available');
      throw new Error('Firebase app is required but not available');
    }
  }

  /**
   * Initialize Firebase messaging
   */
  async initialize() {
    try {
      console.log('🔥 Initializing Firebase messaging...');

      // Check if Firebase app is properly initialized
      if (!firebaseApp || !firebaseApp.apps.length) {
        throw new Error('Firebase app not initialized');
      }

      // Request permission for notifications
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Notification permission granted');
        await this.getToken();
        this.setupMessageHandlers();
        this.isInitialized = true;
      } else {
        console.log('❌ Notification permission denied');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      throw error; // Don't fallback, let the error propagate
    }
  }

  /**
   * Get FCM token and register with backend
   */
  async getToken() {
    try {
      console.log('� Getting real FCM token...');

      // Check if Firebase app is properly initialized
      if (!firebaseApp || !firebaseApp.apps.length) {
        throw new Error('Firebase app not initialized');
      }

      const token = await messaging().getToken();
      if (token) {
        console.log(
          '📱 Real FCM Token obtained:',
          token.substring(0, 20) + '...',
        );
        this.currentToken = token;

        // Store token locally
        await AsyncStorage.setItem('fcm_token', token);

        // Register token with backend
        await this.registerTokenWithBackend(token);
        return token;
      } else {
        throw new Error('Failed to get FCM token from Firebase');
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      throw error; // Don't use mock tokens, let the error propagate
    }
  }

  /**
   * Register FCM token with backend
   */
  async registerTokenWithBackend(token) {
    try {
      // Get user token for authentication
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('⚠️ No user token found, skipping backend registration');
        return; // User not logged in, skip backend registration
      }

      const deviceInfo = {
        deviceType: Platform.OS,
        deviceId: await this.getDeviceId(),
        appVersion: '1.0.0', // You can get this from package.json
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

      if (response.success && response.data?.success) {
        console.log('✅ FCM token registered with backend');
      } else {
        console.warn('⚠️ Backend registration failed:', response.error);
      }
    } catch (error) {
      console.error('❌ Error registering token with backend:', error);
      // Don't throw error - this is not critical for app functionality
    }
  }

  /**
   * Public method to register token (alias for initialize)
   */
  async registerToken() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      } else {
        await this.getToken();
      }
    } catch (error) {
      console.error('❌ Error registering token:', error);
    }
  }

  /**
   * Listen for incoming messages (for UI components)
   */
  onMessageReceived(callback) {
    // If Firebase not available, return empty unsubscribe function
    if (!this.isFirebaseAvailable) {
      console.log('⚠️ Firebase not available, returning mock message listener');
      return () => {};
    }

    try {
      // Check if Firebase app is properly initialized
      if (!firebaseApp || !firebaseApp.apps.length) {
        console.log('⚠️ Firebase app not initialized, returning mock listener');
        return () => {};
      }

      // Return unsubscribe function for foreground messages
      return messaging().onMessage(async remoteMessage => {
        console.log('📨 Message received in onMessageReceived:', remoteMessage);

        // Save notification locally
        await this.saveNotificationLocally(remoteMessage);

        // Call the callback
        if (callback) {
          callback(remoteMessage);
        }
      });
    } catch (error) {
      console.error('❌ Error setting up message listener:', error);
      return () => {};
    }
  }

  /**
   * Setup message handlers for different app states
   */
  setupMessageHandlers() {
    // If Firebase not available, skip setup
    if (!this.isFirebaseAvailable) {
      console.log(
        '⚠️ Skipping message handlers setup - Firebase not available',
      );
      return;
    }

    try {
      // Check if Firebase app is properly initialized
      if (!firebaseApp || !firebaseApp.apps.length) {
        console.log(
          '⚠️ Firebase app not initialized, skipping message handlers',
        );
        return;
      }

      // Handle notifications when app is in foreground
      messaging().onMessage(async remoteMessage => {
        console.log('📨 Foreground notification received:', remoteMessage);
        this.handleForegroundNotification(remoteMessage);
      });

      // Handle notifications when app is in background/killed and opened
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('📱 Background notification opened:', remoteMessage);
        this.handleNotificationAction(remoteMessage);
      });

      // Handle notifications when app is killed and opened
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('🚀 Initial notification:', remoteMessage);
            this.handleNotificationAction(remoteMessage);
          }
        });

      // Handle token refresh
      messaging().onTokenRefresh(token => {
        console.log('🔄 FCM token refreshed:', token.substring(0, 20) + '...');
        this.currentToken = token;
        AsyncStorage.setItem('fcm_token', token);
        this.registerTokenWithBackend(token);
      });
    } catch (error) {
      console.error('❌ Error setting up message handlers:', error);
    }
  }

  /**
   * Handle foreground notifications (show custom alert/notification)
   */
  handleForegroundNotification(remoteMessage) {
    // You can implement custom notification display here
    // For example, using react-native-toast-message or custom modal

    // Save notification to local storage for notification screen
    this.saveNotificationLocally(remoteMessage);

    // Show alert for now (you can customize this)
    if (remoteMessage.notification) {
      Alert.alert(
        remoteMessage.notification.title || 'Notifikasi',
        remoteMessage.notification.body || 'Anda memiliki notifikasi baru',
        [
          { text: 'Tutup', style: 'cancel' },
          {
            text: 'Lihat',
            onPress: () => this.handleNotificationAction(remoteMessage),
          },
        ],
      );
    }
  }

  /**
   * Handle notification action (when user taps on notification)
   */
  handleNotificationAction(remoteMessage) {
    if (remoteMessage.data) {
      const { actionType, orderId, promoId } = remoteMessage.data;

      // Navigate based on notification type
      switch (actionType) {
        case 'view_order':
          // Navigate to order details
          console.log('Navigate to order:', orderId);
          break;
        case 'view_promo':
          // Navigate to promo details
          console.log('Navigate to promo:', promoId);
          break;
        case 'view_payment':
          // Navigate to payment history
          console.log('Navigate to payment');
          break;
        default:
          // Navigate to notifications screen
          console.log('Navigate to notifications');
          break;
      }
    }
  }

  /**
   * Save notification locally for notification screen
   */
  async saveNotificationLocally(remoteMessage) {
    try {
      const notification = {
        id: remoteMessage.messageId || Date.now().toString(),
        title: remoteMessage.notification?.title || '',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data || {},
        timestamp: Date.now(),
        isRead: false,
      };

      // Get existing notifications
      const existingNotifications = await AsyncStorage.getItem(
        'local_notifications',
      );
      const notifications = existingNotifications
        ? JSON.parse(existingNotifications)
        : [];

      // Add new notification to the beginning
      notifications.unshift(notification);

      // Keep only last 100 notifications
      if (notifications.length > 100) {
        notifications.splice(100);
      }

      // Save back to storage
      await AsyncStorage.setItem(
        'local_notifications',
        JSON.stringify(notifications),
      );

      console.log('💾 Notification saved locally');
    } catch (error) {
      console.error('❌ Error saving notification locally:', error);
    }
  }

  /**
   * Get device ID (you might want to use react-native-device-info)
   */
  async getDeviceId() {
    try {
      // For now, generate a simple device ID
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      return `device_${Date.now()}`;
    }
  }

  /**
   * Get local notifications for notification screen
   */
  async getLocalNotifications() {
    try {
      const notifications = await AsyncStorage.getItem('local_notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('❌ Error getting local notifications:', error);
      return [];
    }
  }

  /**
   * Alias for getLocalNotifications (for backward compatibility)
   */
  async getStoredNotifications() {
    return this.getLocalNotifications();
  }

  /**
   * Mark notification as read locally
   */
  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif,
      );

      await AsyncStorage.setItem(
        'local_notifications',
        JSON.stringify(updatedNotifications),
      );
      console.log('✅ Notification marked as read locally');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  /**
   * Clear all local notifications
   */
  async clearAllNotifications() {
    try {
      await AsyncStorage.removeItem('local_notifications');
      console.log('🗑️ All local notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }

  /**
   * Test Firebase configuration and functionality
   */
  async testFirebase() {
    console.log('🧪 Testing Firebase FCM Configuration...');

    try {
      // Check if Firebase is available
      if (!this.isFirebaseAvailable) {
        return {
          success: false,
          isReal: false,
          error: 'Firebase not available - using mock mode',
          token: null,
        };
      }

      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Try to get FCM token
      const token = await this.getToken();

      // Check if token is real or mock
      const isRealToken = token && !token.startsWith('mock_token_');

      console.log('🔥 Firebase Project ID: co-working-space-48aa3');
      console.log('📱 FCM Token received:', token ? 'Yes' : 'No');
      console.log('✅ Real Firebase Token:', isRealToken ? 'Yes' : 'No');

      return {
        success: true,
        isReal: isRealToken && this.isFirebaseAvailable,
        token: token,
        projectId: 'co-working-space-48aa3',
      };
    } catch (error) {
      console.error('❌ Firebase test failed:', error);
      return {
        success: false,
        isReal: false,
        error: error.message,
        token: null,
      };
    }
  }
}

// Create Firebase service instance
const firebaseService = new FirebaseService();

// Export both the service and test function
export default firebaseService;
export const testFirebase = () => firebaseService.testFirebase();
