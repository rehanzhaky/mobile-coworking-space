import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { FontFamily, FontWeight } from '../styles/typography';

const { width } = Dimensions.get('window');

const CloseIcon = () => (
  <Image
    source={require('../screens/assets/pkbi-logo.png')}
    style={{ width: 24, height: 24 }}
  />
);

const ShareIcon = () => (
  <Image
    source={require('../screens/assets/send-icon.png')}
    style={{ width: 20, height: 20 }}
  />
);

export default function InvoicePDFModal({ visible, onClose, orderData }) {
  // Format data for invoice
  const invoiceData = {
    customerName: `${orderData?.firstName || orderData?.name || 'Customer'} ${orderData?.lastName || ''}`.trim(),
    email: orderData?.email || orderData?.customerEmail || 'customer@example.com',
    date: orderData?.paidAt ? new Date(orderData.paidAt).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : orderData?.date || new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    invoiceNumber: orderData?.invoiceNumber || orderData?.orderNumber || 'INV202506170001',
    orderId: orderData?.orderId || orderData?.orderNumber || 'PRAPL0001',
    totalAmount: orderData?.totalAmount || orderData?.price || 2000000,
    productName: orderData?.productName || orderData?.title || 'Aplikasi Absensi Staf',
    productCategory: orderData?.productCategory || 'Produk',
    productPrice: orderData?.productPrice || orderData?.price || orderData?.totalAmount || 2000000,
    paymentMethod: orderData?.paymentMethod === 'credit_card' ? 'Kartu Kredit/Debit' : 
                   orderData?.paymentMethod === 'bank_transfer' ? 'Transfer Bank' :
                   orderData?.paymentMethod === 'ewallet' ? 'E-Wallet' :
                   orderData?.paymentMethod || 'Kartu Kredit/Debit'
  };

  const formatPrice = (price) => {
    if (!price) return 'Rp 0';
    const numPrice = typeof price === 'string' ? parseInt(price.replace(/[^\d]/g, '')) : price;
    return `Rp ${numPrice.toLocaleString('id-ID')}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice ${invoiceData.invoiceNumber}\nCustomer: ${invoiceData.customerName}\nTotal: ${formatPrice(invoiceData.totalAmount)}\nProduct: ${invoiceData.productName}`,
        title: `Invoice ${invoiceData.invoiceNumber}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal membagikan invoice');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Invoice PDF</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <ShareIcon />
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CloseIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* PDF-like Content */}
        <View style={styles.scrollContainer}>
          <ScrollView
            style={styles.pdfContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            bounces={true}
          >
          <View style={styles.pdfPage}>
            {/* Company Header */}
            <View style={styles.companyHeader}>
              <Image
                source={require('../screens/assets/sembangin-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.companyTitle}>Co-Working Space</Text>
              <Text style={styles.companySubtitle}>Produk & Layanan Ruang Kerja</Text>
              <View style={styles.blueLine} />
            </View>

            {/* Invoice Info */}
            <View style={styles.invoiceSection}>
              <Text style={styles.sectionTitle}>Pesanan anda</Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <Text style={styles.infoLabel}>nama</Text>
                    <Text style={styles.infoValue}>{invoiceData.customerName}</Text>
                  </View>
                  <View style={styles.infoRight}>
                    <Text style={styles.infoLabel}>Tanggal</Text>
                    <Text style={styles.infoValue}>{invoiceData.date}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{invoiceData.email}</Text>
                  </View>
                  <View style={styles.infoRight}>
                    <Text style={styles.infoLabel}>Harga Total</Text>
                    <Text style={styles.infoValue}>{formatPrice(invoiceData.totalAmount)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Product Detail Card */}
            <View style={styles.productCard}>
              <Text style={styles.productCardTitle}>Detail Pesanan</Text>
              <View style={styles.productDetail}>
                <View style={styles.productImageContainer}>
                  <Image
                    source={require('../screens/assets/absensi-staff.png')}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{invoiceData.productName}</Text>
                  <Text style={styles.productCategory}>{invoiceData.productCategory}</Text>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{formatPrice(invoiceData.productPrice)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Payment Details */}
            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Metode Pembayaran</Text>
                <Text style={styles.paymentValue}>{invoiceData.paymentMethod}</Text>
              </View>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Total Harga</Text>
                <Text style={styles.paymentValue}>{formatPrice(invoiceData.totalAmount)}</Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Jalan Koka Tua II, Desa Toopaya Selatan, RT/RW 001/001, Kec.
              </Text>
              <Text style={styles.footerText}>
                Toopaya, Kabupaten Bintan, Kepulauan Riau, Indonesia
              </Text>
              <Text style={styles.footerText}>
                Hubungi: +62 823-8814-9914
              </Text>
            </View>
          </View>
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#0070D8',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0070D8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  shareText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 14,
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdfContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    minHeight: 1000, // Force content to be taller than screen to enable scrolling
  },
  pdfPage: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  companyHeader: {
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EC',
    marginBottom: 25,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  companyTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 34,
    color: '#0070D8',
    marginBottom: 5,
  },
  companySubtitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 18,
    color: '#000',
    marginBottom: 20,
  },
  blueLine: {
    width: width - 80,
    height: 4,
    backgroundColor: '#0070D8',
  },
  invoiceSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 18,
    color: '#112D4E',
    marginBottom: 15,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLeft: {
    flex: 1,
    marginRight: 20,
  },
  infoRight: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: '#717182',
    marginBottom: 5,
  },
  infoValue: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 16,
    color: '#112D4E',
  },
  productCard: {
    backgroundColor: '#0070D8',
    borderRadius: 15,
    padding: 18,
    marginBottom: 20,
  },
  productCardTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  productDetail: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImageContainer: {
    width: 80,
    height: 60,
    marginRight: 15,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  productCategory: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  priceTag: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 14,
    color: '#0070D8',
  },
  paymentSection: {
    marginBottom: 25,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EC',
  },
  paymentLabel: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: '#717182',
  },
  paymentValue: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 14,
    color: '#112D4E',
  },
  footer: {
    backgroundColor: '#0070D8',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20, // Extra margin at bottom for better scrolling
  },
  footerText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 18,
  },
});
