import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';

const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

// Replace with your icon assets
const ICON_PRODUCT = require('./assets/icon-product.png');
const ICON_PAYMENT = require('./assets/icon-payment.png');
const ICON_PROMO = require('./assets/icon-promo.png');

export default function NotificationScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Semua');
  // Example notification data
  const notifications = [
    {
      id: 1,
      type: 'Produk Baru',
      icon: ICON_PRODUCT,
      title: 'Produk Baru!!',
      description:
        'Aplikasi pelaporan bencana secara real time menggunakan teknologi AI',
      time: '1 menit yang lalu',
      action: {
        label: 'Lihat Produk',
        onPress: () => {}, // Implement your navigation
      },
    },
    {
      id: 2,
      type: 'Pembayaran',
      icon: ICON_PAYMENT,
      title: 'Pembayaran Berhasil',
      description:
        'Pesanan anda dengan nomor order PRAPL001 berhasil dibayar. Produk akan segera diproses',
      time: '1 hari yang lalu',
      amount: 'Rp 20.500.000',
    },
    {
      id: 3,
      type: 'Promosi',
      icon: ICON_PROMO,
      title: 'Promo Ulang Tahun PKBI Kepri',
      description:
        'Dapatkan diskon hingga 17% untuk semua produk dan layanan. Buruan sebelum kehabisan',
      time: '1 hari yang lalu',
      promo: 'Diskon 17%',
    },
  ];

  // Tab filter logic (for demo, all tabs show all notifications)
  const tabList = ['Semua', 'Produk Baru', 'Pesanan', 'Promosi', 'Pembayaran'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Notifikasi</Text>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabRow}
        >
          {tabList.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Notification List */}
        {notifications.map(item => (
          <View key={item.id} style={styles.notifBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={item.icon} style={styles.notifIcon} />
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
            <Text style={styles.notifDesc}>{item.description}</Text>
            {item.action && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={item.action.onPress}
              >
                <Text style={styles.actionBtnText}>{item.action.label}</Text>
              </TouchableOpacity>
            )}
            {item.amount && (
              <View style={styles.amountBox}>
                <Text style={styles.amountText}>{item.amount}</Text>
              </View>
            )}
            {item.promo && (
              <View style={styles.promoBox}>
                <Text style={styles.promoText}>{item.promo}</Text>
              </View>
            )}
            <View style={styles.notifDivider} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 73,
    marginBottom: 31,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 8,
    marginTop: -6,
  },
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    flex: 1,
    fontSize: 24,
    color: '#0070D8',
    textAlign: 'center',
  },
  tabScrollView: {
    marginTop: 18,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  tab: {
    marginBottom: 42,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#646464',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  tabActive: {
    backgroundColor: '#0070D8',
    borderColor: '#0070D8',
  },
  tabText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 14,
    color: '#112D4E',
  },
  tabTextActive: {
    color: '#fff',
  },
  notifBox: {
    marginHorizontal: 17,
    marginBottom: 12,
    paddingBottom: 8,
  },
  notifIcon: {
    width: 26,
    height: 26,
    marginRight: 10,
  },
  notifTitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#000000',
    marginRight: 8,
  },
  notifTime: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    marginLeft: 'auto',
    color: '#717182',
    fontSize: 14,
  },
  notifDesc: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    marginTop: 8,
    fontSize: 16,
    color: '#000',
    marginBottom: 6,
  },
  actionBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#0070D8',
    borderRadius: 500,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 8,
  },
  actionBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#0070D8',
  },
  amountBox: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#00B69B',
    borderRadius: 500,
    paddingHorizontal: 13,
    paddingVertical: 3,
    marginBottom: 8,
  },
  amountText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#00B69B',
  },
  promoBox: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#FF272D',
    borderRadius: 500,
    paddingHorizontal: 13,
    paddingVertical: 3,
    marginBottom: 8,
  },
  promoText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#FF272D',
    fontSize: 16,
  },
  notifDivider: {
    height: 1,
    backgroundColor: '#E5E8EC',
    marginTop: 8,
  },
});
