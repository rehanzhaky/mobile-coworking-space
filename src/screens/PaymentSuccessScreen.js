import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';
import { FontWeight, FontFamily } from '../styles/typography';

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
  console.log('🔍 Product data received:', product);
  console.log('🔍 OrderData received:', orderData);
  
  // Get product name with priority: nama > title > itemDetails.name > fallback
  const productName = product?.nama || 
                     product?.title || 
                     product?.name ||
                     orderData?.itemDetails?.[0]?.name ||
                     'Aplikasi Absensi';
                     
  const price = product?.harga || product?.price
    ? `Rp ${parseInt(product.harga || product.price).toLocaleString('id-ID')}`
    : orderData?.grossAmount 
    ? `Rp ${parseInt(orderData.grossAmount).toLocaleString('id-ID')}`
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

        {/* Payment Success Background Image */}
        <Image 
          source={require('./assets/payment-success.png')} 
          style={styles.paymentSuccessImage}
        />
        
        <View style={styles.contentOverlay}>
          {/* Check Success Icon with Double Circle Background */}
          <View style={styles.outerCircleContainer}>
            <View style={styles.checkIconContainer}>
              <Image 
                source={require('./assets/check-success.png')} 
                style={styles.checkSuccessIcon}
              />
            </View>
          </View>
          
          {/* Text Content */}
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
    paddingTop: 100,
  },
  infoTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    color: '#fff',
    fontSize: 24,
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: -0.96,
    lineHeight: 22,
  },
  // Styling untuk payment success image
  paymentSuccessImage: {
    width: width - 36,
    height: 400, // Adjust height based on your image
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 32,
  },
  contentOverlay: {
    position: 'absolute',
    top: 190, // Adjust position based on your image
    left: 18,
    right: 18,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  outerCircleContainer: {
    width: 70,
    height: 70,
    borderRadius: 60, // Makes it a perfect circle
    backgroundColor: '#E3EFF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  checkIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25, // Makes it a perfect circle (updated for smaller size)
    backgroundColor: '#0070D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSuccessIcon: {
    width: 26.01,
    height: 19,
    resizeMode: 'contain',
  },
  successTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    color: '#fff',
    fontSize: 24,
    color: '#000',
    marginBottom:2,
    textAlign: 'center',
    letterSpacing: -0.96,
    lineHeight: 25,
  },
  productLabel: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 17,
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.96,
    lineHeight: 25,
  },
  amount: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 23,
    color: '#000',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: -0.96,
    lineHeight: 25,
  },
  dashedLine: {
    borderBottomWidth: 1.5,
    borderColor: '#0070D8',
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
    fontFamily: FontFamily.regular,
    fontWeight: FontWeight.regular,
    fontSize: 17,
    color: '#646464',
    letterSpacing: -0.96,
    lineHeight: 25,
  },
  paymentValue: {
    fontFamily: FontFamily.regular,
    fontWeight: FontWeight.regular,
    fontSize: 17,
    color: '#000',
    letterSpacing: -0.96,
    lineHeight: 25,
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
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    backgroundColor: '#fff',
    color: '#0070D8',
    fontSize: 20,
    letterSpacing: -0.96,
    lineHeight: 25,
  },
});
