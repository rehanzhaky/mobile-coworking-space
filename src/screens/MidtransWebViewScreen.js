import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import ApiService from '../services/api';
import PaymentStatusService from '../services/paymentStatusService';

const MidtransWebViewScreen = ({ route, navigation }) => {
  const { paymentUrl, orderData, orderId, customerData, product } = route.params;
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(paymentUrl);
  const [lastProcessedUrl, setLastProcessedUrl] = useState('');
  const navigationTimeoutRef = useRef(null);

  useEffect(() => {
    console.log('MidtransWebViewScreen initialized with:', {
      paymentUrl,
      orderData,
      orderId,
      customerData,
      product
    });
    
    // Cleanup timeout on unmount
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Debounced navigation handler to prevent blinking
  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    
    // Clear previous timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    // Only process significant URL changes, ignore hash changes and minor variations
    const currentUrlBase = navState.url ? navState.url.split('#')[0].split('?')[0] : '';
    const lastProcessedUrlBase = lastProcessedUrl.split('#')[0].split('?')[0];
    
    // Skip if URL hasn't changed significantly or is just hash/fragment changes
    if (currentUrlBase === lastProcessedUrlBase) {
      return;
    }
    
    console.log('Navigation state changed:', navState.url);
    
    // Debounce navigation processing to prevent rapid successive calls
    navigationTimeoutRef.current = setTimeout(() => {
      setLastProcessedUrl(navState.url);
      processNavigationUrl(navState.url);
    }, 500); // 500ms debounce
  };

  const processNavigationUrl = (url) => {
    if (!url) return;
    
    // Check if payment is completed based on URL patterns
    if (url.includes('/finish') || 
        url.includes('/success') ||
        url.includes('transaction_status=capture') ||
        url.includes('transaction_status=settlement')) {
      
      console.log('Payment success detected');
      handlePaymentSuccess();
      
    } else if (url.includes('/error') || 
               url.includes('/fail') ||
               url.includes('transaction_status=deny') ||
               url.includes('transaction_status=cancel') ||
               url.includes('transaction_status=expire')) {
      
      console.log('Payment failure detected');
      handlePaymentFailure();
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      console.log('Payment success detected, checking status...');
      // Langsung check status dan navigasi ke success screen
      await checkPaymentStatus();
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  };

  const handlePaymentFailure = () => {
    Alert.alert(
      'Pembayaran Gagal',
      'Pembayaran tidak dapat diproses. Silakan coba lagi atau pilih metode pembayaran lain.',
      [
        {
          text: 'Coba Lagi',
          onPress: () => {
            // Reload the payment page
            setCurrentUrl(paymentUrl + '?retry=' + Date.now());
            setLastProcessedUrl('');
          }
        },
        {
          text: 'Kembali',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking payment status for order:', orderId);
      
      // Use PaymentStatusService for better error handling
      const result = await PaymentStatusService.checkPaymentStatus(orderId);
      
      console.log('💳 Payment status result:', result);
      console.log('🔍 Payment status result structure:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('🔍 Result.data structure:', JSON.stringify(result.data, null, 2));
        const { transaction_status, payment_type } = result.data;
        console.log('Payment status:', transaction_status);
        console.log('Payment type:', payment_type);
        
        if (transaction_status === 'capture' || transaction_status === 'settlement') {
          // Payment successful - langsung navigasi ke success screen
          console.log('✅ Payment confirmed, navigating to success screen');
          navigation.replace('PaymentSuccessScreen', {
            orderData: {
              ...orderData,
              paymentStatus: transaction_status,
              orderId: orderId,
              payment_type: payment_type
            },
            customerData: customerData,
            product: product
          });
        } else if (transaction_status === 'pending') {
          Alert.alert(
            'Pembayaran Pending',
            'Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack()
              }
            ]
          );
        } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
          // Payment failed or cancelled
          Alert.alert(
            'Pembayaran Gagal',
            `Status pembayaran: ${transaction_status}. Silakan coba lagi.`,
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack()
              }
            ]
          );
        } else {
          // Unknown status
          Alert.alert(
            'Status Tidak Dikenal',
            `Status pembayaran: ${transaction_status}`,
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack()
              }
            ]
          );
        }
      } else {
        // Failed to check status
        Alert.alert(
          'Error',
          result.message || 'Gagal mengecek status pembayaran.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
      
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      Alert.alert(
        'Error',
        `Gagal mengecek status pembayaran: ${error.message}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    Alert.alert(
      'Error Memuat Halaman',
      'Gagal memuat halaman pembayaran. Periksa koneksi internet Anda.',
      [
        {
          text: 'Coba Lagi',
          onPress: () => {
            setCurrentUrl(paymentUrl + '?retry=' + Date.now());
            setLastProcessedUrl('');
          }
        },
        {
          text: 'Kembali',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembayaran</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => {
            setCurrentUrl(paymentUrl + '?refresh=' + Date.now());
            setLastProcessedUrl('');
          }}
        >
          <Text style={styles.refreshButtonText}>⟲</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Memuat halaman pembayaran...</Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        source={{ uri: currentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        bounces={false}
        overScrollMode="never"
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 20,
    color: '#007AFF',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  webview: {
    flex: 1,
  },
});

export default MidtransWebViewScreen;
