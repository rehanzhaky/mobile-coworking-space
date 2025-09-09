import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [promoImages, setPromoImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // API URL - adjust according to your backend
  const apiUrl = 'http://192.168.1.8:5000'; // Replace with your actual API URL

  // Fetch promo data on component mount
  useEffect(() => {
    fetchPromoData();
  }, []);

  // Refresh promo data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('OnboardingScreen focused, refreshing promo data...');
      fetchPromoData();
    }, []),
  );

  const fetchPromoData = async () => {
    try {
      console.log('=== OnboardingScreen: Fetching promo data ===');
      console.log('API URL:', `${apiUrl}/api/promo`);

      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/promo`);

      console.log('Promo API Response:', response.data);
      console.log('Response status:', response.status);

      if (response.data && Array.isArray(response.data)) {
        console.log('Total promos received:', response.data.length);

        // Filter active promos and get their images
        const activePromos = response.data
          .filter(promo => {
            console.log(`Promo ${promo.id}: isActive = ${promo.isActive}`);
            return promo.isActive;
          })
          .slice(0, 3) // Limit to 3 promos for cardstack
          .map(promo => ({
            id: promo.id,
            imageUrl: promo.imageUrl,
            title: promo.title,
            discount: promo.discount,
          }));

        console.log('Active promos for display:', activePromos);
        console.log('Number of active promos:', activePromos.length);

        setPromoImages(activePromos);

        // Log each promo image URL
        activePromos.forEach((promo, index) => {
          console.log(`Promo ${index + 1}:`, {
            id: promo.id,
            title: promo.title,
            imageUrl: promo.imageUrl,
            discount: promo.discount,
          });
        });
      } else {
        console.log('Invalid response data format:', response.data);
        setPromoImages([]);
      }
    } catch (error) {
      console.error('=== Error fetching promo data ===');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Keep empty array as fallback
      setPromoImages([]);
    } finally {
      setLoading(false);
      console.log('=== Promo fetch completed ===');
    }
  };

  // Fallback promo images if no data or loading
  const defaultPromoImages = [
    { id: 'default1', imageUrl: null, title: 'Promo 1' },
    { id: 'default2', imageUrl: null, title: 'Promo 2' },
    { id: 'default3', imageUrl: null, title: 'Promo 3' },
  ];

  // Use fetched promo images or fallback to defaults
  const displayPromos =
    promoImages.length > 0 ? promoImages : defaultPromoImages;

  // Debug logging for render
  console.log('=== OnboardingScreen Render ===');
  console.log('promoImages.length:', promoImages.length);
  console.log('displayPromos:', displayPromos);
  console.log('loading:', loading);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Background pattern, using original asset */}
        <Image
          source={require('./assets/onboarding-bg.png')}
          style={styles.bgPattern}
          resizeMode="cover"
        />

        {/* Title */}
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Temukan Ruang{'\n'}Kerja Virtual</Text>
        </View>

        {/* Promo cards (dynamic) */}
        <View style={styles.cardStack}>
          {displayPromos.map((promo, index) => {
            console.log(`Rendering promo card ${index}:`, promo);

            // Define different transforms for each card position
            const cardTransforms = [
              {
                zIndex: 3,
                transform: [
                  { rotate: '-10.68deg' },
                  { translateY: 90 },
                  { translateX: 50 },
                ],
              },
              {
                zIndex: 2,
                transform: [
                  { rotate: '20.82deg' },
                  { translateY: 230 },
                  { translateX: 40 },
                ],
              },
              {
                zIndex: 3,
                transform: [
                  { rotate: '-2.3deg' },
                  { translateY: 360 },
                  { translateX: 80 },
                ],
              },
            ];

            const cardStyle = cardTransforms[index] || cardTransforms[0];

            console.log(`Card ${index} style:`, cardStyle);
            console.log(`Card ${index} imageUrl:`, promo.imageUrl);

            return (
              <View
                key={promo.id}
                style={[styles.promoCardContainer, cardStyle]}
              >
                <Image
                  source={
                    promo.imageUrl && promo.imageUrl.startsWith('http')
                      ? { uri: promo.imageUrl }
                      : require('./assets/promo-image.png')
                  }
                  style={styles.promoCard}
                  resizeMode="cover"
                  onError={() => {
                    console.log('Failed to load promo image:', promo.imageUrl);
                  }}
                />
                {/* Optional: Add promo info overlay */}
                {promo.discount && (
                  <View style={styles.promoOverlay}>
                    <Text style={styles.promoDiscount}>
                      {promo.discount}% OFF
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => {
            navigation.replace('Login');
          }}
        >
          <Text style={styles.startText}>Mulai</Text>
          <Image
            source={require('./assets/pkbi-logo.png')}
            style={styles.startLogo}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bgPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    zIndex: 0,
    opacity: 1,
  },
  titleWrapper: {
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    ...TextStyles.onboardTitle,
  },
  cardStack: {
    width: 313,
    height: 260,
    marginTop: 38,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  promoCardContainer: {
    position: 'absolute',
  },
  promoCard: {
    width: 313,
    height: 138,
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  promoOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  promoDiscount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FontFamily.outfit_semibold,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    zIndex: 5,
    transform: [{ translateY: 150 }, { translateX: 0 }],
  },
  startText: {
    color: '#000000',
    marginRight: 10,
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 15,
    lineHeight: 24,
  },
  startLogo: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
});
