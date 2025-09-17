import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { FontWeight, FontFamily } from '../styles/typography';
import ApiService from '../services/api';

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
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Refresh reviews when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchReviews();
    }, [])
  );

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching my reviews...');
      const response = await ApiService.getSecure('/reviews/my-reviews');
      console.log('📥 My reviews API response:', response);
      console.log('🔍 Response data structure:', JSON.stringify(response.data, null, 2));
      
      if (response.success) {
        // Handle multiple possible response structures
        let reviewsData = [];
        if (Array.isArray(response.data?.data)) {
          reviewsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          reviewsData = response.data;
        } else if (response.data && Array.isArray(response.data.reviews)) {
          reviewsData = response.data.reviews;
        }
        
        console.log('✅ My reviews data:', reviewsData);
        console.log('📊 Number of reviews:', reviewsData.length);
        setReviews(reviewsData);
      } else {
        console.log('❌ Error fetching reviews:', response.message || response.error);
        Alert.alert('Error', response.message || response.error || 'Failed to fetch reviews');
        setReviews([]); // Set to empty array on error
      }
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      Alert.alert('Error', 'Failed to fetch reviews');
      setReviews([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007BFF']}
            tintColor="#007BFF"
          />
        }
      >
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

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>Memuat ulasan...</Text>
          </View>
        )}

        {/* List Ulasan */}
        {!loading && tab === 'reviewed' && (
          <>
            {reviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Belum ada ulasan yang diberikan</Text>
              </View>
            ) : (
              reviews.map((item, idx) => (
                <View style={styles.reviewCard} key={item.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image 
                      source={PROFILE_PHOTO} 
                      style={styles.profilePhoto} 
                    />
                    <View style={{ marginLeft: 14 }}>
                      <Text style={styles.userName}>Saya</Text>
                      <Text style={styles.userCommunity}>Pengguna Aplikasi</Text>
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
                    <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
                  </View>
                  {/* Review Content */}
                  <Text style={styles.reviewContent}>{item.comment}</Text>
                  {/* Product Info */}
                  <View style={styles.productRow}>
                    <Image
                      source={PRODUCT_IMAGE}
                      style={styles.productImage}
                    />
                    <Text style={styles.productName}>{item.productName}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Tab untuk "Belum Diulas" - bisa dikembangkan nanti */}
        {!loading && tab === 'notreviewed' && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Fitur ini akan segera tersedia</Text>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: FontFamily.outfit_light,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: FontFamily.outfit_light,
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
