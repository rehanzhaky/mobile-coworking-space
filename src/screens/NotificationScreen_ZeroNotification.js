import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView
} from 'react-native';

// Replace with your assets
const ICON_EMPTY_BELL = require('./assets/empty-bell.png');
const NOTE_IMG = require('./assets/note-img.png');
const TRIANGLE_IMG = require('./assets/triangle-img.png');

export default function NotificationScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backBtn}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Notifikasi</Text>
        </View>

        {/* Empty Notification Content */}
        <View style={styles.emptyContainer}>
          {/* Decorative Images */}
          <Image source={NOTE_IMG} style={styles.noteImg} resizeMode="contain" />
          <Image source={TRIANGLE_IMG} style={styles.triangleImg} resizeMode="contain" />

          {/* Bell Icon */}
          <Image source={ICON_EMPTY_BELL} style={styles.bellImg} resizeMode="contain" />

          <Text style={styles.emptyTitle}>Belum Ada Notifikasi</Text>
          <Text style={styles.emptyDesc}>
            Notifikasi terkait pesanan, promo, update produk terbaru, dan pesan dari admin akan muncul disini
          </Text>
        </View>

        {/* Bottom Tab Bar (dummy, for look) */}
        <View style={styles.tabBar}>
          <View style={[styles.tabBarIcon, styles.tabBarIconActive]}>
            <Text style={{ fontSize: 26, color: '#1976D2' }}>🏠</Text>
            <Text style={styles.tabBarLabelActive}>Beranda</Text>
          </View>
          <View style={styles.tabBarIcon}><Text style={{ fontSize: 26 }}>📦</Text></View>
          <View style={styles.tabBarIcon}><Text style={{ fontSize: 26 }}>💬</Text></View>
          <View style={styles.tabBarIcon}><Text style={{ fontSize: 26 }}>👤</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 34,
    marginBottom: 0,
    paddingHorizontal: 18,
    justifyContent: 'center'
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 8,
    marginTop: -6
  },
  title: {
    flex: 1,
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 64,
    justifyContent: 'flex-start'
  },
  bellImg: {
    width: 95,
    height: 95,
    marginBottom: 24,
    marginTop: 20
  },
  noteImg: {
    position: 'absolute',
    left: 0,
    top: 80,
    width: 130,
    height: 110,
    zIndex: -1
  },
  triangleImg: {
    position: 'absolute',
    right: 0,
    bottom: 70,
    width: 80,
    height: 85,
    zIndex: -1
  },
  emptyTitle: {
    color: '#1976D2',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16
  },
  emptyDesc: {
    color: '#1976D2',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 62,
    borderTopWidth: 1,
    borderTopColor: '#E4E8F0',
    backgroundColor: '#fff'
  },
  tabBarIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 5
  },
  tabBarIconActive: {
    backgroundColor: '#E8F2FC',
    borderRadius: 24
  },
  tabBarLabelActive: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: 'bold',
    marginTop: -3
  }
});