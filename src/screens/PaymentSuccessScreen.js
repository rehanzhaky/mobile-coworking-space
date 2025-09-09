import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

const { width } = Dimensions.get('window');

export default function PaymentSuccessScreen({ navigation, route }) {
  // Get data from previous screen
  const { orderData, customerData, product } = route.params || {};

  // Update order status to completed when reaching this screen
  useEffect(() => {
    const updateOrderStatus = async () => {
      try {
        const orderId = orderData?.orderId;
        if (orderId) {
          console.log(
            'PaymentSuccessScreen: Updating order status to completed for:',
            orderId,
          );

          // Call API to update order status to completed
          const response = await ApiService.updateOrderStatus(
            orderId,
            'completed',
          );

          if (response.success) {
            console.log('✅ Order status updated to completed successfully');
          } else {
            console.log('❌ Failed to update order status:', response.error);
          }
        } else {
          console.log('⚠️ No orderId found in orderData:', orderData);
        }
      } catch (error) {
        console.error('❌ Error updating order status:', error.message);
      }
    };

    updateOrderStatus();
  }, [orderData]);

  // Send payment success notification
  const sendPaymentNotification = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('⚠️ No user token found, skipping payment notification');
        return;
      }

      const orderId = orderData?.orderId;
      if (!orderId) {
        console.log('⚠️ No orderId found, skipping payment notification');
        return;
      }

      console.log('📤 Sending payment success notification...');

      // Call backend to send payment notification
      const response = await ApiService.post(
        '/notifications/payment-success',
        {
          orderId: orderId,
          amount: product?.harga || product?.price || 0,
          productName: productName,
          paymentMethod: paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.success) {
        console.log('✅ Payment notification sent successfully');
        Alert.alert(
          'Berhasil!',
          'Notifikasi pembayaran berhasil telah dikirim ke akun Anda',
          [{ text: 'OK' }],
        );
      } else {
        console.log('❌ Failed to send payment notification:', response.error);
      }
    } catch (error) {
      console.error('❌ Error sending payment notification:', error);
    }
  };

  // Use received data or fallback to default
  const productName = product?.nama || product?.title || 'Aplikasi Absensi';
  const price = product?.harga
    ? `Rp ${parseInt(product.harga).toLocaleString('id-ID')}`
    : 'Rp 2.000.000';
  const paymentMethod = orderData?.payment_type || 'Kartu Kredit/Debit';
  const date = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0072DF' }}>
      <View style={styles.container}>
        <Text style={styles.infoTitle}>Info Pembayaran</Text>

        <View style={styles.ticketBox}>
          {/* Circle Check */}
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          {/* Text */}
          <Text style={styles.successTitle}>Pembayaran Berhasil</Text>
          <Text style={styles.productLabel}>Produk - {productName}</Text>
          <Text style={styles.amount}>{price}</Text>
          {/* Dashed line */}
          <View style={styles.dashedLine} />

          {/* Payment Info */}
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Metode Pembayaran</Text>
            <Text style={styles.paymentValue}>{paymentMethod}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tanggal</Text>
            <Text style={styles.paymentValue}>{date}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Waktu</Text>
            <Text style={styles.paymentValue}>{time}</Text>
          </View>
        </View>

        {/* Selesai Button */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={async () => {
            // Send payment success notification first
            await sendPaymentNotification();

            // Navigate back to home or main screen
            navigation.popToTop(); // or navigation.navigate('Home');
          }}
        >
          <Text style={styles.doneBtnText}>Selesai</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
  },
  ticketBox: {
    width: width - 36,
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingTop: 30,
    paddingBottom: 34,
    alignItems: 'center',
    marginBottom: 32,
    // Decorative border for bottom
    shadowColor: '#0072DF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
    position: 'relative',
    overflow: 'visible',
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E3F1FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  checkIcon: {
    fontSize: 46,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 26,
    color: '#111',
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  productLabel: {
    fontSize: 19,
    color: '#111',
    marginBottom: 10,
    textAlign: 'center',
  },
  amount: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 18,
    textAlign: 'center',
  },
  dashedLine: {
    borderBottomWidth: 1.5,
    borderColor: '#1976D2',
    borderStyle: 'dashed',
    width: '95%',
    marginVertical: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    width: '88%',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  paymentLabel: {
    fontSize: 17,
    color: '#666',
  },
  paymentValue: {
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
  },
  doneBtn: {
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingVertical: 13,
    paddingHorizontal: 44,
    alignItems: 'center',
    alignSelf: 'center',
  },
  doneBtnText: {
    color: '#0072DF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
