import { Platform, Alert } from 'react-native';

// Base URL untuk backend API
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:5000/api';
  } else {
    return 'http://localhost:5000/api';
  }
};

const API_URL = getBaseURL();

class PaymentStatusService {
  // Check payment status by order ID
  static async checkPaymentStatus(orderId) {
    try {
      console.log('PaymentStatusService: Checking status for order:', orderId);

      if (!orderId || orderId.trim() === '') {
        throw new Error('Invalid order ID provided');
      }

      const response = await fetch(`${API_URL}/payment/midtrans/status/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('PaymentStatusService: Response status:', response.status);
      console.log('PaymentStatusService: Response ok:', response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        } else if (response.status >= 500) {
          throw new Error('Server error, please try again later');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to check payment status`);
        }
      }

      const data = await response.json();
      console.log('PaymentStatusService: Status response:', data);
      console.log('PaymentStatusService: Status response structure:', JSON.stringify(data, null, 2));

      // Check if the response structure is correct
      if (data.success && data.data) {
        console.log('PaymentStatusService: Using nested data structure');
        return {
          success: true,
          data: data.data, // Use nested data structure
        };
      } else {
        console.log('PaymentStatusService: Using flat data structure');
        return {
          success: true,
          data: data, // Use flat structure
        };
      }
    } catch (error) {
      console.error('PaymentStatusService: Error checking status:', error);
      
      // Handle network errors specifically
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        return {
          success: false,
          error: 'Network connection error. Please check your internet connection.',
        };
      }
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred while checking payment status',
      };
    }
  }

  // Poll payment status with intervals
  static async pollPaymentStatus(
    orderId,
    onStatusUpdate,
    maxAttempts = 30,
    intervalMs = 2000,
  ) {
    let attempts = 0;

    console.log(
      'PaymentStatusService: Starting to poll payment status for:',
      orderId,
    );

    if (!orderId || orderId.trim() === '') {
      console.error('PaymentStatusService: Invalid orderId for polling');
      return {
        success: false,
        completed: false,
        status: 'error',
        error: 'Invalid order ID',
      };
    }

    const poll = async () => {
      attempts++;
      console.log(
        `PaymentStatusService: Poll attempt ${attempts}/${maxAttempts} for order: ${orderId}`,
      );

      try {
        const result = await this.checkPaymentStatus(orderId);

        if (result.success) {
          const { paymentStatus, orderStatus } = result.data;

          console.log('PaymentStatusService: Current status:', {
            paymentStatus,
            orderStatus,
            attempt: attempts,
          });

          // Call callback with status update
          if (onStatusUpdate) {
            onStatusUpdate({
              paymentStatus,
              orderStatus,
              orderData: result.data,
              attempt: attempts,
              maxAttempts,
            });
          }

          // Check if payment is completed
          if (paymentStatus === 'success' || paymentStatus === 'settlement') {
            console.log(
              'PaymentStatusService: Payment completed successfully!',
            );
            return {
              success: true,
              completed: true,
              status: 'success',
              data: result.data,
            };
          }

          // Check if payment failed
          if (
            paymentStatus === 'failed' ||
            paymentStatus === 'cancelled' ||
            paymentStatus === 'expired' ||
            paymentStatus === 'deny'
          ) {
            console.log('PaymentStatusService: Payment failed or cancelled');
            return {
              success: true,
              completed: true,
              status: 'failed',
              data: result.data,
            };
          }

          // Payment still pending, continue polling
          if (attempts < maxAttempts) {
            setTimeout(poll, intervalMs);
          } else {
            console.log(
              'PaymentStatusService: Max attempts reached, stopping poll',
            );
            return {
              success: true,
              completed: false,
              status: 'timeout',
              data: result.data,
            };
          }
        } else {
          console.error(
            'PaymentStatusService: Failed to check status:',
            result.error,
          );

          if (attempts < maxAttempts) {
            setTimeout(poll, intervalMs);
          } else {
            return {
              success: false,
              completed: false,
              status: 'error',
              error: result.error,
            };
          }
        }
      } catch (error) {
        console.error('PaymentStatusService: Poll error:', error);

        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        } else {
          return {
            success: false,
            completed: false,
            status: 'error',
            error: error.message,
          };
        }
      }
    };

    // Start polling
    return poll();
  }

  // Start background monitoring for payment status
  static startPaymentMonitoring(orderId, navigation, customerData, product) {
    console.log(
      'PaymentStatusService: Starting payment monitoring for:',
      orderId,
    );

    const onStatusUpdate = statusInfo => {
      const { paymentStatus, orderStatus, orderData, attempt, maxAttempts } =
        statusInfo;

      console.log('PaymentStatusService: Status update received:', {
        paymentStatus,
        orderStatus,
        attempt,
        maxAttempts,
      });

      // Show progress to user (optional)
      // You can implement a loading indicator here
    };

    this.pollPaymentStatus(orderId, onStatusUpdate, 30, 3000)
      .then(result => {
        console.log('PaymentStatusService: Monitoring completed:', result);

        if (result.success && result.completed) {
          if (result.status === 'success') {
            console.log(
              'PaymentStatusService: Payment successful, navigating to success screen',
            );

            // Navigate to success screen
            navigation?.navigate('PaymentSuccessScreen', {
              orderData: result.data,
              customerData: customerData,
              product: product,
              paymentStatus: 'success',
            });
          } else if (result.status === 'failed') {
            console.log('PaymentStatusService: Payment failed');

            // You can navigate to failure screen or show alert
            // navigation?.navigate('PaymentFailureScreen', { ... });
          } else if (result.status === 'timeout') {
            console.log('PaymentStatusService: Payment status check timeout');

            // Handle timeout case
            // You can show a message to user to check manually
          }
        } else {
          console.error(
            'PaymentStatusService: Monitoring failed:',
            result.error,
          );
        }
      })
      .catch(error => {
        console.error('PaymentStatusService: Monitoring error:', error);
      });
  }

  // Manual check and navigate if payment is successful
  static async checkAndNavigateIfSuccess(
    orderId,
    navigation,
    customerData,
    product,
  ) {
    try {
      console.log('PaymentStatusService: Manual check for order:', orderId);

      const result = await this.checkPaymentStatus(orderId);

      if (result.success) {
        const { paymentStatus, orderStatus } = result.data;

        console.log(
          'PaymentStatusService: Current payment status:',
          paymentStatus,
        );
        console.log('PaymentStatusService: Current order status:', orderStatus);

        if (
          paymentStatus === 'success' ||
          paymentStatus === 'settlement' ||
          orderStatus === 'completed'
        ) {
          console.log(
            'PaymentStatusService: Payment is successful, navigating...',
          );

          // Show success alert first
          Alert.alert(
            'Pembayaran Berhasil!',
            'Pembayaran Anda telah berhasil diproses. Anda akan diarahkan ke halaman sukses.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation?.navigate('PaymentSuccessScreen', {
                    orderData: result.data,
                    customerData: customerData,
                    product: product,
                    paymentStatus: 'success',
                  });
                },
              },
            ],
          );

          return true;
        } else {
          console.log(
            'PaymentStatusService: Payment not yet successful:',
            paymentStatus,
          );

          // Show current status to user
          Alert.alert(
            'Status Pembayaran',
            `Status saat ini: ${paymentStatus}\n\nSilakan coba lagi dalam beberapa saat atau konfirmasi manual jika pembayaran sudah selesai.`,
            [{ text: 'OK' }],
          );

          return false;
        }
      } else {
        console.error(
          'PaymentStatusService: Failed to check status:',
          result.error,
        );

        Alert.alert(
          'Error',
          'Gagal mengecek status pembayaran. Silakan coba lagi.',
          [{ text: 'OK' }],
        );

        return false;
      }
    } catch (error) {
      console.error('PaymentStatusService: Check and navigate error:', error);

      Alert.alert(
        'Error',
        'Terjadi kesalahan saat mengecek status pembayaran.',
        [{ text: 'OK' }],
      );

      return false;
    }
  }
}

export default PaymentStatusService;
