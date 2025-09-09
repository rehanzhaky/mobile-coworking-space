import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontWeight, FontFamily } from '../styles/typography';
import ApiService from '../services/api';

// Dummy icons, replace with react-native-vector-icons or SVG
const ProductIcon = () => (
  <Image
    source={require('./assets/product-icon.png')}
    style={{ width: 29, height: 29 }}
  />
);
const ServiceIcon = () => (
  <Image
    source={require('./assets/service-icon.png')}
    style={{ width: 29, height: 29 }}
  />
);

const SearchIcon = () => (
  <Image
    source={require('./assets/search-icon.png')}
    style={{ width: 20, height: 20 }}
  />
);

export default function CatalogScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('Produk');
  const [activeCategory, setActiveCategory] = useState('Satuan');
  const [expanded, setExpanded] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);

  useEffect(() => {
    fetchItems();
    fetchPromotions();
  }, []);

  // Refresh promotions when screen is focused (untuk update real-time dari admin)
  useFocusEffect(
    React.useCallback(() => {
      console.log('CatalogScreen focused - refreshing promotions');
      fetchPromotions();
    }, []),
  );

  const fetchItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching items from API...');
      const result = await ApiService.getItems();
      console.log('API result:', result);

      if (result.success) {
        console.log('Items loaded successfully:', result.data.length);
        console.log('Sample item:', result.data[0]);
        setItems(result.data);
      } else {
        console.error('API returned error:', result.message);
        Alert.alert('Error', result.message || 'Gagal memuat data produk');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Gagal memuat data produk: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      setLoadingPromotions(true);
      const result = await ApiService.getPromotions();
      if (result.success) {
        console.log('CatalogScreen: Promotions loaded:', result.data.length);
        setPromotions(result.data);
      } else {
        console.error('CatalogScreen: Failed to load promotions');
      }
    } catch (error) {
      console.error('CatalogScreen: Error fetching promotions:', error);
    } finally {
      setLoadingPromotions(false);
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

  // Helper function to format JSON data for display (simple text only)
  const formatDisplayText = data => {
    if (!data) return '';

    try {
      // If it's a string, try to parse as JSON first
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            // For catalog, just show first few items as comma-separated
            return (
              parsed.slice(0, 3).join(', ') + (parsed.length > 3 ? '...' : '')
            );
          }
          return data;
        } catch {
          return data;
        }
      }

      // If it's already an array, format as comma-separated
      if (Array.isArray(data)) {
        return data.slice(0, 3).join(', ') + (data.length > 3 ? '...' : '');
      }

      return data.toString();
    } catch (error) {
      console.error('Error formatting display text:', error);
      return data || '';
    }
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

  const formatFeatures = fitur => {
    if (!fitur) return [];
    try {
      return typeof fitur === 'string' ? JSON.parse(fitur) : fitur;
    } catch {
      return [];
    }
  };

  const getActionText = kategori => {
    return kategori?.toLowerCase() === 'produk'
      ? 'Beli Produk'
      : 'Pesan Layanan';
  };

  const filteredProducts = items.filter(item => {
    // Handle type filter - include "Pricing" as "Produk"
    const itemType = item.kategori?.toLowerCase();
    const matchesType =
      itemType === activeType.toLowerCase() ||
      (activeType.toLowerCase() === 'produk' && itemType === 'pricing');

    // Handle category filter - treat null/undefined as "Satuan"
    const itemCategory = item.katalog?.toLowerCase() || 'satuan';
    const matchesCategory = itemCategory === activeCategory.toLowerCase();

    // Handle search
    const matchesSearch =
      search === '' ||
      item.nama?.toLowerCase().includes(search.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(search.toLowerCase());

    console.log(
      `Item: ${
        item.nama
      }, Type: ${itemType}, Category: ${itemCategory}, Matches: ${
        matchesType && matchesCategory && matchesSearch
      }`,
    );

    return matchesType && matchesCategory && matchesSearch;
  });

  console.log(
    `Total items: ${items.length}, Filtered: ${filteredProducts.length}, Type: ${activeType}, Category: ${activeCategory}`,
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <Text style={styles.title}>Katalog</Text>
        <Text style={styles.subtitle}>Ruang Kerja Virtual</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk/layanan yang anda butuhkan..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
          <SearchIcon />
        </View>

        {/* Produk/Layanan Switch */}
        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[
              styles.switchCard,
              activeType === 'Produk' && styles.switchCardActive,
            ]}
            onPress={() => setActiveType('Produk')}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <ProductIcon />
              <Text
                style={[
                  styles.switchTitle,
                  activeType === 'Produk' && styles.switchTitleActive,
                ]}
              >
                Produk
              </Text>
            </View>
            <Text
              style={[
                styles.switchDesc,
                activeType === 'Produk' && styles.switchDescActive,
              ]}
            >
              Aplikasi dan Website untuk komunitas
            </Text>
            <Text
              style={[
                styles.switchLink,
                activeType === 'Produk' && styles.switchLinkActive,
              ]}
            >
              Lihat produk
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchCard,
              activeType === 'Layanan' && styles.switchCardActive,
            ]}
            onPress={() => setActiveType('Layanan')}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <ServiceIcon />
              <Text
                style={[
                  styles.switchTitle,
                  activeType === 'Layanan' && styles.switchTitleActive,
                ]}
              >
                Layanan
              </Text>
            </View>
            <Text
              style={[
                styles.switchDesc,
                activeType === 'Layanan' && styles.switchDescActive,
              ]}
            >
              Jasa untuk membantu komunitas
            </Text>
            <Text
              style={[
                styles.switchLink,
                activeType === 'Layanan' && styles.switchLinkActive,
              ]}
            >
              Lihat layanan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Kategori */}
        <Text style={styles.categoryTitle}>Kategori</Text>
        <View style={styles.categoryRow}>
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              activeCategory === 'Satuan' && styles.categoryBtnActive,
            ]}
            onPress={() => setActiveCategory('Satuan')}
          >
            <Text
              style={[
                styles.categoryBtnText,
                activeCategory === 'Satuan' && styles.categoryBtnTextActive,
              ]}
            >
              Satuan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              activeCategory === 'Paket' && styles.categoryBtnActive,
            ]}
            onPress={() => setActiveCategory('Paket')}
          >
            <Text
              style={[
                styles.categoryBtnText,
                activeCategory === 'Paket' && styles.categoryBtnTextActive,
              ]}
            >
              Paket
            </Text>
          </TouchableOpacity>
        </View>

        {/* Products List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.loadingText}>Memuat produk...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Tidak ada {activeType.toLowerCase()} dalam kategori{' '}
              {activeCategory.toLowerCase()}
            </Text>
          </View>
        ) : (
          filteredProducts.map((item, idx) => {
            console.log('Rendering item:', {
              id: item.id,
              nama: item.nama,
              harga: item.harga,
              deskripsi: item.deskripsi?.substring(0, 30),
              gambarUrl: item.gambarUrl,
            });

            return (
              <View key={item.id} style={styles.productCard}>
                <View style={styles.productImageWrapper}>
                  <Image
                    source={
                      item.gambarUrl
                        ? { uri: item.gambarUrl }
                        : {
                            uri: 'https://via.placeholder.com/300x120?text=No+Image',
                          }
                    }
                    style={styles.productImg}
                    onError={() =>
                      console.log('Image load error for:', item.nama)
                    }
                  />
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      navigation.navigate('ProductDetailScreen', {
                        product: item,
                      })
                    }
                  >
                    <Text style={styles.actionBtnText}>
                      {getActionText(item.kategori)}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ padding: 16 }}>
                  {/* Conditional Product Details */}
                  {expanded === item.id && (
                    <>
                      {/* Product Title dan Rating */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}
                      >
                        <Text style={styles.productTitle}>{item.nama}</Text>
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
                                  i <= (item.rating || 5)
                                    ? require('./assets/Star-Yellow.png')
                                    : require('./assets/Star.png')
                                }
                                style={{
                                  width: 11.52,
                                  height: 11.52,
                                }}
                              />
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Product Subtitle dan Price */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 10,
                        }}
                      >
                        {/* Deskripsi dengan word wrap */}
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text
                            style={[
                              styles.productSubtitle,
                              {
                                lineHeight: 16,
                                flexWrap: 'wrap',
                              },
                            ]}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {formatDisplayText(item.deskripsi) ||
                              'Tidak ada deskripsi'}
                          </Text>
                        </View>

                        {/* Price container */}
                        <View
                          style={{
                            alignItems: 'flex-end',
                            minWidth: 80,
                          }}
                        >
                          {(() => {
                            const priceInfo = getPriceDisplay(item);

                            if (priceInfo.hasPromotion) {
                              return (
                                <View
                                  style={{
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.productPrice,
                                      styles.originalPrice,
                                      { marginLeft: 0 },
                                    ]}
                                  >
                                    {priceInfo.originalPrice}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.productPrice,
                                      styles.discountedPrice,
                                      { marginLeft: 0 },
                                    ]}
                                  >
                                    {priceInfo.discountedPrice}
                                  </Text>
                                </View>
                              );
                            } else {
                              return (
                                <Text
                                  style={[
                                    styles.productPrice,
                                    { marginLeft: 0 },
                                  ]}
                                >
                                  {priceInfo.originalPrice}
                                </Text>
                              );
                            }
                          })()}
                        </View>
                      </View>

                      <View
                        style={{
                          height: 1,
                          backgroundColor: '#ddd',
                          marginVertical: 10,
                        }}
                      />

                      {/* Product Description */}
                      <View style={{ marginBottom: 10 }}>
                        <Text style={styles.productDesc}>
                          {formatDisplayText(item.deskripsi) ||
                            'Tidak ada deskripsi'}
                        </Text>
                      </View>
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.expandBtn}
                    onPress={() =>
                      setExpanded(expanded === item.id ? null : item.id)
                    }
                  >
                    <View style={{ alignItems: 'center' }}>
                      {expanded !== item.id && (
                        <Text style={styles.expandText}>
                          lihat selengkapnya
                        </Text>
                      )}
                      <Image
                        source={require('./assets/arrow-down.png')}
                        style={{
                          width: 18,
                          height: 18,
                          marginTop: expanded === item.id ? 0 : 4,
                          transform: [
                            {
                              rotate: expanded === item.id ? '180deg' : '0deg',
                            },
                          ],
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('Home')}
        >
          <Image
            source={require('./assets/beranda-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtnActive}>
          <Image
            source={require('./assets/katalog-icon-active.png')}
            style={styles.tabIcon}
          />
          <Text style={styles.tabTextActive}>Katalog</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation.navigate('ChatScreen')}
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
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 32,
    color: '#0070D8',
    textAlign: 'center',
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 16,
    color: '#112D4E',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8C8C8C',
    borderRadius: 26,
    paddingHorizontal: 20,
    marginHorizontal: 18,
    marginTop: 10,
    height: 50,
  },
  searchInput: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    flex: 1,
    fontSize: 14,
    color: '#112D4E',
    paddingVertical: 6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  switchCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    backgroundColor: '#fff',
    padding: 10,
  },
  switchCardActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  switchTitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 18,
    paddingLeft: 10,
    color: '#1976D2',
  },
  switchTitleActive: {
    color: '#fff',
  },
  switchDesc: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 2,
  },
  switchDescActive: {
    color: '#fff',
  },
  switchLink: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 13,
    color: '#1976D2',
    marginTop: 10,
  },
  switchLinkActive: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 13,
    color: '#fff',
  },
  categoryTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#000000',
    marginHorizontal: 18,
    marginTop: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 10,
  },
  categoryBtn: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#646464',
    paddingHorizontal: 26,
    paddingVertical: 7,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  categoryBtnActive: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F1FE',
  },
  categoryBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#112D4E',
  },
  categoryBtnTextActive: {
    color: '#1976D2',
  },
  productContainer: {
    marginHorizontal: 16,
    marginBottom: 22,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 22,
    borderWidth: 2,
    borderColor: '#8C8C8C',
    overflow: 'hidden',
  },
  productImageWrapper: {
    borderRadius: 20,
    marginTop: 10,
    width: 300,
    height: 150,
    backgroundColor: '#112D4E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5.8,
  },
  productImg: {
    borderRadius: 20,
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  actionBtn: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
  },
  actionBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#0070D8',
    fontSize: 13,
  },
  productTitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#000000',
  },
  productSubtitle: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 11,
    color: '#222',
    marginTop: 2,
  },
  productPrice: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 15,
    color: '#000000',
    marginLeft: 0,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999999',
    fontSize: 12,
  },
  discountedPrice: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 18,
    color: '#E53E3E',
  },
  productDesc: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 13,
    color: '#000000',
    marginTop: 0,
  },
  expandBtn: {
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  expandText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 15,
    color: '#707070',
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
    fontFamily: FontFamily.outfit_medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: FontFamily.outfit_medium,
  },
});
