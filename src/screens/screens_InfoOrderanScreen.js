import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

const InfoOrderanScreen = ({ route, navigation }) => {
  const { order, orderId } = route.params || {};
  const [orderData, setOrderData] = useState(order || null);
  const [loading, setLoading] = useState(!order);
  const [statusHistory, setStatusHistory] = useState([]);

  useEffect(() => {
    if (order) {
      // If order data is passed from previous screen, use it
      console.log('📱 Using order data from navigation:', order);
      setOrderData(order);
      generateStatusHistory(order);
      setLoading(false);
    } else if (orderId) {
      // If only orderId is passed, fetch from API
      fetchOrderData();
    } else {
      console.error('❌ No order data or orderId provided');
      setLoading(false);
    }
  }, [order, orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      console.log('📱 Fetching order data for orderId:', orderId);

      // Use your actual API endpoint
      const response = await fetch(`http://localhost:5000/api/payment/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📱 Fetched order data:', data);
        setOrderData(data);
        generateStatusHistory(data);
      } else {
        throw new Error('Failed to fetch order data');
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
      Alert.alert('Error', 'Gagal memuat data orderan');
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    // Get token from AsyncStorage or your auth service
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const generateStatusHistory = (data) => {
    const history = [];

    // Add order creation
    if (data?.createdAt) {
      history.push({
        date: data.createdAt,
        status: 'pending',
        title: 'Pesanan Dibuat',
        description: 'Pesanan Anda telah berhasil dibuat dan menunggu pembayaran'
      });
    }

    // Add payment status
    if (data?.paidAt) {
      history.push({
        date: data.paidAt,
        status: 'paid',
        title: 'Pembayaran Berhasil',
        description: 'Pembayaran telah dikonfirmasi dan pesanan sedang diproses'
      });
    }

    // Add admin processing status
    if (data?.adminStatus) {
      let title, description;
      switch (data.adminStatus) {
        case 'sedang diproses':
          title = 'Sedang Diproses Admin';
          description = 'Pesanan Anda sedang diproses oleh tim admin';
          break;
        case 'selesai':
          title = 'Pesanan Selesai';
          description = 'Pesanan Anda telah selesai diproses dan produk telah diberikan';
          break;
        default:
          title = 'Menunggu Proses Admin';
          description = 'Pesanan menunggu untuk diproses oleh admin';
      }

      history.push({
        date: data.updatedAt || data.createdAt,
        status: data.adminStatus,
        title: title,
        description: description
      });
    }

    // Sort by date (newest first)
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    setStatusHistory(history);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'selesai':
      case 'delivered':
        return '#4CAF50';
      case 'sedang diproses':
      case 'processing':
        return '#FF9800';
      case 'belum diproses':
      case 'pending':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Memuat data orderan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Info Orderan</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: '#E3F2FD' }]}>
          {/* <Image
            source={require('../assets/pkbi-logo.png')}
            style={styles.statusIcon}
            resizeMode="contain"
          /> */}
          <BackIcon/>
          <Text style={styles.statusText}>
            {orderData?.adminStatus === 'selesai' ? 'Orderan Selesai' :
             orderData?.adminStatus === 'sedang diproses' ? 'Sedang Diproses' :
             orderData?.paymentStatus === 'settlement' ? 'Pembayaran Berhasil' :
             'Belum Diproses'} pada {formatDate(orderData?.updatedAt || orderData?.createdAt)}
          </Text>
        </View>

        {/* Order Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status Orderan</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(orderData?.adminStatus || orderData?.paymentStatus) }]}>
              {orderData?.adminStatus || orderData?.paymentStatus || 'Pending'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>No Invoice</Text>
            <TouchableOpacity>
              <Text style={[styles.detailValue, styles.invoiceNumber]}>
                {orderData?.invoiceNumber || orderData?.orderId || 'N/A'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailValue}>
              {orderData?.orderId || orderData?.orderNumber || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Produk</Text>
            <Text style={styles.detailValue}>
              {orderData?.productName || orderData?.title || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Pembayaran</Text>
            <Text style={[styles.detailValue, { fontWeight: '600', color: '#2196F3' }]}>
              Rp {orderData?.totalAmount ? Number(orderData.totalAmount).toLocaleString('id-ID') : '0'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Info Detail Pelanggan</Text>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {orderData?.firstName && orderData?.lastName
                  ? `${orderData.firstName} ${orderData.lastName}`
                  : orderData?.customerName || 'N/A'}
              </Text>
              <Text style={styles.customerPhone}>
                {orderData?.phone || orderData?.customerPhone || 'N/A'}
              </Text>
              <Text style={styles.customerAddress}>
                {orderData?.email || orderData?.customerEmail || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Riwayat Status Orderan</Text>

          {statusHistory.length > 0 ? statusHistory.map((status, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text style={styles.timelineDate}>
                  {formatDate(status.date)}
                </Text>
                <Text style={styles.timelineTime}>
                  {formatTime(status.date)}
                </Text>
              </View>

              <View style={styles.timelineCenter}>
                <View style={[
                  styles.timelineDot,
                  { backgroundColor: getStatusColor(status.status) }
                ]}>
                  {/* <Image
                    source={require('../assets/pkbi-logo.png')}
                    style={styles.timelineIcon}
                    resizeMode="contain"
                  /> */}
                  <BackIcon/>
                </View>
                {index < statusHistory.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.timelineRight}>
                <Text style={styles.timelineTitle}>{status.title}</Text>
                <Text style={styles.timelineDescription}>
                  {status.description}
                </Text>
              </View>
            </View>
          )) : (
            <View style={styles.noDataContainer}>
              {/* <Image
                source={require('../assets/pkbi-logo.png')}
                style={styles.noDataIcon}
                resizeMode="contain"
              /> */}
              <BackIcon/>
              <Text style={styles.noDataText}>Belum ada riwayat status untuk orderan ini</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2196F3',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  invoiceNumber: {
    color: '#2196F3',
  },
  customerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
  customerPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  customerAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
    lineHeight: 16,
  },
  timelineContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    width: 80,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  timelineTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    textAlign: 'right',
  },
  timelineCenter: {
    alignItems: 'center',
    width: 32,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataIcon: {
    width: 24,
    height: 24,
    tintColor: '#999',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default InfoOrderanScreen;