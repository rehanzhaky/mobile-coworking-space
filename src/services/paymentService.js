import axios from 'axios';

const API_URL = 'http://192.168.1.4:5000'; // Real device - computer IP address

class PaymentService {
  // Create transaction and get Snap token
  async createTransaction(orderData) {
    try {
      console.log('PaymentService: Creating transaction with data:', orderData);
      console.log('PaymentService: Data type:', typeof orderData);
      console.log('PaymentService: Data keys:', Object.keys(orderData || {}));
      console.log(
        'PaymentService: API URL:',
        `${API_URL}/api/payment/create-transaction`,
      );

      const response = await axios.post(
        `${API_URL}/api/payment/create-transaction`,
        orderData,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(
        'PaymentService: Transaction created successfully:',
        response.data,
      );

      return response.data;
    } catch (error) {
      console.error('PaymentService: Error creating transaction:', error);

      if (error.response) {
        throw new Error(
          error.response.data.message || 'Failed to create transaction',
        );
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  // Get order status
  async getOrderStatus(orderId) {
    try {
      console.log('PaymentService: Getting order status for:', orderId);

      const response = await axios.get(
        `${API_URL}/api/payment/order/${orderId}`,
      );

      console.log('PaymentService: Order status retrieved:', response.data);

      return response.data;
    } catch (error) {
      console.error('PaymentService: Error getting order status:', error);

      if (error.response) {
        throw new Error(
          error.response.data.message || 'Failed to get order status',
        );
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  // Get all orders (for admin)
  async getAllOrders() {
    try {
      console.log('PaymentService: Getting all orders');

      const response = await axios.get(`${API_URL}/api/payment/orders`);

      console.log('PaymentService: All orders retrieved:', response.data);

      return response.data;
    } catch (error) {
      console.error('PaymentService: Error getting all orders:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get orders');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  // Format order data for API
  formatOrderData(customerData, productData, paymentData) {
    return {
      // Customer information
      customerData: {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        community: customerData.community,
        province: customerData.province,
        city: customerData.city,
        phone: customerData.phone,
        postal: customerData.postal,
      },

      // Product information
      product: {
        id: productData.id,
        nama: productData.nama || productData.title,
        harga: productData.harga || productData.price,
        kategori: productData.kategori || productData.category,
      },
      actionType: productData.actionType,

      // Payment information
      paymentData: {
        method: paymentData.method,
        label: paymentData.label,
        details: paymentData.details,
      },
    };
  }

  // Validate order data before sending
  validateOrderData(orderData) {
    const requiredFields = [
      'firstName',
      'lastName',
      'province',
      'city',
      'phone',
      'postal',
      'product',
      'paymentMethod',
    ];

    const missingFields = [];

    requiredFields.forEach(field => {
      if (!orderData[field]) {
        missingFields.push(field);
      }
    });

    // Validate product data
    if (orderData.product) {
      const requiredProductFields = ['id', 'nama', 'harga', 'kategori'];
      requiredProductFields.forEach(field => {
        if (!orderData.product[field]) {
          missingFields.push(`product.${field}`);
        }
      });
    }

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return true;
  }

  // Format payment method for display
  formatPaymentMethod(method) {
    const methodMap = {
      ewallet: 'E-Wallet',
      credit_card: 'Kartu Kredit/Debit',
      bank_transfer: 'Transfer Bank',
    };

    return methodMap[method] || method;
  }

  // Format order status for display
  formatOrderStatus(status) {
    const statusMap = {
      pending: 'Menunggu Pembayaran',
      paid: 'Sudah Dibayar',
      processing: 'Sedang Diproses',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };

    return statusMap[status] || status;
  }

  // Format payment status for display
  formatPaymentStatus(status) {
    const statusMap = {
      pending: 'Menunggu',
      settlement: 'Berhasil',
      capture: 'Berhasil',
      deny: 'Ditolak',
      cancel: 'Dibatalkan',
      expire: 'Kedaluwarsa',
      failure: 'Gagal',
    };

    return statusMap[status] || status;
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

export default new PaymentService();
