import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Linking,
  AppState,
} from 'react-native';
import { FontWeight, FontFamily } from '../styles/typography';
import ApiService from '../services/api';
import paymentService from '../services/paymentService';
import PaymentStatusService from '../services/paymentStatusService';

export default function CheckoutDetailScreen({ navigation, route }) {
  // Get data from previous screens
  const { customerData, product, actionType, paymentData } = route.params || {};

  // State for payment processing
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  const currentOrderId = useRef(null);

  console.log('CheckoutDetailScreen received:', {
    customerData,
    product,
    actionType,
    paymentData,
  });

  // AppState listener untuk detect ketika user kembali ke app setelah payment
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      console.log('AppState changed to:', nextAppState);

      if (
        nextAppState === 'active' &&
        isPaymentInProgress &&
        currentOrderId.current
      ) {
        console.log(
          'App became active, checking payment status for order:',
          currentOrderId.current,
        );

        // Delay check untuk memastikan webhook sudah diproses
        setTimeout(() => {
          checkPaymentStatus(currentOrderId.current);
        }, 2000); // Wait 2 seconds for webhook processing
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
    };
  }, [isPaymentInProgress, navigation, customerData, product]);

  // Check payment status
  const checkPaymentStatus = async orderId => {
    try {
      const result = await ApiService.checkMidtransStatus(orderId);

      if (result.success) {
        const { transaction_status, payment_type } = result.data;

        if (
          transaction_status === 'capture' ||
          transaction_status === 'settlement'
        ) {
          // Payment successful
          Alert.alert(
            'Pembayaran Berhasil!',
            `Pembayaran dengan ${payment_type} telah berhasil.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setIsPaymentInProgress(false);
                  currentOrderId.current = null;
                  // Navigate to success screen
                  navigation.navigate('PaymentSuccessScreen', {
                    orderData: { orderId, transaction_status, payment_type },
                    customerData,
                    product,
                  });
                },
              },
            ],
          );
        } else if (transaction_status === 'pending') {
          // Payment still pending
          Alert.alert(
            'Pembayaran Pending',
            'Pembayaran masih dalam proses. Silakan tunggu atau cek status nanti.',
          );
        } else {
          // Payment failed or cancelled
          Alert.alert(
            'Pembayaran Gagal',
            `Status pembayaran: ${transaction_status}. Silakan coba lagi.`,
          );
          setIsPaymentInProgress(false);
          currentOrderId.current = null;
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  // Use received data or fallback to default
  const buyer = customerData
    ? {
        name: `${customerData.firstName} ${customerData.lastName}`,
        community: customerData.community || 'Komunitas',
        phone: customerData.phone,
      }
    : {
        name: 'Khalidah Nur Djamil',
        community: 'Komunitas RUS (Rumpun Usaha Sehati)',
        phone: '(+62) 823-1117-8820',
      };

  // Use received product data or fallback to default
  const order = product
    ? {
        image: product.gambarUrl
          ? { uri: product.gambarUrl }
          : require('./assets/absensi-staff.png'),
        name: product.nama || product.title,
        price: paymentService.formatCurrency(
          parseInt(product.harga || product.price || 0),
        ),
      }
    : {
        image: require('./assets/absensi-staff.png'),
        name: 'Aplikasi Absensi',
        price: 'Rp 2.000.000',
      };

  // Use received payment data or fallback to default
  const payment = paymentData
    ? {
        method: paymentData.label,
        total: paymentService.formatCurrency(
          parseInt(product?.harga || product?.price || 2000000),
        ),
      }
    : {
        method: 'Kartu Kredit/Debit',
        total: 'Rp 2.000.000',
      };

  // Test API connection
  const testConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await ApiService.testConnection();
      if (response.success) {
        Alert.alert('Connection Test', 'Koneksi berhasil!');
      } else {
        Alert.alert('Connection Test', 'Koneksi gagal!');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      Alert.alert('Connection Test', `Failed: ${error.message}`);
    }
  };

  // Handle payment process
  const handlePayment = async () => {
    try {
      setLoading(true);

      // Validate required data
      if (!customerData || !product || !paymentData) {
        Alert.alert(
          'Error',
          'Data tidak lengkap. Silakan ulangi proses pemesanan.',
        );
        return;
      }

      // Prepare order data for Midtrans (Order ID will be generated by backend)
      const orderData = {
        grossAmount: parseInt(product.harga || product.price || 0),
        customerDetails: {
          userId: customerData.userId || customerData.id, // Add userId for chat functionality
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email || 'customer@example.com',
          phone: customerData.phone,
          community: customerData.community,
        },
        itemDetails: [
          {
            id: product.id || 'PRODUCT-1',
            price: parseInt(product.harga || product.price || 0),
            quantity: 1,
            name: product.nama || product.title || 'Product',
            category: product.kategori || product.category || 'Produk', // Add category for Order ID generation
          },
        ],
        paymentType: paymentData.midtransType, // ewallet, credit_card, bank_transfer
        enabledPayments: paymentData.details?.enabled_payments || [
          paymentData.midtransType,
        ],
      };

      console.log('Creating Midtrans transaction with data:', orderData);

      // Try to create transaction with Midtrans
      const result = await ApiService.createMidtransTransaction(orderData);

      if (result.success && result.data) {
        console.log('Midtrans transaction created:', result.data);

        // Get the structured Order ID from backend response
        const backendOrderId = result.data.order_id;
        console.log('📦 Using backend Order ID:', backendOrderId);

        // Store the backend Order ID for status checking
        currentOrderId.current = backendOrderId;
        setIsPaymentInProgress(true);

        // Get payment URL based on payment type
        let paymentUrl = null;

        if (result.data.snap_token) {
          // For Snap integration (recommended for mobile)
          paymentUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${result.data.snap_token}`;
        } else if (result.data.redirect_url) {
          // For Core API integration
          paymentUrl = result.data.redirect_url;
        }

        if (paymentUrl) {
          Alert.alert(
            'Pembayaran Midtrans',
            `Anda akan diarahkan ke halaman pembayaran ${paymentData.label}.\n\nSetelah pembayaran selesai, kembali ke aplikasi untuk melihat status.`,
            [
              { text: 'Batal', style: 'cancel' },
              {
                text: 'Lanjut ke Pembayaran',
                onPress: () => openPaymentPage(paymentUrl, orderData),
              },
            ],
          );
        } else {
          throw new Error(
            'Tidak ada URL pembayaran yang diterima dari Midtrans',
          );
        }
      } else {
        // Backend not ready, show demo mode
        console.log('Backend not ready, showing demo mode');
        Alert.alert(
          'Demo Mode - Backend Tidak Tersedia',
          `Backend Midtrans belum tersedia.\n\nData yang akan dikirim:\n\nOrder ID: ${orderId}\nPembeli: ${
            customerData.firstName
          } ${customerData.lastName}\nProduk: ${
            product.nama || product.title
          }\nHarga: ${payment.total}\nMetode: ${
            paymentData.label
          }\n\nSilakan setup backend Midtrans terlebih dahulu.`,
          [
            { text: 'OK' },
            {
              text: 'Simulasi Sukses',
              onPress: () => {
                // Simulate successful payment
                setTimeout(() => {
                  navigation.navigate('PaymentSuccessScreen', {
                    orderData: {
                      orderId,
                      transaction_status: 'settlement',
                      payment_type: paymentData.midtransType,
                    },
                    customerData,
                    product,
                  });
                }, 1000);
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      Alert.alert(
        'Error Pembayaran',
        `Gagal membuat pembayaran: ${error.message}\n\nSilakan coba lagi atau pilih metode pembayaran lain.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Open payment page in external browser
  const openPaymentPage = async (paymentUrl, orderData) => {
    try {
      console.log('Opening payment page:', paymentUrl);

      const supported = await Linking.canOpenURL(paymentUrl);

      if (supported) {
        await Linking.openURL(paymentUrl);

        // Show status check dialog after opening payment
        setTimeout(() => {
          Alert.alert(
            'Status Pembayaran',
            'Setelah menyelesaikan pembayaran, aplikasi akan secara otomatis mendeteksi status pembayaran ketika Anda kembali.\n\nAnda juga dapat mengecek status secara manual.',
            [
              {
                text: 'Belum Bayar',
                style: 'cancel',
              },
              {
                text: 'Cek Status',
                onPress: () => {
                  if (currentOrderId.current) {
                    checkPaymentStatus(currentOrderId.current);
                  }
                },
              },
              {
                text: 'Sudah Bayar',
                onPress: () => {
                  if (currentOrderId.current) {
                    checkPaymentStatus(currentOrderId.current);
                  }
                },
              },
            ],
          );
        }, 1000);
      } else {
        Alert.alert(
          'Error',
          `Tidak dapat membuka halaman pembayaran.\n\nURL: ${paymentUrl}\n\nSilakan salin URL dan buka di browser manual.`,
          [
            { text: 'OK' },
            {
              text: 'Salin URL',
              onPress: () => {
                Alert.alert('URL Pembayaran', paymentUrl);
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error opening payment page:', error);
      Alert.alert(
        'Error',
        `Gagal membuka halaman pembayaran.\n\nError: ${error.message}\n\nURL: ${
          paymentUrl || 'N/A'
        }`,
      );
    }
  };

  const BackIcon = () => (
    <Image
      source={require('./assets/back-icon.png')}
      style={{ width: 24, height: 24 }}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Detail Checkout</Text>
        </View>

        {/* Info Pembeli */}
        <Text style={styles.sectionTitle}>Info Pembeli</Text>
        <View style={styles.buyerInfo}>
          <Text style={styles.buyerName}>{buyer.name}</Text>
          <Text style={styles.buyerDetail}>{buyer.community}</Text>
          <Text style={styles.buyerDetail}>{buyer.phone}</Text>
        </View>

        {/* Detail Pesanan */}
        <Text style={styles.sectionTitle}>Detail Pesanan</Text>
        <View style={styles.orderInfo}>
          <Image source={order.image} style={styles.orderImage} />
          <View style={styles.orderDetails}>
            <Text style={styles.orderName}>{order.name}</Text>
            <Text style={styles.orderPrice}>{order.price}</Text>
          </View>
        </View>

        {/* Rincian Pembayaran */}
        <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentLabel}>Metode Pembayaran</Text>
          <Text style={styles.paymentValue}>{payment.method}</Text>
          <Text style={styles.paymentLabel}>Total Harga</Text>
          <Text style={styles.paymentValue}>{payment.total}</Text>
        </View>

        {/* Test Connection Button */}
        <TouchableOpacity style={styles.testBtn} onPress={testConnection}>
          <Text style={styles.testBtnText}>Test Connection</Text>
        </TouchableOpacity>

        {/* Tombol Bayar */}
        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>Bayar</Text>
          )}
        </TouchableOpacity>

        {/* Status Check Button (only show if payment in progress) */}
        {isPaymentInProgress && currentOrderId.current && (
          <TouchableOpacity
            style={styles.statusBtn}
            onPress={() => checkPaymentStatus(currentOrderId.current)}
          >
            <Text style={styles.statusBtnText}>Cek Status Pembayaran</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 34,
    marginBottom: 24,
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 24,
    color: '#1976D2',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  buyerInfo: {
    backgroundColor: '#f5f5f5',
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 8,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  buyerDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  orderInfo: {
    flexDirection: 'row',
    marginHorizontal: 18,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  orderDetails: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  paymentInfo: {
    marginHorizontal: 18,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  testBtn: {
    backgroundColor: '#666',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
    marginHorizontal: 18,
  },
  testBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  payBtn: {
    backgroundColor: '#0072DF',
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 24,
    marginHorizontal: 18,
  },
  payBtnDisabled: {
    backgroundColor: '#ccc',
  },
  payBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBtn: {
    backgroundColor: '#f39c12',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
    marginHorizontal: 18,
  },
  statusBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
