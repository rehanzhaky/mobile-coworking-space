import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  PanResponder,
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
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  // Helper function to get array of images
  const getProductImages = (product) => {
    const images = [];
    
    console.log('🔍 getProductImages - Input product:', product);
    
    // If product has multiple images (array)
    if (product?.images && Array.isArray(product.images)) {
      const validImages = product.images.filter(img => img && img.trim() !== '');
      console.log('📷 Found images array:', validImages);
      return validImages;
    }
    
    // Check gambarUrl (main image from backend API)
    if (product?.gambarUrl && product.gambarUrl.trim() !== '') {
      images.push(product.gambarUrl);
      console.log('📷 Added gambarUrl:', product.gambarUrl);
    }
    
    // Check gambarUrl2 (second image from backend API)
    if (product?.gambarUrl2 && product.gambarUrl2.trim() !== '') {
      images.push(product.gambarUrl2);
      console.log('📷 Added gambarUrl2:', product.gambarUrl2);
    }
    
    // Check gambarUrl3 (third image from backend API)
    if (product?.gambarUrl3 && product.gambarUrl3.trim() !== '') {
      images.push(product.gambarUrl3);
      console.log('📷 Added gambarUrl3:', product.gambarUrl3);
    }
    
    // If product has single image property (fallback)
    if (product?.image && product.image.trim() !== '' && !images.includes(product.image)) {
      images.push(product.image);
      console.log('📷 Added fallback image:', product.image);
    }
    
    // If product has image1, image2, image3 properties (mock data compatibility)
    if (product?.image1 && product.image1.trim() !== '' && !images.includes(product.image1)) {
      images.push(product.image1);
      console.log('📷 Added image1:', product.image1);
    }
    if (product?.image2 && product.image2.trim() !== '' && !images.includes(product.image2)) {
      images.push(product.image2);
      console.log('📷 Added image2:', product.image2);
    }
    if (product?.image3 && product.image3.trim() !== '' && !images.includes(product.image3)) {
      images.push(product.image3);
      console.log('📷 Added image3:', product.image3);
    }
    
    console.log('📷 Final images array:', images);
    console.log('📊 Total images count:', images.length);
    
    // Return images or default placeholder if no images
    return images.length > 0 ? images : [require('./assets/absensi-staff.png')];
  };

  const productImages = getProductImages(product?.id ? product : currentProduct);

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 20 && productImages.length > 1;
    },
    onPanResponderMove: (evt, gestureState) => {
      // Could add drag animation here if needed
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (productImages.length > 1) {
        if (gestureState.dx > 50) {
          // Swipe right - previous image
          const prevIndex = currentImageIndex === 0 ? productImages.length - 1 : currentImageIndex - 1;
          setCurrentImageIndex(prevIndex);
        } else if (gestureState.dx < -50) {
          // Swipe left - next image
          const nextIndex = (currentImageIndex + 1) % productImages.length;
          setCurrentImageIndex(nextIndex);
        }
      }
    }
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    // Fetch reviews ketika tab ulasan dipilih
    if (activeTab === 3 && product?.id) {
      console.log('🎯 Fetching reviews for real product ID:', product.id);
      fetchReviews();
    } else if (activeTab === 3) {
      console.log('⚠️ No product ID available, cannot fetch reviews');
      setReviews([]);
    }
  }, [activeTab, product?.id]);

  // Refresh promotions when screen is focused (untuk update real-time dari admin)
  useFocusEffect(
    React.useCallback(() => {
      console.log('ProductDetailScreen focused - refreshing promotions');
      fetchPromotions();
      // Juga refresh reviews jika sedang di tab ulasan
      if (activeTab === 3 && product?.id) {
        console.log('🔄 Focus refresh: Fetching reviews for real product ID:', product.id);
        fetchReviews();
      }
    }, [activeTab, product?.id]),
  );

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      console.log('🔄 Fetching product reviews for REAL product ID:', product?.id);
      console.log('🔍 Product object:', product);
      
      if (!product?.id) {
        console.log('❌ No valid product ID provided');
        setReviews([]);
        return;
      }
      
      const response = await ApiService.getSecure(`/reviews/product/${product.id}`);
      console.log('📥 Product reviews API response:', response);
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
        
        console.log('✅ Product reviews data:', reviewsData);
        console.log('📊 Number of product reviews:', reviewsData.length);
        setReviews(reviewsData);
      } else {
        console.log('❌ Error fetching product reviews:', response.message || response.error);
        setReviews([]);
      }
    } catch (error) {
      console.error('❌ Error fetching product reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

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
    // Test multiple images
    image1: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    image2: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    image3: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
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
    rating: currentProduct.rating || null, // Remove dummy fallback
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

        {/* Product Image with dynamic carousel indicator */}
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            style={styles.imageWrapper}
            onPress={() => {
              if (productImages.length > 1) {
                const nextIndex = (currentImageIndex + 1) % productImages.length;
                setCurrentImageIndex(nextIndex);
              }
            }}
            {...panResponder.panHandlers}
          >
            {imageLoading && (
              <ActivityIndicator 
                size="small" 
                color="#1976D2" 
                style={styles.imageLoadingIndicator}
              />
            )}
            <Image
              source={
                typeof productImages[currentImageIndex] === 'string' && productImages[currentImageIndex].startsWith('http')
                  ? { uri: productImages[currentImageIndex] }
                  : productImages[currentImageIndex]
              }
              style={styles.productImage}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                console.log('Image load error for image:', currentImageIndex, productImages[currentImageIndex]);
                setImageLoading(false);
              }}
            />
          </TouchableOpacity>
          
          {/* Dynamic carousel indicator */}
          {productImages.length > 1 && (
            <View style={styles.carouselIndicator}>
              {productImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                  style={
                    index === currentImageIndex 
                      ? styles.activeDot 
                      : [styles.dot, { backgroundColor: '#E0E0E0' }]
                  }
                />
              ))}
            </View>
          )}
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
              {!loadingReviews && reviews.length > 0 && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingLabel}>Rating Produk: </Text>
                  <View style={styles.starsContainer}>
                    {(() => {
                      const avgRating = reviews.length > 0 ? 
                        (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) : 0;
                      return [1, 2, 3, 4, 5].map(i => (
                        <View key={i} style={{ marginRight: i < 5 ? 2 : 0 }}>
                          <Image
                            source={
                              i <= Math.round(avgRating)
                                ? require('./assets/Star-Yellow.png')
                                : require('./assets/Star.png')
                            }
                            style={{ width: 16, height: 16 }}
                          />
                        </View>
                      ));
                    })()}
                  </View>
                  <Text style={styles.ratingText}>
                    ({reviews.length > 0 ? 
                      (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 0}/5)
                  </Text>
                </View>
              )}

              {/* Show message when no reviews */}
              {!loadingReviews && reviews.length === 0 && product?.id && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingLabel}>Rating Produk: </Text>
                  <Text style={styles.noRatingText}>Belum ada rating</Text>
                </View>
              )}

              {/* Show message for dummy/default product */}
              {!product?.id && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingLabel}>Rating Produk: </Text>
                  <Text style={styles.noRatingText}>Data produk tidak valid</Text>
                </View>
              )}

              {/* Reviews Summary */}
              {!loadingReviews && reviews.length > 0 && (
                <View style={styles.reviewsSummary}>
                  <Text style={styles.reviewsSummaryTitle}>
                    Ulasan Pengguna ({reviews.length} ulasan)
                  </Text>
                  {/* Average Rating Calculation */}
                  {(() => {
                    const avgRating = reviews.length > 0 ? 
                      (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 0;
                    return (
                      <View style={styles.averageRatingContainer}>
                        <Text style={styles.averageRatingText}>Rating rata-rata: </Text>
                        <View style={styles.averageStars}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <Image
                              key={i}
                              source={
                                i <= Math.round(avgRating)
                                  ? require('./assets/Star-Yellow.png')
                                  : require('./assets/Star.png')
                              }
                              style={{ width: 14, height: 14, marginRight: 1 }}
                            />
                          ))}
                        </View>
                        <Text style={styles.averageRatingValue}>({avgRating}/5)</Text>
                      </View>
                    );
                  })()}
                </View>
              )}

              {/* Loading State */}
              {loadingReviews && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#007BFF" />
                  <Text style={{ marginTop: 10, color: '#666' }}>Memuat ulasan...</Text>
                </View>
              )}

              {/* Reviews List */}
              {!loadingReviews && reviews.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  {reviews.map((review, index) => (
                    <View key={review.id} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewUserInfo}>
                          <Text style={styles.reviewUserName}>
                            {review.userName || 'Anonymous'}
                          </Text>
                          {review.isVerified && (
                            <Text style={styles.verifiedBadge}>✓</Text>
                          )}
                        </View>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <Image
                              key={i}
                              source={
                                i <= review.rating
                                  ? require('./assets/Star-Yellow.png')
                                  : require('./assets/Star.png')
                              }
                              style={{ width: 12, height: 12, marginRight: 2 }}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewComment}>"{review.comment}"</Text>
                      <View style={styles.reviewFooter}>
                        <Text style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                        {review.orderId && (
                          <Text style={styles.reviewOrderId}>Order: {review.orderId}</Text>
                        )}
                      </View>
                      {index < reviews.length - 1 && <View style={styles.reviewDivider} />}
                    </View>
                  ))}
                </View>
              )}

              {/* Empty State */}
              {!loadingReviews && reviews.length === 0 && product?.id && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#666', textAlign: 'center' }}>
                    Belum ada ulasan untuk produk ini
                  </Text>
                </View>
              )}

              {/* Invalid product state */}
              {!product?.id && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#666', textAlign: 'center' }}>
                    Data produk tidak valid - tidak dapat menampilkan ulasan
                  </Text>
                </View>
              )}
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
    height: 200,
    backgroundColor: '#fff',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  productImage: {
    width: width * 0.7,
    height: 160,
  },
  imageLoadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 1,
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
  activeDot: {
    width: 10,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#1976D2',
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
  noRatingText: {
    fontSize: 14,
    color: '#A0AEC0',
    fontStyle: 'italic',
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
  reviewItem: {
    backgroundColor: '#F7FAFC',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewsSummary: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  reviewsSummaryTitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 8,
  },
  averageRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRatingText: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 14,
    color: '#4A5568',
    marginRight: 8,
  },
  averageStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  averageRatingValue: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 14,
    color: '#2D3748',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewUserName: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 14,
    color: '#2D3748',
    marginRight: 5,
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#38A169',
    backgroundColor: '#C6F6D5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 10,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
    lineHeight: 18,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 12,
    color: '#A0AEC0',
  },
  reviewOrderId: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 10,
    color: '#CBD5E0',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 10,
  },
});
