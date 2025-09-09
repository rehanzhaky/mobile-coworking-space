import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';
import FirebaseService from '../config/firebase';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';

const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

// Icons - you need to add these icon files to your assets
// For now using require, but you can replace with your actual icon imports
const getNotificationIcon = type => {
  // You can replace these with your actual icon files
  // or use a single icon and differentiate by color
  try {
    switch (type) {
      case 'promo':
        return require('./assets/icon-promo.png');
      case 'order_status':
        return require('./assets/icon-order.png');
      case 'payment':
        return require('./assets/icon-payment.png');
      default:
        return require('./assets/icon-product.png');
    }
  } catch (error) {
    // Fallback to a default icon if assets are not found
    return { uri: 'https://via.placeholder.com/26x26/0070D8/FFFFFF?text=!' };
  }
};

export default function NotificationScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Semua');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tab filter logic
  const tabList = ['Semua', 'Produk Baru', 'Pesanan', 'Promosi', 'Pembayaran'];

  // Load notifications from API and local storage
  const loadNotifications = async () => {
    try {
      setLoading(true);

      // Debug: Check current user
      const currentUser = await ApiService.getCurrentUser();
      console.log('📱 Current user in mobile app:', currentUser);

      // Load from local storage first (for offline support)
      const localNotifications = await FirebaseService.getStoredNotifications();
      if (localNotifications.length > 0) {
        setNotifications(formatNotifications(localNotifications));
      }

      // Load from server
      const token = await AsyncStorage.getItem('userToken');
      console.log(
        '📱 Current user token:',
        token ? token.substring(0, 50) + '...' : 'No token',
      );

      if (token) {
        console.log('📱 Loading notifications from server...');
        const response = await ApiService.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('📱 API Response:', response);
        console.log('📱 Response.data:', response.data);
        console.log('📱 Response.data.data:', response.data?.data);
        console.log(
          '📱 Response.data.data.notifications:',
          response.data?.data?.notifications,
        );

        if (response.success && response.data) {
          // The API returns nested structure: response.data.data.notifications
          const notifications =
            response.data.data?.notifications ||
            response.data.notifications ||
            [];
          console.log('📱 Raw notifications from API:', notifications);

          const formattedNotifications = formatNotifications(notifications);
          setNotifications(formattedNotifications);
          console.log(
            '📱 Loaded notifications from server:',
            formattedNotifications.length,
          );
        } else {
          console.warn(
            '📱 Failed to load notifications from server:',
            response,
          );
        }
      } else {
        console.warn(
          '📱 No user token found, cannot load notifications from server',
        );
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format notifications for display
  const formatNotifications = notifs => {
    return notifs.map(notif => {
      let actionButton = null;
      let badge = null;

      switch (notif.type) {
        case 'promo':
          badge = { text: notif.data?.discount || 'Promo', color: '#FF272D' };
          actionButton = {
            label: 'Lihat Promo',
            onPress: () =>
              navigation.navigate('Promo', { promoId: notif.data?.promoId }),
          };
          break;
        case 'order_status':
          actionButton = {
            label: 'Lihat Pesanan',
            onPress: () =>
              navigation.navigate('OrderDetail', {
                orderId: notif.data?.orderId,
              }),
          };
          break;
        case 'payment':
          badge = {
            text: notif.data?.amount || 'Pembayaran',
            color: '#00B69B',
          };
          actionButton = {
            label: 'Lihat Pembayaran',
            onPress: () =>
              navigation.navigate('PaymentDetail', {
                paymentId: notif.data?.paymentId,
              }),
          };
          break;
        default:
          break;
      }

      return {
        id: notif.id,
        type: getTypeDisplayName(notif.type),
        icon: getNotificationIcon(notif.type),
        title: notif.title,
        description: notif.body,
        time: formatTime(notif.createdAt || notif.timestamp),
        action: actionButton,
        badge,
        isRead: notif.isRead,
      };
    });
  };

  // Get display name for notification type
  const getTypeDisplayName = type => {
    switch (type) {
      case 'promo':
        return 'Promosi';
      case 'order_status':
        return 'Pesanan';
      case 'payment':
        return 'Pembayaran';
      default:
        return 'Produk Baru';
    }
  };

  // Format time display
  const formatTime = timestamp => {
    if (!timestamp) return 'Baru saja';

    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;

    return notifTime.toLocaleDateString('id-ID');
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'Semua') return true;
    return notif.type === activeTab;
  });

  // Mark notification as read
  const markAsRead = async notificationId => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        await ApiService.put(
          `/notifications/${notificationId}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif,
          ),
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Refresh notifications
  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();

    // Register FCM token when screen loads
    FirebaseService.registerToken();

    // Listen for new notifications while app is open
    const unsubscribe = FirebaseService.onMessageReceived(notification => {
      // Refresh notifications when new one arrives
      loadNotifications();
    });

    return unsubscribe;
  }, []);

  // Show loading spinner
  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={[styles.header, { marginBottom: 0 }]}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Notifikasi</Text>
        </View>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#0070D8" />
          <Text
            style={[styles.notifDesc, { marginTop: 16, textAlign: 'center' }]}
          >
            Memuat notifikasi...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0070D8']}
            tintColor="#0070D8"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Notifikasi</Text>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabRow}
        >
          {tabList.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Empty State */}
        {filteredNotifications.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Belum ada notifikasi</Text>
            <Text style={styles.emptyDesc}>
              Notifikasi akan muncul di sini ketika ada informasi terbaru untuk
              Anda
            </Text>
          </View>
        )}

        {/* Notification List */}
        {filteredNotifications.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.notifBox, !item.isRead && styles.notifBoxUnread]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={item.icon} style={styles.notifIcon} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.notifTitle,
                    !item.isRead && styles.notifTitleUnread,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <Text style={styles.notifTime}>{item.time}</Text>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notifDesc}>{item.description}</Text>

            {item.action && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  markAsRead(item.id);
                  item.action.onPress();
                }}
              >
                <Text style={styles.actionBtnText}>{item.action.label}</Text>
              </TouchableOpacity>
            )}

            {item.badge && (
              <View
                style={[
                  item.badge.color === '#00B69B'
                    ? styles.amountBox
                    : styles.promoBox,
                ]}
              >
                <Text
                  style={[
                    item.badge.color === '#00B69B'
                      ? styles.amountText
                      : styles.promoText,
                  ]}
                >
                  {item.badge.text}
                </Text>
              </View>
            )}

            <View style={styles.notifDivider} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 73,
    marginBottom: 31,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 8,
    marginTop: -6,
  },
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    flex: 1,
    fontSize: 24,
    color: '#0070D8',
    textAlign: 'center',
  },
  tabScrollView: {
    marginTop: 18,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  tab: {
    marginBottom: 42,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#646464',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  tabActive: {
    backgroundColor: '#0070D8',
    borderColor: '#0070D8',
  },
  tabText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 14,
    color: '#112D4E',
  },
  tabTextActive: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 18,
    color: '#112D4E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: '#717182',
    textAlign: 'center',
    lineHeight: 20,
  },
  notifBox: {
    marginHorizontal: 17,
    marginBottom: 12,
    paddingBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  notifBoxUnread: {
    backgroundColor: '#F8FAFE',
    borderLeftWidth: 4,
    borderLeftColor: '#0070D8',
  },
  notifIcon: {
    width: 26,
    height: 26,
    marginRight: 10,
  },
  notifTitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#000000',
    marginRight: 8,
    flex: 1,
  },
  notifTitleUnread: {
    fontWeight: FontWeight.semibold,
    color: '#0070D8',
  },
  notifTime: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    color: '#717182',
    fontSize: 12,
    marginLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0070D8',
    marginLeft: 8,
  },
  notifDesc: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    marginTop: 8,
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
    lineHeight: 20,
  },
  actionBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#0070D8',
    borderRadius: 500,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  actionBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#0070D8',
    fontSize: 12,
  },
  amountBox: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#00B69B',
    borderRadius: 500,
    paddingHorizontal: 13,
    paddingVertical: 3,
    marginBottom: 8,
    marginTop: 4,
  },
  amountText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#00B69B',
    fontSize: 12,
  },
  promoBox: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#FF272D',
    borderRadius: 500,
    paddingHorizontal: 13,
    paddingVertical: 3,
    marginBottom: 8,
    marginTop: 4,
  },
  promoText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#FF272D',
    fontSize: 12,
  },
  notifDivider: {
    height: 1,
    backgroundColor: '#E5E8EC',
    marginTop: 8,
  },
});
