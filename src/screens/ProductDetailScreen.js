import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';
import ApiService from '../services/api';

const { width } = Dimensions.get('window');
const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

const tabList = ['Fitur', 'Keterangan', 'Keunggulan', 'Ulasan'];

export default function ProductDetailScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState(1);
  const { product } = route.params || {};
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Refresh promotions when screen is focused (untuk update real-time dari admin)
  useFocusEffect(
    React.useCallback(() => {
      console.log('ProductDetailScreen focused - refreshing promotions');
      fetchPromotions();
    }, []),
  );

  const fetchPromotions = async () => {
    try {
      setLoadingPromotions(true);
      const result = await ApiService.getPromotions();
      if (result.success) {
        console.log(
          'ProductDetailScreen: Promotions loaded:',
          result.data.length,
        );
        setPromotions(result.data);
      } else {
        console.error('ProductDetailScreen: Failed to load promotions');
      }
    } catch (error) {
      console.error('ProductDetailScreen: Error fetching promotions:', error);
    } finally {
      setLoadingPromotions(false);
    }
  };

  // Helper functions untuk format data dari database
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
  const getPriceDisplay = product => {
    const promotion = getProductPromotion(product.id);

    if (promotion) {
      return {
        hasPromotion: true,
        originalPrice: formatPrice(product.harga),
        discountedPrice: formatPrice(promotion.discountedPrice),
        discount: promotion.discount,
      };
    }

    return {
      hasPromotion: false,
      originalPrice: formatPrice(product.harga),
      discountedPrice: null,
      discount: null,
    };
  };

  const formatFeatures = fitur => {
    console.log('formatFeatures input:', fitur, 'type:', typeof fitur);

    if (!fitur) {
      console.log('formatFeatures: no fitur data, returning empty array');
      return [];
    }

    try {
      // If it's a string, try to parse as JSON first (handle multiple escaping)
      if (typeof fitur === 'string') {
        let workingData = fitur;

        // Try to parse multiple times to handle escaped JSON
        for (let i = 0; i < 3; i++) {
          try {
            console.log(`formatFeatures attempt ${i + 1}:`, workingData);
            const parsed = JSON.parse(workingData);
            if (Array.isArray(parsed)) {
              console.log(
                'formatFeatures: Successfully parsed to array:',
                parsed,
              );
              return parsed;
            }
            workingData = parsed; // Continue parsing if it's still a string
          } catch (parseError) {
            console.log(
              `formatFeatures parse attempt ${i + 1} failed:`,
              parseError.message,
            );
            break;
          }
        }

        // If JSON parsing failed, try comma splitting
        console.log('formatFeatures: JSON parsing failed, splitting by comma');
        return workingData
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }

      // If it's already an array, check if items need further parsing or reconstruction
      if (Array.isArray(fitur)) {
        console.log('formatFeatures: Input is array, checking items');

        // Check if this is a fragmented JSON string array like:
        // ['"[\"fitur 1\"', '\"fitur 2\"', '\"fitur 3\"]"']
        if (
          fitur.length > 1 &&
          typeof fitur[0] === 'string' &&
          fitur[0].includes('"[') &&
          typeof fitur[fitur.length - 1] === 'string' &&
          fitur[fitur.length - 1].includes(']"')
        ) {
          console.log(
            'formatFeatures: Detected fragmented JSON array, reconstructing',
          );
          // Reconstruct the JSON string
          const reconstructed = fitur.join('');
          console.log('formatFeatures: Reconstructed string:', reconstructed);

          try {
            // Try to parse the reconstructed string
            let workingData = reconstructed;
            for (let i = 0; i < 3; i++) {
              try {
                const parsed = JSON.parse(workingData);
                if (Array.isArray(parsed)) {
                  console.log(
                    'formatFeatures: Successfully parsed reconstructed array:',
                    parsed,
                  );
                  return parsed;
                }
                workingData = parsed;
              } catch {
                break;
              }
            }
          } catch (error) {
            console.log(
              'formatFeatures: Failed to parse reconstructed string:',
              error.message,
            );
          }
        }

        // Handle normal array processing
        const processedArray = [];

        for (const item of fitur) {
          if (typeof item === 'string') {
            // Try to parse each item in case it's an escaped JSON string
            try {
              const parsed = JSON.parse(item);
              if (Array.isArray(parsed)) {
                processedArray.push(...parsed);
              } else {
                processedArray.push(parsed);
              }
            } catch {
              processedArray.push(item);
            }
          } else {
            processedArray.push(item);
          }
        }

        console.log('formatFeatures: Processed array:', processedArray);
        return processedArray;
      }

      console.log('formatFeatures: converting to single item array');
      return [fitur.toString()];
    } catch (error) {
      console.log('formatFeatures: error:', error.message);
      return [];
    }
  };

  const getActionText = kategori => {
    return kategori?.toLowerCase() === 'produk'
      ? 'Beli Produk'
      : 'Pesan Layanan';
  };

  const currentProduct = product || {
    id: 1,
    nama: 'Produk Default',
    deskripsi: 'Deskripsi default',
    harga: '0',
    rating: 5,
    gambarUrl: null,
    kategori: 'Produk',
    katalog: 'Satuan',
    fitur: null,
    keunggulan: null,
    keterangan: null,
  };

  // Debug logging
  console.log('=== ProductDetailScreen Debug ===');
  console.log('Product data received:', currentProduct);
  console.log('Features raw:', currentProduct.fitur);
  console.log('Features formatted:', formatFeatures(currentProduct.fitur));
  console.log('Keterangan:', currentProduct.keterangan);
  console.log('Keunggulan:', currentProduct.keunggulan);

  // Helper function to format advantages and keterangan as bullet points
  const formatBulletPoints = data => {
    console.log('formatBulletPoints input:', data, 'type:', typeof data);

    if (!data) return [];

    try {
      // If it's a string, try to parse as JSON first (handle multiple escaping)
      if (typeof data === 'string') {
        let workingData = data;

        // Try to parse multiple times to handle escaped JSON
        for (let i = 0; i < 3; i++) {
          try {
            console.log(`formatBulletPoints attempt ${i + 1}:`, workingData);
            const parsed = JSON.parse(workingData);
            if (Array.isArray(parsed)) {
              console.log(
                'formatBulletPoints: Successfully parsed to array:',
                parsed,
              );
              return parsed;
            }
            workingData = parsed; // Continue parsing if it's still a string
          } catch (parseError) {
            console.log(
              `formatBulletPoints parse attempt ${i + 1} failed:`,
              parseError.message,
            );
            break;
          }
        }

        // If JSON parsing failed, try comma splitting
        console.log(
          'formatBulletPoints: JSON parsing failed, splitting by comma',
        );
        return workingData
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }

      // If it's already an array, check if items need further parsing
      if (Array.isArray(data)) {
        console.log('formatBulletPoints: Input is array, checking items');
        const processedArray = [];

        for (const item of data) {
          if (typeof item === 'string') {
            // Try to parse each item in case it's an escaped JSON string
            try {
              const parsed = JSON.parse(item);
              if (Array.isArray(parsed)) {
                processedArray.push(...parsed);
              } else {
                processedArray.push(parsed);
              }
            } catch {
              processedArray.push(item);
            }
          } else {
            processedArray.push(item);
          }
        }

        console.log('formatBulletPoints: Processed array:', processedArray);
        return processedArray;
      }

      // Otherwise, convert to string and return as single item
      console.log('formatBulletPoints: Converting to single item array');
      return [data.toString()];
    } catch (error) {
      console.error('Error formatting bullet points:', error);
      return [];
    }
  };

  // Format data untuk display
  const displayData = {
    title: currentProduct.nama || currentProduct.title,
    subtitle:
      currentProduct.deskripsi?.substring(0, 100) || currentProduct.subtitle,
    price: formatPrice(currentProduct.harga) || currentProduct.price,
    rating: currentProduct.rating || 5,
    image: currentProduct.gambarUrl || currentProduct.image,
    type: currentProduct.kategori?.toLowerCase() || currentProduct.type,
    action: getActionText(currentProduct.kategori) || currentProduct.action,
    description: currentProduct.deskripsi || 'Deskripsi produk tidak tersedia',
    features: formatFeatures(currentProduct.fitur) || [],
    advantages: formatBulletPoints(currentProduct.keunggulan),
    keterangan: formatBulletPoints(currentProduct.keterangan),
  };

  console.log('displayData.features:', displayData.features);
  console.log('displayData.features length:', displayData.features?.length);
  console.log(
    'displayData.features isArray:',
    Array.isArray(displayData.features),
  );
  console.log('displayData.advantages:', displayData.advantages);
  console.log('displayData.advantages length:', displayData.advantages?.length);
  console.log('displayData.keterangan:', displayData.keterangan);
  console.log('displayData.keterangan length:', displayData.keterangan?.length);
  console.log('=== End Debug ===');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{displayData.title}</Text>
        </View>

        {/* Product Image with carousel indicator (dummy, single image) */}
        <View style={styles.imageContainer}>
          <Image
            source={
              displayData.image &&
              typeof displayData.image === 'string' &&
              displayData.image.startsWith('http')
                ? { uri: displayData.image }
                : require('./assets/absensi-staff.png')
            }
            style={styles.productImage}
            resizeMode="contain"
            onError={() =>
              console.log('Image load error for:', displayData.title)
            }
          />
          <View style={styles.carouselIndicator}>
            <View style={[styles.dot, { backgroundColor: '#1976D2' }]} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Deskripsi */}
        <Text style={styles.descText}>{displayData.description}</Text>

        {/* Harga */}
        {(() => {
          const priceInfo = getPriceDisplay(currentProduct);

          if (priceInfo.hasPromotion) {
            return (
              <View style={styles.priceContainer}>
                <Text style={[styles.priceText, styles.originalPrice]}>
                  {priceInfo.originalPrice}
                </Text>
                <Text style={[styles.priceText, styles.discountedPrice]}>
                  {priceInfo.discountedPrice}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{priceInfo.discount}</Text>
                </View>
              </View>
            );
          } else {
            return (
              <Text style={styles.priceText}>{priceInfo.originalPrice}</Text>
            );
          }
        })()}

        {/* Tab Section */}
        <View style={styles.tabRow}>
          {tabList.map((tab, idx) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabBtn}
              onPress={() => setActiveTab(idx)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === idx && styles.tabLabelActive,
                ]}
              >
                {tab}
              </Text>
              {activeTab === idx && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tabContent}>
          {activeTab === 0 && (
            <View>
              {(() => {
                console.log('=== Tab Fitur Rendering ===');
                console.log('displayData.features:', displayData.features);
                console.log('isArray:', Array.isArray(displayData.features));
                console.log('length:', displayData.features?.length);
                console.log(
                  'condition result:',
                  displayData.features &&
                    Array.isArray(displayData.features) &&
                    displayData.features.length > 0,
                );
                return null;
              })()}
              {displayData.features &&
              Array.isArray(displayData.features) &&
              displayData.features.length > 0 ? (
                displayData.features.map((feature, index) => (
                  <Text key={index} style={styles.bullet}>
                    • {feature}
                  </Text>
                ))
              ) : (
                <>
                  <Text style={styles.bullet}>
                    • Interface yang user-friendly dan mudah digunakan
                  </Text>
                  <Text style={styles.bullet}>
                    • Real-time monitoring dan reporting
                  </Text>
                  <Text style={styles.bullet}>
                    • Multi-platform support (Web & Mobile)
                  </Text>
                  <Text style={styles.bullet}>
                    • Keamanan data tingkat tinggi
                  </Text>
                </>
              )}
            </View>
          )}
          {activeTab === 1 && (
            <View>
              {displayData.keterangan && displayData.keterangan.length > 0 ? (
                displayData.keterangan.map((item, index) => (
                  <Text key={index} style={styles.bullet}>
                    • {item}
                  </Text>
                ))
              ) : (
                <>
                  <Text style={styles.bullet}>
                    • Proses pemberian produk akan dilakukan melalui chat
                  </Text>
                  <Text style={styles.bullet}>
                    • Admin akan menghubungi kamu melalui chat
                  </Text>
                  <Text style={styles.bullet}>
                    • Konsultasi gratis untuk setup awal
                  </Text>
                  <Text style={styles.bullet}>
                    • Training penggunaan sistem
                  </Text>
                </>
              )}
            </View>
          )}
          {activeTab === 2 && (
            <View>
              {displayData.advantages && displayData.advantages.length > 0 ? (
                displayData.advantages.map((item, index) => (
                  <Text key={index} style={styles.bullet}>
                    • {item}
                  </Text>
                ))
              ) : (
                <>
                  <Text style={styles.bullet}>
                    • Teknologi terdepan dan terupdate
                  </Text>
                  <Text style={styles.bullet}>
                    • Support 24/7 dari tim profesional
                  </Text>
                  <Text style={styles.bullet}>
                    • Garansi kepuasan pelanggan
                  </Text>
                  <Text style={styles.bullet}>
                    • Harga kompetitif dengan kualitas premium
                  </Text>
                </>
              )}
            </View>
          )}
          {activeTab === 3 && (
            <View>
              {/* Rating Section in Ulasan Tab */}
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Rating Produk: </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View key={i} style={{ marginRight: i < 5 ? 2 : 0 }}>
                      <Image
                        source={
                          i <= displayData.rating
                            ? require('./assets/Star-Yellow.png')
                            : require('./assets/Star.png')
                        }
                        style={{ width: 16, height: 16 }}
                      />
                    </View>
                  ))}
                </View>
                <Text style={styles.ratingText}>({displayData.rating}/5)</Text>
              </View>

              {/* Sample Reviews */}
              <Text style={styles.bullet}>
                • "Sangat membantu dalam mengelola operasional harian" - User A
              </Text>
              <Text style={styles.bullet}>
                • "Interface yang mudah dipahami dan user-friendly" - User B
              </Text>
              <Text style={styles.bullet}>
                • "Recommend untuk semua jenis bisnis" - User C
              </Text>
              <Text style={styles.bullet}>
                • "Support team sangat responsif dan helpful" - User D
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Action Button */}
      <TouchableOpacity
        style={styles.buyBtn}
        onPress={() => {
          console.log('Action button pressed for product:', currentProduct);
          navigation?.navigate('ProductOrderDetailFormScreen', {
            product: currentProduct,
            actionType: displayData.action === 'Beli Produk' ? 'buy' : 'order',
          });
        }}
      >
        <Text style={styles.buyBtnText}>
          {displayData.action === 'Beli Produk'
            ? 'Beli Sekarang'
            : 'Pesan Sekarang'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 12,
    marginTop: -6,
  },
  headerTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    marginLeft: 16,
    fontSize: 18,
    color: '#0070D8',
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#0070D8',
    borderRadius: 24,
    marginHorizontal: 18,
    marginTop: 12,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  productImage: {
    width: width * 0.7,
    height: 160,
  },
  carouselIndicator: {
    flexDirection: 'column',
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -15 }],
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ebebeb',
    marginVertical: 4,
  },
  descText: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 16,
    color: 'grey',
    marginHorizontal: 24,
    marginTop: 22,
    marginBottom: 8,
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  priceText: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 24,
    color: '#0070D8',
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 18,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999999',
    fontSize: 12,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 5,
    marginRight: 10,
  },
  discountedPrice: {
    color: '#E53E3E',
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 26,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 5,
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: '#E53E3E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 5,
  },
  discountText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 12,
    color: '#fff',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: -3,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e6e6e6',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    // justifyContent: 'space-between',
  },
  tabLabel: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#000000',
  },
  tabLabelActive: {
    color: '#0070D8',
  },
  tabUnderline: {
    marginTop: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#0070D8',
    width: '60%',
  },
  tabContent: {
    marginHorizontal: 24,
    marginVertical: 18,
  },
  bullet: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
  },
  buyBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0070D8',
    borderRadius: 24,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 32,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buyBtnText: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    color: '#fff',
    fontSize: 22,
    letterSpacing: -0.96,
  },
});
