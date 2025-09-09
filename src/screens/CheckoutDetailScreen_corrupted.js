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
          PaymentStatusService.checkAndNavigateIfSuccess(
            currentOrderId.current,
            navigation,
            customerData,
            product,
          ).then(success => {
            if (success) {
              console.log('Payment was successful, navigation handled');
              setIsPaymentInProgress(false);
              currentOrderId.current = null;
            } else {
              console.log('Payment not yet successful or failed');
            }
          });
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
      const response = await fetch('http://192.168.1.11:5000/api/test');
      const data = await response.json();
      console.log('Connection test successful:', data);
      Alert.alert('Connection Test', `Success: ${data.message}`);
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

      // Generate unique order ID
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare order data for Midtrans
      const orderData = {
        orderId: orderId,
        grossAmount: parseInt(product.harga || product.price || 0),
        customerDetails: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email || 'customer@example.com',
          phone: customerData.phone,
        },
        itemDetails: [
          {
            id: product.id || 'PRODUCT-1',
            price: parseInt(product.harga || product.price || 0),
            quantity: 1,
            name: product.nama || product.title || 'Product',
          },
        ],
        paymentType: paymentData.midtransType, // ewallet, credit_card, bank_transfer
        enabledPayments: paymentData.details?.enabled_payments || [paymentData.midtransType],
      };

      console.log('Creating Midtrans transaction with data:', orderData);

      // Create transaction with Midtrans
      const result = await ApiService.createMidtransTransaction(orderData);
      
      if (result.success && result.data) {
        console.log('Midtrans transaction created:', result.data);
        
        // Store current order ID for status checking
        currentOrderId.current = orderId;
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
          throw new Error('Tidak ada URL pembayaran yang diterima dari Midtrans');
        }
      } else {
        throw new Error(result.message || 'Gagal membuat transaksi pembayaran');
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
              onPress: () => openPaymentPage(testUrls[1], testOrderData),
        } else {
          throw new Error('Tidak ada URL pembayaran yang diterima dari Midtrans');
        }
      } else {
        throw new Error(result.message || 'Gagal membuat transaksi pembayaran');
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
      console.log('openPaymentPage called with URL:', paymentUrl);
      console.log('Order data:', orderData);

      // Validate URL
      if (!paymentUrl) {
        console.error('Payment URL is null or undefined');
        Alert.alert('Error', 'URL pembayaran tidak valid. Silakan coba lagi.');
        return;
      }

      // Check if URL is valid format
      if (
        !paymentUrl.startsWith('http://') &&
        !paymentUrl.startsWith('https://')
      ) {
        console.error('Invalid URL format:', paymentUrl);
        Alert.alert('Error', 'Format URL pembayaran tidak valid.');
        return;
      }

      console.log('Checking if URL can be opened:', paymentUrl);

      // For Midtrans URLs, force open without checking support
      const isMidtransUrl =
        paymentUrl.includes('midtrans.com') ||
        paymentUrl.includes('sandbox.midtrans.com');

      let supported = false;
      if (isMidtransUrl) {
        console.log('Midtrans URL detected, forcing open');
        supported = true;
      } else {
        supported = await Linking.canOpenURL(paymentUrl);
        console.log('URL supported:', supported);
      }

      if (supported) {
        console.log('Opening URL in browser...');
        await Linking.openURL(paymentUrl);
        console.log('URL opened successfully');

        // Set payment in progress state
        setIsPaymentInProgress(true);
        currentOrderId.current = orderData.orderId;
        console.log('Payment tracking started for order:', orderData.orderId);

        // Start automatic payment monitoring
        console.log(
          'Starting payment monitoring for order:',
          orderData.orderId,
        );
        PaymentStatusService.startPaymentMonitoring(
          orderData.orderId,
          navigation,
          customerData,
          product,
        );

        // Show dialog for user with auto-monitoring info
        setTimeout(() => {
          Alert.alert(
            'Pembayaran Midtrans',
            'Sistem akan otomatis mendeteksi pembayaran yang berhasil dan mengarahkan Anda ke halaman sukses.\n\nAnda juga bisa konfirmasi manual jika diperlukan.',
            [
              {
                text: 'Belum Bayar',
                style: 'cancel',
              },
              {
                text: 'Cek Status',
                onPress: () => {
                  console.log('User wants to check status manually');
                  PaymentStatusService.checkAndNavigateIfSuccess(
                    orderData.orderId,
                    navigation,
                    customerData,
                    product,
                  );
                },
              },
              {
                text: 'Sudah Bayar',
                onPress: () => {
                  console.log('User confirmed payment completion manually');
                  // Navigate to success screen
                  navigation?.navigate('PaymentSuccessScreen', {
                    orderData: orderData,
                    customerData: customerData,
                    product: product,
                    paymentStatus: 'manual_confirm',
                  });
                },
              },
            ],
          );
        }, 5000); // Wait 5 seconds before showing dialog
      } else {
        console.error('URL not supported by device:', paymentUrl);
        Alert.alert(
          'Error',
          `Tidak dapat membuka halaman pembayaran.\n\nURL: ${paymentUrl}\n\nSilakan salin URL dan buka di browser manual.`,
          [
            { text: 'OK', style: 'default' },
            {
              text: 'Salin URL',
              onPress: () => {
                // For now, just show the URL in alert
                Alert.alert('URL Pembayaran', paymentUrl);
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error opening payment URL:', error);
      Alert.alert(
        'Error',
        `Gagal membuka halaman pembayaran.\n\nError: ${error.message}\n\nURL: ${
          paymentUrl || 'undefined'
        }`,
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backBtn}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Detail Check Out</Text>
        </View>

        {/* Detail Pembeli */}
        <Text style={styles.sectionTitle}>Detail Pembeli</Text>
        <View style={styles.buyerBox}>
          <Text style={styles.buyerText}>{buyer.name}</Text>
          <Text style={styles.buyerText}>{buyer.community}</Text>
          <Text style={styles.buyerText}>{buyer.phone}</Text>
        </View>

        {/* Detail Pesanan */}
        <Text style={styles.sectionTitle}>Detail Pesanan</Text>
        <View style={styles.orderBox}>
          <Image source={order.image} style={styles.productImage} />
          <View style={{ flex: 1, marginLeft: 18, justifyContent: 'center' }}>
            <Text style={styles.orderProductLabel}>Produk</Text>
            <Text style={styles.orderProductName}>{order.name}</Text>
            <Text style={styles.orderProductPrice}>{order.price}</Text>
          </View>
        </View>

        {/* Garis */}
        <View style={styles.dashedLine} />

        {/* Rincian Pembayaran */}
        <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Metode Pembayaran</Text>
          <Text style={styles.paymentValue}>{payment.method}</Text>
        </View>
        <View style={styles.paymentRow}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 34,
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 10,
    marginTop: -6,
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#111',
    fontWeight: 'bold',
    marginTop: 26,
    marginLeft: 22,
    marginBottom: 8,
  },
  buyerBox: {
    backgroundColor: '#0072DF',
    borderRadius: 24,
    marginHorizontal: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  buyerText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 4,
  },
  orderBox: {
    backgroundColor: '#0072DF',
    borderRadius: 24,
    marginHorizontal: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  productImage: {
    width: 96,
    height: 96,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  orderProductLabel: {
    fontSize: 16,
    color: '#fff',
  },
  orderProductName: {
    fontSize: 19,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
    marginBottom: 12,
  },
  orderProductPrice: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  dashedLine: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#0072DF',
    marginHorizontal: 32,
    marginVertical: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 28,
    marginVertical: 4,
  },
  paymentLabel: {
    fontSize: 17,
    color: '#111',
    fontWeight: 'bold',
  },
  paymentValue: {
    fontSize: 17,
    color: '#111',
    fontWeight: '400',
  },
  payBtn: {
    backgroundColor: '#0072DF',
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 34,
    marginBottom: 40,
    width: '62%',
    alignSelf: 'center',
  },
  payBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  testBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
