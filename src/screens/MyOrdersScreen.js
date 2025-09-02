import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { FontWeight, FontFamily } from '../styles/typography';

const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

export default function MyOrdersScreen({ navigation }) {
  // Dummy orders data
  const orders = [
    {
      id: '1',
      orderNumber: 'PRAPL001',
      title: 'Aplikasi Pelaporan Staf',
      price: 'Rp.700.000',
      status: 'Completed',
      date: '2025-08-15',
      image: require('./assets/pelaporan-staff.png'),
    },
    {
      id: '2',
      orderNumber: 'PRAPL002',
      title: 'Aplikasi Data Entry Relawan',
      price: 'Rp.1.000.000',
      status: 'In Progress',
      date: '2025-08-20',
      image: require('./assets/data-entry.png'),
    },
  ];

  const getStatusColor = status => {
    switch (status) {
      case 'Completed':
        return '#00B69B';
      case 'In Progress':
        return '#FF9500';
      case 'Cancelled':
        return '#FF272D';
      default:
        return '#646464';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Pesanan Saya</Text>
        </View>

        {/* Orders List */}
        {orders.map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { borderColor: getStatusColor(order.status) },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>

            <View style={styles.orderContent}>
              <Image source={order.image} style={styles.orderImage} />
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>{order.title}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
                <Text style={styles.orderPrice}>{order.price}</Text>
              </View>
            </View>

            <View style={styles.orderActions}>
              <TouchableOpacity style={styles.detailBtn}>
                <Text style={styles.detailBtnText}>Lihat Detail</Text>
              </TouchableOpacity>
              {order.status === 'Completed' && (
                <TouchableOpacity style={styles.reviewBtn}>
                  <Text style={styles.reviewBtnText}>Beri Ulasan</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    flex: 1,
    fontSize: 24,
    color: '#0070D8',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E8EC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#000',
  },
  statusBadge: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 12,
  },
  orderContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  orderDate: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: '#717182',
    marginBottom: 4,
  },
  orderPrice: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 16,
    color: '#0070D8',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#0070D8',
    borderRadius: 8,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  detailBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#0070D8',
    fontSize: 14,
  },
  reviewBtn: {
    flex: 1,
    backgroundColor: '#0070D8',
    borderRadius: 8,
    paddingVertical: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  reviewBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#fff',
    fontSize: 14,
  },
});
