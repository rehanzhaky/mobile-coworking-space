import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { FontWeight, FontFamily } from '../styles/typography';

// Replace with your assets
const PROFILE_PHOTO = require('./assets/edit-profile.png');
const STAR_ON = require('./assets/star-on.png');
const STAR_OFF = require('./assets/star-off.png');
const PRODUCT_IMAGE = require('./assets/absensi-staff.png');
const ICON_REVIEWED = require('./assets/icon-reviewed.png');
const ICON_NOT_REVIEWED = require('./assets/icon-not-reviewed.png');

const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

export default function MyReviewsScreen({ navigation }) {
  const [tab, setTab] = useState('reviewed');

  // Example dummy review
  const reviews = [
    {
      id: 1,
      user: 'Maxwell',
      community: 'Komunitas Waria',
      photo: PROFILE_PHOTO,
      rating: 4,
      date: '1 hari yang lalu',
      content:
        'Aplikasi dapat digunakan dengan baik, mempermudah komunitas saya untuk melakukan absensi dimana saja, dan saya juga bisa membuat pelaporan dengan baik berdasarkan dari data absensi',
      product: {
        name: 'Aplikasi Absensi Staf',
        image: PRODUCT_IMAGE,
      },
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Ulasan Produk Saya</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tab,
              tab === 'notreviewed' && styles.tabActiveOutline,
            ]}
            onPress={() => setTab('notreviewed')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={ICON_NOT_REVIEWED}
                style={{ width: 22, height: 22, marginRight: 8 }}
              />
              <Text
                style={[
                  styles.tabLabel,
                  tab === 'notreviewed' && { color: '#222' },
                ]}
              >
                Belum Diulas
              </Text>
            </View>
            <Text style={styles.tabDesc}>
              Produk atau Layanan yang belum saya ulas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'reviewed' && styles.tabActive]}
            onPress={() => setTab('reviewed')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={ICON_REVIEWED}
                style={{ width: 22, height: 22, marginRight: 8 }}
              />
              <Text
                style={[
                  styles.tabLabel,
                  tab === 'reviewed' && { color: '#fff' },
                ]}
              >
                Ulasan Saya
              </Text>
            </View>
            <Text
              style={[styles.tabDesc, tab === 'reviewed' && { color: '#fff' }]}
            >
              Produk atau Layanan yang sudah saya ulas
            </Text>
          </TouchableOpacity>
        </View>

        {/* List Ulasan */}
        {tab === 'reviewed' &&
          reviews.map((item, idx) => (
            <View style={styles.reviewCard} key={item.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={item.photo} style={styles.profilePhoto} />
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.userName}>{item.user}</Text>
                  <Text style={styles.userCommunity}>{item.community}</Text>
                </View>
              </View>
              {/* Rating + date */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                {[1, 2, 3, 4, 5].map(i => (
                  <Image
                    key={i}
                    source={item.rating >= i ? STAR_ON : STAR_OFF}
                    style={styles.star}
                  />
                ))}
                <Text style={styles.reviewDate}>{item.date}</Text>
              </View>
              {/* Review Content */}
              <Text style={styles.reviewContent}>{item.content}</Text>
              {/* Product Info */}
              <View style={styles.productRow}>
                <Image
                  source={item.product.image}
                  style={styles.productImage}
                />
                <Text style={styles.productName}>{item.product.name}</Text>
              </View>
            </View>
          ))}

        {/* (Optional) List for tab === 'notreviewed' can be added here */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  backBtn: {
    fontSize: 32,
    color: '#000000',
    marginRight: 10,
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
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#8C8C8C',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginRight: 8,
    marginTop: 35,
    backgroundColor: '#fff',
  },
  tabActive: {
    backgroundColor: '#0070D8',
    borderColor: '#0070D8',
  },
  tabActiveOutline: {
    backgroundColor: '#fff',
    borderColor: '#8C8C8C',
  },
  tabLabel: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#112D4E',
  },
  tabDesc: {
    paddingTop: 10,
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 13,
    color: '#112D4E',
  },
  reviewCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 24,
    marginHorizontal: 18,
    marginTop: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DEDFE0',
  },
  profilePhoto: {
    width: 49,
    height: 49,
    borderRadius: 30,
    backgroundColor: '#D9D9D9',
  },
  userName: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 17,
    color: '#000000',
  },
  userCommunity: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 15,
    color: '#000000',
  },
  star: {
    marginTop: 21,
    width: 24,
    height: 24,
    marginRight: 2,
  },
  reviewDate: {
    marginTop: 21,
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    marginLeft: 12,
    color: '#C4C4C4',
    fontSize: 15,
  },
  reviewContent: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    marginTop: 21,
    fontSize: 16,
    color: '#000000',
    marginBottom: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  productImage: {
    width: 49,
    height: 50,
    borderRadius: 5,
    marginRight: 20,
    backgroundColor: '#112D4E',
  },
  productName: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 17,
    color: '#000000',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 62,
    borderTopWidth: 1,
    borderTopColor: '#E4E8F0',
    backgroundColor: '#fff',
  },
  tabBarIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 5,
  },
  tabBarIconActive: {
    backgroundColor: '#E8F2FC',
    borderRadius: 24,
  },
  tabBarLabelActive: {
    fontSize: 14,
    color: '#0072DF',
    fontWeight: 'bold',
    marginTop: -3,
  },
});
