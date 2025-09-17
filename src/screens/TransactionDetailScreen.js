import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import ApiService from '../services/api';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';
import InvoicePDFModal from '../components/InvoicePDFModal';

const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);
export default function TransactionDetailScreen({ navigation, route }) {
  const [reviewStatus, setReviewStatus] = useState(null);
  const [isLoadingReview, setIsLoadingReview] = useState(true);
  const [showInvoicePDF, setShowInvoicePDF] = useState(false);
  // Function to get status color - same as in MyOrdersScreen
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'selesai':
        return '#11B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
      case 'dibatalkan':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // Get order data from navigation params or use dummy data
  const orderData = route?.params?.order;

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      }) + ' WIB';
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to format payment method
  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'credit_card':
        return 'Kartu Kredit/Debit';
      case 'bank_transfer':
        return 'Transfer Bank';
      case 'ewallet':
        return 'E-Wallet';
      default:
        return method || 'Kartu Kredit/Debit';
    }
  };

  // Helper function to get product category display
  const getProductCategoryDisplay = (category) => {
    switch (category?.toLowerCase()) {
      case 'layanan':
        return 'Layanan';
      case 'produk':
        return 'Produk';
      case 'aplikasi':
        return 'Aplikasi';
      case 'website':
        return 'Website';
      default:
        return 'Produk';
    }
  };

  // Helper function to get order info based on status
  const getOrderInfo = (adminStatus, paymentStatus) => {
    if (paymentStatus === 'settlement' || paymentStatus === 'capture') {
      switch (adminStatus) {
        case 'selesai':
          return 'Produk sudah diberikan oleh Admin';
        case 'sedang diproses':
          return 'Pesanan sedang diproses oleh Admin';
        case 'belum diproses':
          return 'Pesanan menunggu diproses oleh Admin';
        default:
          return 'Pesanan dalam proses';
      }
    } else {
      return 'Menunggu pembayaran';
    }
  };

  const transaction = orderData ? {
    status: orderData.displayStatus || orderData.status || "Pending",
    statusColor: getStatusColor(orderData.displayStatus || orderData.status),
    invoice: orderData.invoiceNumber || orderData.orderNumber || orderData.orderId || "N/A",
    date: formatDate(orderData.createdAt || orderData.date),
    orderId: orderData.orderNumber || orderData.orderId || "N/A",
    reviewText: "Beri Ulasan",
    reviewUrl: "#", // replace with actual link/action
    orderInfo: getOrderInfo(orderData.adminStatus, orderData.paymentStatus),
    orderInfoDate: formatDate(orderData.paidAt || orderData.createdAt || orderData.date),
    orderInfoDetail: "Lihat",
    orderInfoUrl: "#", // replace with actual link/action
    product: {
      name: orderData.title || orderData.productName || "Produk",
      type: getProductCategoryDisplay(orderData.productCategory),
      price: orderData.price || `Rp ${Number(orderData.totalAmount || 0).toLocaleString('id-ID')}`,
      image: require('./assets/pkbi-logo.png'), // replace with your product image
      image2: require('./assets/pkbi-logo.png'), // if you want to display 2 images
    },
    payment: {
      method: formatPaymentMethod(orderData.paymentMethod),
      total: orderData.price || `Rp ${Number(orderData.totalAmount || 0).toLocaleString('id-ID')}`
    },
    // Additional customer information for invoice
    customer: {
      firstName: orderData.firstName || "N/A",
      lastName: orderData.lastName || "N/A",
      email: orderData.email || "N/A",
      phone: orderData.phone || "N/A",
      community: orderData.community || "N/A"
    }
  } : {
    // Fallback dummy data if no order data is passed
    status: "Selesai",
    statusColor: "#11B981",
    invoice: "INV202506170001",
    date: "Selasa, 17 Juni 2025, 19:15 WIB",
    orderId: "PRAPL0001",
    reviewText: "Beri Ulasan",
    reviewUrl: "#", // replace with actual link/action
    orderInfo: "Produk sudah diberikan oleh Admin",
    orderInfoDate: "Selasa, 17 Juni 2025",
    orderInfoDetail: "Lihat",
    orderInfoUrl: "#", // replace with actual link/action
    product: {
      name: "Aplikasi Absensi Staff",
      type: "Aplikasi",
      price: "Rp 2.000.000",
      image: require('./assets/pkbi-logo.png'), // replace with your product image
      image2: require('./assets/pkbi-logo.png'), // if you want to display 2 images
    },
    payment: {
      method: "Kartu Kredit/Debit",
      total: "Rp 2.000.000"
    },
    customer: {
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      phone: "+62812345678",
      community: "Demo Community"
    }
  };

  
  // Function to check review status
  const checkReviewStatus = async () => {
    if (!orderData?.orderNumber && !orderData?.orderId) {
      console.log('⚠️ No order ID found, skipping review status check');
      setIsLoadingReview(false);
      return;
    }

    try {
      const orderId = orderData.orderNumber || orderData.orderId;
      const productId = orderData.productId || orderData.id;
      
      console.log('🔍 Checking review status for order:', orderId, 'product:', productId);
      
      const response = await ApiService.getSecure(`/reviews/check/${orderId}/${productId}`);
      
      if (response.success) {
        setReviewStatus(response.data);
        console.log('✅ Review status:', response.data);
      } else {
        console.log('❌ Failed to check review status:', response.error);
      }
    } catch (error) {
      console.error('❌ Error checking review status:', error);
    } finally {
      setIsLoadingReview(false);
    }
  };

  // Check review status on component mount
  useEffect(() => {
    if (orderData) {
      checkReviewStatus();
    } else {
      setIsLoadingReview(false);
    }
  }, [orderData]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor:'#fff'}}>
      <ScrollView contentContainerStyle={{paddingBottom: 40}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Detail Transaksi</Text>
        </View>

        {/* Info transaksi */}
        <View style={styles.infoRows}>
          <View style={styles.row}>
            <Text style={styles.label}>Status Transaksi</Text>
            <Text style={[styles.value, {color: transaction.statusColor, fontWeight:'medium'}]}>{transaction.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice</Text>
            <TouchableOpacity onPress={() => setShowInvoicePDF(true)}>
              <Text style={[styles.value, {color:'#44A5FF', textDecorationLine: 'none'}]}>{transaction.invoice}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal</Text>
            <Text style={styles.value}>{transaction.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={[styles.value, {fontWeight:'medium'}]}>{transaction.orderId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ulasan</Text>
            {isLoadingReview ? (
              <Text style={[styles.value, {color:'#666'}]}>Memuat...</Text>
            ) : reviewStatus?.hasReviewed ? (
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <Text style={[styles.value, {color:'#11B981', fontWeight:'medium'}]}>Sudah direview</Text>
                <Text style={[styles.value, {color:'#666', fontSize: 12, marginTop: 2}]}>
                  Rating: {reviewStatus.review?.rating}/5 ⭐
                </Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => {
                console.log('📝 Navigating to ReviewProductScreen with order data:', orderData);
                try {
                  if (navigation && typeof navigation.navigate === 'function') {
                    navigation.navigate('ReviewProductScreen', { 
                      order: orderData,
                      product: {
                        id: orderData?.productId || orderData?.id,
                        name: orderData?.title || orderData?.productName || 'Produk',
                        orderId: orderData?.orderId || orderData?.orderNumber
                      }
                    });
                  } else {
                    console.error('❌ Navigation object not available');
                  }
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                }
              }}>
                <Text style={[styles.value, {color:'#1976D2', fontWeight:'medium'}]}>Beri Ulasan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Info Orderan */}
        <View style={styles.infoOrderBlock}>
          <Text style={styles.infoOrderLabel}>Informasi Orderan</Text>
          <View style={{flexDirection:'row', alignItems:'flex-end', justifyContent:'space-between'}}>
            <View>
              <Text style={styles.infoOrderText}>{transaction.orderInfo}</Text>
              <Text style={styles.infoOrderDate}>{transaction.orderInfoDate}</Text>
            </View>
            {/* <TouchableOpacity onPress={() => {
              console.log('📱 Navigating to InfoOrderanScreen with order data:', orderData);
              try {
                if (navigation && typeof navigation.navigate === 'function') {
                  navigation.navigate('InfoOrderanScreen', {
                    order: orderData,
                    orderId: orderData?.orderId || orderData?.orderNumber || orderData?.id
                  });
                } else {
                  console.error('❌ Navigation object not available');
                }
              } catch (error) {
                console.error('❌ Navigation error:', error);
              }
            }}>
              <Text style={styles.infoOrderDetail}>{transaction.orderInfoDetail}</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Detail Pesanan */}
        <View style={styles.orderBoxOuter}>
          <Text style={styles.orderBoxTitle}>Detail Pesanan</Text>
          <View style={styles.orderBox}>
            <Image source={transaction.product.image} style={styles.productImage}/>
            {/* <Image source={transaction.product.image2} style={styles.productImage}/> */}
            <View style={styles.orderBoxInfo}>
              <Text style={styles.productName}>{transaction.product.name}</Text>
              <Text style={styles.productType}>{transaction.product.type}</Text>
              <View style={styles.priceBubble}>
                <Text style={styles.priceText}>{transaction.product.price}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rincian Pembayaran */}
        <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Metode Pembayaran</Text>
          <Text style={styles.paymentValue}>{transaction.payment.method}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Total Harga</Text>
          <Text style={styles.paymentValue}>{transaction.payment.total}</Text>
        </View>

      </ScrollView>

      {/* Invoice PDF Modal */}
      <InvoicePDFModal
        visible={showInvoicePDF}
        onClose={() => setShowInvoicePDF(false)}
        orderData={{
          ...orderData,
          // Ensure all required fields are available
          invoiceNumber: transaction.invoice,
          formattedDate: transaction.date,
          formattedPaymentMethod: transaction.payment.method,
          formattedPrice: transaction.product.price,
          formattedTotal: transaction.payment.total,
          customerInfo: transaction.customer,
          productInfo: transaction.product,
          orderInfo: transaction.orderInfo
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection:'row',
    alignItems:'center',
    marginTop:34,
    marginBottom:15,
    paddingHorizontal:18
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 10,
    marginTop: -6
  },
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    flex: 1,
    fontSize: 26,
    color: '#0070D8',
    textAlign: 'center'
  },
  infoRows: {
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 24,
  },
  row: {
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom: 15
  },
  label: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 16,
    color: '#646464',
  },
  value: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 16,
    color: '#222',
  },
  infoOrderBlock: {
    marginHorizontal: 24,
    marginBottom: 20,
    marginTop: 8
  },
  infoOrderLabel: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 17,
    color: '#000',
    marginBottom: 2
  },
  infoOrderText: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    color: '#646464',
    fontSize: 16,
    marginBottom: 2
  },
  infoOrderDate: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    color: '#646464',
    fontSize: 14
  },
  infoOrderDetail: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    color:'#1976D2',
    fontSize:16,
    marginLeft: 18,
  },
  orderBoxOuter: {
    marginHorizontal: 20,
    marginVertical: 18,
    backgroundColor: '#1E88E5',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  orderBoxTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  orderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fff",
    padding: 18
  },
  productImage: {
    width: 70,
    height: 90,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'contain'
  },
  orderBoxInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  productName: {
    color: '#fff',
    fontSize: 17,
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    marginBottom: 3
  },
  productType: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    marginBottom: 14,
  },
  priceBubble: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  priceText: {
    color: '#1E88E5',
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 14
  },
  sectionTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#000',
    marginTop: 24,
    marginLeft: 22,
    marginBottom: 8
  },
  paymentRow: {
    flexDirection:'row',
    justifyContent:'space-between',
    marginHorizontal: 28,
    marginVertical: 4
  },
  paymentLabel: {
    fontSize: 17,
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    color: '#646464'
  },
  paymentValue: {
    fontSize: 17,
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    color: '#000000'
  },
});