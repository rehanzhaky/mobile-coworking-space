import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';
import ApiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SearchIcon = () => (
  <Image
    source={require('./assets/search-icon.png')}
    style={{ width: 20, height: 20 }}
  />
);

// Notification Icon with Badge
const NotificationIcon = ({ unreadCount = 0 }) => {
  console.log('🔔 NotificationIcon rendering with unreadCount:', unreadCount);

  try {
    return (
      <View style={styles.notificationIconContainer}>
        <Image
          source={require('./assets/notification-icon.png')}
          style={{ width: 20, height: 20, marginRight: 10 }}
        />
        {/* Show badge only when there are unread notifications */}
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </View>
    );
  } catch (error) {
    console.log('❌ NotificationIcon error:', error);
    return (
      <View style={styles.notificationIconContainer}>
        <Image
          source={require('./assets/notification-icon.png')}
          style={{ width: 20, height: 20, marginRight: 10 }}
        />
        {/* Show badge only when there are unread notifications */}
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </View>
    );
  }
};

const promoImages = [
  // Replace with your real images
  { id: 'promo1', image: 'https://i.imgur.com/H6b1KqK.png' },
  { id: 'promo2', image: 'https://i.imgur.com/H6b1KqK.png' },
];

const products = [
  {
    id: '1',
    title: 'Aplikasi Data Relawan',
    subtitle: 'Aplikasi untuk mengelola data relawan',
    desc: 'Aplikasi ini membantu organisasi dalam mengelola database relawan secara efisien dan terorganisir.',
    price: 'Rp.25.000.000',
    image: 'https://i.imgur.com/gDVUu0z.png',
    rating: 4,
    type: 'produk',
    category: 'paket',
    action: 'Beli Produk',
  },
  {
    id: '2',
    title: 'Aplikasi absen',
    subtitle: 'Aplikasi untuk absensi digital',
    desc: 'Sistem absensi digital yang memudahkan monitoring kehadiran karyawan secara real-time.',
    price: 'Rp.28.000.000',
    image: 'https://i.imgur.com/AZzGS8J.png',
    rating: 5,
    type: 'produk',
    category: 'paket',
    action: 'Beli Produk',
  },
  {
    id: '3',
    title: 'Aplikasi lainnya',
    subtitle: 'Aplikasi custom sesuai kebutuhan',
    desc: 'Solusi aplikasi yang dapat disesuaikan dengan kebutuhan spesifik organisasi Anda.',
    price: 'Rp.20.000.000',
    image: 'https://i.imgur.com/pni2qU2.png',
    rating: 3,
    type: 'produk',
    category: 'satuan',
    action: 'Beli Produk',
  },
  {
    id: '4',
    title: 'Aplikasi komunitas',
    subtitle: 'Platform untuk mengelola komunitas',
    desc: 'Aplikasi yang dirancang khusus untuk memfasilitasi interaksi dan pengelolaan komunitas.',
    price: 'Rp.21.000.000',
    image: 'https://i.imgur.com/k16AnH0.png',
    rating: 4,
    type: 'produk',
    category: 'paket',
    action: 'Beli Produk',
  },
];

const categories = [
  { id: 'all', label: 'Semua' },
  { id: 'produk', label: 'Produk' },
  { id: 'layanan', label: 'Layanan' },
];

// Function to get base URL for images
const getImageBaseURL = () => {
  let baseUrl;
  if (Platform.OS === 'android') {
    // For real device, use actual IP address
    baseUrl = 'http://192.168.1.11:5000';
  } else if (Platform.OS === 'ios') {
    // For iOS device, use actual IP address
    baseUrl = 'http://192.168.1.11:5000';
  } else {
    baseUrl = 'http://192.168.1.11:5000';
  }

  console.log('Image base URL:', baseUrl);
  return baseUrl;
};

export default function HomeScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [notificationTapCount, setNotificationTapCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔔 HomeScreen: unreadNotificationCount changed to:', unreadNotificationCount);
  }, [unreadNotificationCount]);

  useEffect(() => {
    fetchItems();
    fetchPromotions();
    fetchUnreadNotificationCount();
  }, []);

  // Refresh promotions and notifications when screen is focused (untuk update real-time dari admin)
  useFocusEffect(
    React.useCallback(() => {
      console.log('HomeScreen focused - refreshing promotions and notifications');
      fetchPromotions();

      // Always refresh notification count when screen is focused
      // This ensures badge updates when user returns from NotificationScreen
      fetchUnreadNotificationCount();
    }, []),
  );

  // Log search changes for debugging
  useEffect(() => {
    if (search.trim() !== '') {
      console.log('HomeScreen: Searching for:', search);
    }
  }, [search]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const result = await ApiService.getItems();
      if (result.success) {
        console.log('HomeScreen: Items loaded:', result.data.length);
        console.log('HomeScreen: Sample item:', result.data[0]);
        setItems(result.data);
      } else {
        console.error('HomeScreen: Failed to load items');
        Alert.alert('Error', 'Gagal memuat data produk');
      }
    } catch (error) {
      console.error('HomeScreen: Error fetching items:', error);
      Alert.alert('Error', 'Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadNotificationCount = async () => {
    try {
      console.log('🔔 HomeScreen: Fetching unread notification count...');
      const token = await AsyncStorage.getItem('userToken');

      console.log('🔍 Debug - Token exists:', !!token);
      console.log('🔍 Debug - Token preview:', token ? token.substring(0, 20) + '...' : 'null');

      if (!token) {
        console.log('⚠️  HomeScreen: No user token found, setting count to 0');
        setUnreadNotificationCount(0);
        return;
      }

      console.log('🔑 HomeScreen: Token found, making API call...');

      const result = await ApiService.get('/notifications?unreadOnly=true&limit=1', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('� Debug - API Result:', JSON.stringify(result, null, 2));

      if (result.success && result.data) {
        const unreadCount = result.data.unreadCount || 0;
        console.log('✅ HomeScreen: Real unread notification count:', unreadCount);
        setUnreadNotificationCount(unreadCount);

        // Use real unread count from API
      } else {
        console.log('❌ HomeScreen: API returned error, setting count to 0');
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('❌ HomeScreen: Error fetching notification count:', error);
      console.log('🔧 HomeScreen: Setting count to 0 due to error');
      setUnreadNotificationCount(0);
    }
  };

  const fetchPromotions = async () => {
    try {
      setLoadingPromotions(true);
      console.log('HomeScreen: Fetching promotions from API...');
      const result = await ApiService.getPromotions();
      if (result.success) {
        console.log(
          'HomeScreen: Promotions loaded successfully:',
          result.data.length,
        );
        if (result.data.length > 0) {
          console.log('HomeScreen: Sample promotion:', result.data[0]);
          console.log(
            'HomeScreen: Sample promotion image URL:',
            result.data[0]?.imageUrl,
          );
          console.log('HomeScreen: All promotions:', result.data);
        }
        setPromotions(result.data);
      } else {
        console.error('HomeScreen: API returned success=false for promotions');
        console.error('HomeScreen: Result:', result);
        // Don't show alert for promotions, just use fallback
      }
    } catch (error) {
      console.error('HomeScreen: Error fetching promotions:', error);
      console.error('HomeScreen: Error details:', error.message);
      // Don't show alert for promotions, just use fallback
    } finally {
      setLoadingPromotions(false);
    }
  };

  // Handle notification icon tap for Firebase test access
  const handleNotificationTap = () => {
    setNotificationTapCount(prev => prev + 1);

    // Reset after 3 seconds
    setTimeout(() => {
      setNotificationTapCount(0);
    }, 3000);

    // Check for 5 taps within 3 seconds to access Firebase test
    if (notificationTapCount === 4) {
      // 5th tap (0-indexed)
      Alert.alert(
        'Firebase Test Access',
        'Do you want to access Firebase FCM test screen?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Test',
            onPress: () => navigation?.navigate('FirebaseTestScreen'),
          },
        ],
      );
      setNotificationTapCount(0);
    } else {
      // Navigate to notification screen
      navigation?.navigate('NotificationScreen');

      // Refresh notification count after a short delay (when user might have read notifications)
      setTimeout(() => {
        console.log('🔄 HomeScreen: Refreshing notification count after user opened notifications');
        fetchUnreadNotificationCount();
      }, 1000);
    }
  };

  const formatPrice = price => {
    if (!price) return 'Rp. 0';
    const numPrice = parseFloat(price);
    return `Rp. ${numPrice.toLocaleString('id-ID')}`;
  };

  // Function to check if product is on promotion
  const getProductPromotion = productId => {
    return promotions.find(
      promo =>
        promo.productId && promo.productId.toString() === productId.toString(),
    );
  };

  // Function to get price display with promotion
  const getPriceDisplay = item => {
    const promotion = getProductPromotion(item.id);

    if (promotion) {
      return {
        hasPromotion: true,
        originalPrice: formatPrice(item.harga),
        discountedPrice: formatPrice(promotion.discountedPrice),
        discount: promotion.discount,
      };
    }

    return {
      hasPromotion: false,
      originalPrice: formatPrice(item.harga),
      discountedPrice: null,
      discount: null,
    };
  };

  const getActionText = kategori => {
    return kategori?.toLowerCase() === 'produk'
      ? 'Beli Produk'
      : 'Pesan Layanan';
  };

  // Map database items to display format
  const mappedItems = items.map(item => ({
    id: item.id.toString(),
    title: item.nama,
    subtitle:
      item.deskripsi?.substring(0, 50) + '...' || 'Deskripsi tidak tersedia',
    desc: item.deskripsi || 'Deskripsi tidak tersedia',
    price: formatPrice(item.harga),
    image:
      item.gambarUrl || 'https://via.placeholder.com/300x200?text=No+Image',
    rating: item.rating || 5,
    type: item.kategori?.toLowerCase() || 'produk',
    category: item.katalog?.toLowerCase() || 'satuan',
    action: getActionText(item.kategori),
    // Include original item data for ProductDetailScreen
    ...item,
  }));

  // Combine database items with dummy data as fallback
  const allProducts = mappedItems.length > 0 ? mappedItems : products;

  // Filter products based on selected category and search text
  const filteredProducts = allProducts
    .filter(p => {
      // Filter by search text first
      const searchText = search.toLowerCase().trim();
      const matchesSearch = searchText === '' || 
        p.title?.toLowerCase().includes(searchText) ||
        p.subtitle?.toLowerCase().includes(searchText) ||
        p.desc?.toLowerCase().includes(searchText) ||
        p.nama?.toLowerCase().includes(searchText) ||
        p.deskripsi?.toLowerCase().includes(searchText);
      
      if (!matchesSearch) return false;
      
      // Then filter by category
      if (selectedCategory === 'all') return true;
      
      if (selectedCategory === 'produk') {
        return p.type === 'produk' || p.kategori?.toLowerCase() === 'produk';
      } else if (selectedCategory === 'layanan') {
        return p.type === 'layanan' || p.kategori?.toLowerCase() === 'layanan';
      }
      
      return true;
    })
    .slice(0, search.trim() !== '' ? 20 : 6); // Show more results when searching

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerTitle}>Temukan Ruang Kerja Virtual</Text>
            <Text style={styles.headerSubtitle}>Untuk Komunitas Anda</Text>
          </View>
          <TouchableOpacity
            style={styles.iconNotif}
            onPress={handleNotificationTap}
          >
            <NotificationIcon unreadCount={unreadNotificationCount} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari aplikasi, layanan, atau produk..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (search.trim()) {
                console.log('Searching for:', search);
              }
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
          <SearchIcon />
        </View>

        {/* Promo Banner */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 20 }}
          contentContainerStyle={{ paddingLeft: 18 }}
        >
          {loadingPromotions ? (
            // Loading state
            <View style={styles.promoCard}>
              <View
                style={[
                  styles.promoImage,
                  {
                    backgroundColor: '#f0f0f0',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <ActivityIndicator size="large" color="#1976D2" />
              </View>
            </View>
          ) : promotions.length > 0 ? (
            // Display promotions from database
            promotions.map((promotion, index) => {
              const imageUrl = promotion.imageUrl
                ? `${getImageBaseURL()}${promotion.imageUrl}`
                : null;

              console.log('Rendering promotion image:', {
                id: promotion.id,
                rawImageUrl: promotion.imageUrl,
                fullImageUrl: imageUrl,
                baseURL: getImageBaseURL(),
              });

              return (
                <View key={promotion.id || index} style={styles.promoCard}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.promoImage}
                      resizeMode="cover"
                      onError={e => {
                        console.log(
                          'Promo image load error for URL:',
                          imageUrl,
                        );
                        console.log('Error details:', e.nativeEvent.error);
                      }}
                      onLoad={() => {
                        console.log(
                          'Promo image loaded successfully:',
                          imageUrl,
                        );
                      }}
                      onLoadStart={() => {
                        console.log('Promo image load started:', imageUrl);
                      }}
                    />
                  ) : (
                    <View
                      style={[
                        styles.promoImage,
                        {
                          backgroundColor: '#f0f0f0',
                          justifyContent: 'center',
                          alignItems: 'center',
                        },
                      ]}
                    >
                      <Text style={{ color: '#666', fontSize: 16 }}>
                        No Image
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            // Fallback when no promotions
            <View style={styles.promoCard}>
              <Image
                source={require('./assets/promo-image.png')}
                style={styles.promoImage}
                resizeMode="cover"
              />
            </View>
          )}
        </ScrollView>

        {/* Katalog */}
        <View style={styles.catalogHeader}>
          <View>
            <Text style={styles.catalogTitle}>Katalog</Text>
            {search.trim() !== '' && (
              <Text style={styles.searchResultText}>
                {filteredProducts.length} hasil untuk "{search}"
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CatalogScreen')}
          >
            <Text style={styles.seeAll}>lihat semua</Text>
          </TouchableOpacity>
        </View>
        {/* Category Filter */}
        <View style={styles.categoryRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryBtn,
                selectedCategory === cat.id && styles.categoryBtnActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryBtnText,
                  selectedCategory === cat.id && styles.categoryBtnTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Product List */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            marginTop: 10,
          }}
        >
          {loading ? (
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                paddingVertical: 20,
              }}
            >
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={{ marginTop: 10, color: '#666' }}>
                Memuat produk...
              </Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                paddingVertical: 20,
              }}
            >
              <Text style={{ color: '#666', textAlign: 'center' }}>
                {search.trim() !== '' 
                  ? `Tidak ada hasil untuk "${search}"\nCoba kata kunci lain atau lihat semua produk.`
                  : 'Tidak ada produk tersedia'
                }
              </Text>
            </View>
          ) : (
            filteredProducts.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                onPress={() =>
                  navigation.navigate('ProductDetailScreen', { product: item })
                }
              >
                <Image source={{ uri: item.image }} style={styles.productImg} />
                <View style={{ padding: 10 }}>
                  <Text style={styles.productTitle}>{item.title}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 6,
                    }}
                  >
                    {(() => {
                      const priceInfo = getPriceDisplay(item);

                      if (priceInfo.hasPromotion) {
                        return (
                          <View style={{ flexDirection: 'column' }}>
                            <Text
                              style={[
                                styles.productPrice,
                                styles.originalPrice,
                              ]}
                            >
                              {priceInfo.originalPrice}
                            </Text>
                            <Text
                              style={[
                                styles.productPrice,
                                styles.discountedPrice,
                              ]}
                            >
                              {priceInfo.discountedPrice}
                            </Text>
                          </View>
                        );
                      } else {
                        return (
                          <Text style={styles.productPrice}>
                            {priceInfo.originalPrice}
                          </Text>
                        );
                      }
                    })()}
                    <View style={{ flexDirection: 'row' }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <View
                          key={i}
                          style={{
                            marginRight: i < 5 ? 2 : 0,
                          }}
                        >
                          <Image
                            source={
                              i <= item.rating
                                ? require('./assets/Star-Yellow.png')
                                : require('./assets/Star.png')
                            }
                            style={{
                              width: 10,
                              height: 10,
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabBtnActive}>
          <Image
            source={require('./assets/beranda-icon-active.png')}
            style={styles.tabIcon}
          />
          <Text style={styles.tabTextActive}>Beranda</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('CatalogScreen')}
        >
          <Image
            source={require('./assets/katalog-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('ChatScreen')}
        >
          <Image
            source={require('./assets/pesan-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('ProfileScreen')}
        >
          <Image
            source={require('./assets/profile-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#0070D8',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: '#112D4E',
    marginBottom: 10,
  },
  iconNotif: {
    marginTop: 5,
    marginRight: 4,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: 7,
    backgroundColor: '#FF3E43',
    borderRadius: 500,
    width: 14,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#FFFFFF',
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 10,
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 26,
    paddingHorizontal: 20,
    marginHorizontal: 18,
    marginTop: 8,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#112D4E',
    paddingVertical: 3,
  },
  clearButton: {
    marginLeft: 8,
    marginRight: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  promoCard: {
    width: 313,
    height: 146,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginRight: 16,
    elevation: 2,
    shadowColor: '#fffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
    position: 'relative', // Ensure relative positioning for absolute children
  },
  promoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  catalogHeader: {
    marginTop: 30,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  catalogTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#000000',
  },
  searchResultText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  seeAll: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 14,
    color: '#0070D8',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 8,
    marginTop: 2,
  },
  categoryBtn: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#646464',
    marginRight: 14,
    paddingHorizontal: 20,
    paddingVertical: 7,
    backgroundColor: '#fff',
  },
  categoryBtnActive: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F1FE',
  },
  categoryBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#112D4E',
    fontSize: 12,
  },
  categoryBtnTextActive: {
    color: '#1976D2',
  },
  productCard: {
    borderWidth: 0.5,
    borderColor: '#E5E8EC',
    width: '47%',
    backgroundColor: '#F4F8FB',
    borderRadius: 18,
    marginBottom: 18,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  productTitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 12,
    color: '#000000',
  },
  productPrice: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 10,
    color: '#000000',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999999',
    fontSize: 8,
  },
  discountedPrice: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 10,
    color: '#E53E3E',
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 22,
    paddingBottom: 32,
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabBtn: {
    alignItems: 'center',
    flex: 1,
  },
  tabBtnActive: {
    backgroundColor: '#E3F1FE',
    borderRadius: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 10,
  },
  tabIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  tabTextActive: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 15,
    color: '#0070D8',
  },
});
