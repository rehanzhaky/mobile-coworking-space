import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Pressable,
} from 'react-native';
import { FontWeight, FontFamily } from '../styles/typography';
import ApiService from '../services/api';

const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load orders when component mounts
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('📱 Loading user orders...');
      
      const response = await ApiService.getSecure('/payment/my-orders');
      
      console.log('📱 Orders API response:', response);
      
      if (response.success && response.data?.success) {
        const ordersData = response.data.orders || [];
        console.log('✅ Orders loaded:', ordersData.length);
        setOrders(ordersData);
      } else {
        console.log('❌ Failed to load orders:', response.error);
        if (response.status === 401) {
          Alert.alert('Error', 'Sesi login telah berakhir. Silakan login kembali.');
        } else {
          Alert.alert('Error', 'Gagal memuat data pesanan');
        }
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Error', 'Gagal memuat data pesanan');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getDefaultImage = (productCategory) => {
    // Return default image based on category or use fallback
    switch (productCategory?.toLowerCase()) {
      case 'aplikasi':
        return require('./assets/pelaporan-staff.png');
      case 'website':
        return require('./assets/data-entry.png');
      default:
        return require('./assets/pelaporan-staff.png');
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Completed':
      case 'Selesai':
        return '#22C55E'; // Green
      case 'In Progress':
      case 'Sedang Diproses':
        return '#3B82F6'; // Blue
      case 'Cancelled':
      case 'Dibatalkan':
        return '#EF4444'; // Red
      case 'Pending':
      case 'Menunggu':
      case 'Menunggu Pembayaran':
        return '#F59E0B'; // Orange
      case 'Belum Diproses':
        return '#F59E0B'; // Orange
      case 'Kadaluarsa':
      case 'Gagal':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  // Function to get category display text
  const getCategoryDisplay = (category) => {
    if (!category) return 'Produk';
    const lowerCategory = category.toLowerCase();
    if (lowerCategory === 'produk' || lowerCategory === 'aplikasi' || lowerCategory === 'website') return 'Produk';
    if (lowerCategory === 'layanan' || lowerCategory === 'service') return 'Layanan';
    return 'Produk'; // Default fallback
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0070D8']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Pesanan Saya</Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0070D8" />
            <Text style={styles.loadingText}>Memuat pesanan...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Belum Ada Pesanan</Text>
            <Text style={styles.emptyText}>
              Anda belum memiliki pesanan apapun. Mulai berbelanja sekarang!
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => navigation?.navigate('Catalog')}
            >
              <Text style={styles.shopButtonText}>Mulai Belanja</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Orders List */}
        {!loading && orders.map(order => (
          <Pressable 
            key={order.id} 
            style={({ pressed }) => [
              styles.orderCard,
              { borderColor: pressed ? '#0070D8' : '#8C8C8C' }
            ]}
            onPress={() => {
              console.log('📱 Navigating to TransactionDetail with order:', order);
              console.log('📱 Navigation object available:', !!navigation);
              try {
                if (navigation && typeof navigation.navigate === 'function') {
                  // Navigate to transaction detail screen with order data
                  navigation.navigate('TransactionDetail', { order });
                } else {
                  console.error('❌ Navigation object not available');
                  Alert.alert('Error', 'Navigation tidak tersedia');
                }
              } catch (error) {
                console.error('❌ Navigation error:', error);
                Alert.alert('Error', 'Tidak dapat membuka detail transaksi: ' + error.message);
              }
            }}
          >
            {/* Product Image - Full Width */}
            <Image 
              source={getDefaultImage(order.productCategory)} 
              style={styles.productImage} 
            />

            {/* Content Container */}
            <View style={styles.contentContainer}>
              {/* Product Info Row */}
              <View style={styles.productInfoRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{order.title}</Text>
                  <Text style={styles.categoryText}>{getCategoryDisplay(order.productCategory)}</Text>
                </View>
                
                {/* Status Text */}
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.displayStatus || order.status) },
                  ]}
                >
                  {order.displayStatus || order.status}
                </Text>
              </View>
              
              {/* Divider Line */}
              <View style={styles.dividerLine} />
              
              {/* Purchase Date */}
              <Text style={styles.purchaseDate}>Pembelian pada tanggal {order.date}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:10,
    marginBottom: 31,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    flex: 1,
    fontSize: 24,
    color: '#0070D8',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontFamily: FontFamily.outfit_regular,
    fontSize: 16,
    color: '#717182',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#000',
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: FontFamily.outfit_regular,
    fontSize: 16,
    color: '#717182',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#0070D8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  shopButtonText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#fff',
    fontSize: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 26,
    marginHorizontal: 25,
    marginBottom: 16,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  productImage: {
    width: 140,
    height: 140,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginVertical: 16,
  },
  contentContainer: {
    padding: 16,
  },
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productTitle: {
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    fontSize: 18,
    color: '#000',
    marginBottom: 1,
    lineHeight: 22,
  },
  categoryText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 16,
    color: '#000',
  },
  statusText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 16,
    alignSelf: 'flex-start',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E5E8EC',
    marginVertical: 12,
  },
  purchaseDate: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: '#000',
    lineHeight: 16,
  },
});
