import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking
} from 'react-native';

export default function TransactionDetailScreen({ navigation }) {
  // Dummy data, replace with your real data or props
  const transaction = {
    status: "Selesai",
    statusColor: "#11B981",
    invoice: "INV202506170001",
    date: "17 Juni 2025, 19:15 WIB",
    orderId: "PRAPL0001",
    reviewText: "Beri Ulasan",
    reviewUrl: "#", // replace with actual link/action
    orderInfo: "Produk sudah diberikan oleh Admin",
    orderInfoDate: "Selasa, 17 Juni 2025",
    orderInfoDetail: "Lihat",
    orderInfoUrl: "#", // replace with actual link/action
    product: {
      name: "Aplikasi Absensi Staf",
      type: "Produk",
      price: "Rp 2.000.000",
      image: require('./assets/absensi-staff.png'), // replace with your product image
      image2: require('./assets/absensi-staff2.png'), // if you want to display 2 images
    },
    payment: {
      method: "Kartu Kredit/Debit",
      total: "Rp 289.000"
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor:'#fff'}}>
      <ScrollView contentContainerStyle={{paddingBottom: 40}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backBtn}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Detail Transaksi</Text>
        </View>

        {/* Info transaksi */}
        <View style={styles.infoRows}>
          <View style={styles.row}>
            <Text style={styles.label}>Status Transaksi</Text>
            <Text style={[styles.value, {color: transaction.statusColor, fontWeight:'bold'}]}>{transaction.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice</Text>
            <Text style={[styles.value, {color:'#2992F3'}]} onPress={() => Linking.openURL(transaction.invoiceUrl)}>{transaction.invoice}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal</Text>
            <Text style={styles.value}>{transaction.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={[styles.value, {fontWeight:'bold'}]}>{transaction.orderId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ulasan</Text>
            <Text style={[styles.value, {color:'#1976D2', fontWeight:'bold'}]} onPress={() => Linking.openURL(transaction.reviewUrl)}>{transaction.reviewText}</Text>
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
            <TouchableOpacity onPress={() => Linking.openURL(transaction.orderInfoUrl)}>
              <Text style={styles.infoOrderDetail}>{transaction.orderInfoDetail}</Text>
            </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection:'row',
    alignItems:'center',
    marginTop:34,
    marginBottom:10,
    paddingHorizontal:18
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 10,
    marginTop: -6
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1976D2',
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
    marginBottom: 8
  },
  label: {
    fontSize: 16,
    color: '#888',
  },
  value: {
    fontSize: 16,
    color: '#222',
  },
  infoOrderBlock: {
    marginHorizontal: 24,
    marginBottom: 20,
    marginTop: 8
  },
  infoOrderLabel: {
    fontSize: 17,
    color: '#111',
    fontWeight: 'bold',
    marginBottom: 2
  },
  infoOrderText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 2
  },
  infoOrderDate: {
    color: '#888',
    fontSize: 14
  },
  infoOrderDetail: {
    color:'#1976D2',
    fontWeight:'bold',
    fontSize:16,
    marginLeft: 12
  },
  orderBoxOuter: {
    marginHorizontal: 16,
    marginVertical: 16
  },
  orderBoxTitle: {
    color: "#fff",
    backgroundColor: "#0072DF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 10,
    paddingLeft: 18
  },
  orderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#0072DF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
    padding: 18
  },
  productImage: {
    width: 80,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginRight: 14
  },
  orderBoxInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  productName: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 3
  },
  productType: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16
  },
  priceBubble: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 7,
    paddingHorizontal: 22,
    alignSelf: 'flex-start'
  },
  priceText: {
    color: '#0072DF',
    fontWeight: 'bold',
    fontSize: 19
  },
  sectionTitle: {
    fontSize: 20,
    color: '#111',
    fontWeight: 'bold',
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
    color: '#888'
  },
  paymentValue: {
    fontSize: 17,
    color: '#222',
    fontWeight: '400'
  },
});