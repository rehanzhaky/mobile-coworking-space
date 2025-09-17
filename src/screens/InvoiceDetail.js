import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InvoiceDetail = ({ route, navigation }) => {
  const { invoiceNumber, transactionData } = route.params;
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      const response = await fetch(`https://your-api.com/api/invoices/${invoiceNumber}`);
      const data = await response.json();
      setInvoiceData(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice ${invoiceNumber} - Total: Rp ${invoiceData?.totalAmount?.toLocaleString('id-ID')}`,
        url: `https://your-admin-panel.com/invoices/${invoiceNumber}`, // Link ke admin panel
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal membagikan invoice');
    }
  };

  const handleDownload = () => {
    // Implementasi download PDF invoice
    Alert.alert('Download', 'Fitur download akan segera tersedia');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Detail</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Icon name="share" size={24} color="#1976D2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
            <Icon name="download" size={24} color="#1976D2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Company Header */}
      <View style={styles.companyHeader}>
        <Text style={styles.companyName}>Sembayo METAWORK</Text>
        <Text style={styles.serviceTitle}>Co-Working Space</Text>
        <Text style={styles.serviceSubtitle}>Produk & Layanan Ruang Kerja</Text>
      </View>

      {/* Invoice Info */}
      <View style={styles.invoiceInfo}>
        <Text style={styles.sectionTitle}>Pesanan anda</Text>
        
        <View style={styles.customerInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>nama</Text>
            <Text style={styles.infoValue}>
              {invoiceData?.customerName || 'Muhammad Haris'}
            </Text>
            
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>
              {invoiceData?.customerEmail || 'dewaharis@gmail.com'}
            </Text>
          </View>
          
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>
              {invoiceData?.date || 'Sabtu, 11 Agustus 2024'}
            </Text>
            
            <Text style={styles.infoLabel}>Harga Total</Text>
            <Text style={styles.infoValue}>
              Rp {invoiceData?.totalAmount?.toLocaleString('id-ID') || '1.400.000'}
            </Text>
          </View>
        </View>
      </View>

      {/* Product Details */}
      <View style={styles.productSection}>
        <Text style={styles.productSectionTitle}>Detail Pesanan</Text>
        <View style={styles.productCard}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>Aplikasi Absensi Staf</Text>
            <Text style={styles.productCategory}>Produk</Text>
          </View>
          <View style={styles.productPrice}>
            <Text style={styles.priceText}>Rp 2.000.000</Text>
          </View>
        </View>
      </View>

      {/* Payment Summary */}
      <View style={styles.paymentSummary}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Rincian Pembayaran</Text>
          <Text style={styles.paymentMethodText}>Kartu Kredit/Debit</Text>
        </View>
        
        <Text style={styles.methodLabel}>Metode Pembayaran</Text>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Harga</Text>
          <Text style={styles.totalAmount}>Rp 289.000</Text>
        </View>
      </View>

      {/* Company Footer */}
      <View style={styles.companyFooter}>
        <Text style={styles.footerAddress}>
          Jalan Kaka Tua II, Desa Toopaya Selatan, RT/RW 001/001, Kec,{'\n'}
          Toopaya, Kabupaten Bintan, Kepulauan Riau, Indonesia{'\n'}
          Hubungi: +62 823-8814-9916
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
  companyHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 3,
    borderBottomColor: '#1976D2',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  invoiceInfo: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginTop: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  productSection: {
    padding: 24,
  },
  productSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#1976D2',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 0,
  },
  productCard: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  productPrice: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  paymentSummary: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#666',
  },
  methodLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    color: '#000',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  companyFooter: {
    backgroundColor: '#f5f5f5',
    padding: 24,
    alignItems: 'center',
  },
  footerAddress: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default InvoiceDetail;