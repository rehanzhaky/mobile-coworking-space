import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';
import ApiService from '../services/api';

const { width, height } = Dimensions.get('window');

const splashAssets = [
  {
    id: 'call',
    source: require('./assets/splash-call.png'),
    position: { top: 0, left: 0 },
    size: { width: 200, height: 100 },
    transform: { translateX: -60, translateY: 50, rotate: '45deg' },
  },
  {
    id: 'orangeclip',
    source: require('./assets/splash-orangeclip.png'),
    position: { top: 150, right: 150 },
    size: { width: 174, height: 176 },
    transform: { translateX: 80, translateY: -160, rotate: '69deg' },
  },
  {
    id: 'blueclip',
    source: require('./assets/splash-blueclip.png'),
    position: { top: 150, right: 150 },
    size: { width: 86, height: 134 },
    transform: { translateX: 175, translateY: 20, rotate: '40deg' },
  },
  {
    id: 'paperstack',
    source: require('./assets/splash-paperstack.png'),
    position: { top: 15, left: 15 },
    size: { width: 210, height: 270 },
    transform: { translateX: -20, translateY: 150, rotate: '2deg' },
  },
  {
    id: 'pinkpaper',
    source: require('./assets/splash-pinkpaper.png'),
    position: { top: 150, right: 15 },
    size: { width: 98.99, height: 107.54 },
    transform: { translateX: 5, translateY: 250, rotate: '-5deg' },
  },
  {
    id: 'paperclip',
    source: require('./assets/splash-paperclip.png'),
    position: { bottom: 190, left: -10 },
    size: { width: 73, height: 110 },
    transform: { translateX: -15, translateY: 50, rotate: '-13deg' },
  },
  {
    id: 'pen',
    source: require('./assets/splash-pen.png'),
    position: { bottom: 110, right: 60 },
    size: { width: 100, height: 150 },
    transform: { translateX: -30, translateY: 30, rotate: '10deg' },
  },
  {
    id: 'crumple',
    source: require('./assets/splash-crumple.png'),
    position: { bottom: 60, left: 30 },
    size: { width: 150, height: 130 },
    transform: { translateX: 10, translateY: 70, rotate: '-3deg' },
  },
];

// Helper function untuk scaling ukuran berdasarkan screen size
const scaleSize = (size, scaleFactor = 1) => ({
  width: size.width * scaleFactor,
  height: size.height * scaleFactor,
});

// Helper function untuk responsive positioning
const getResponsivePosition = (position, screenWidth, screenHeight) => {
  const responsivePosition = { ...position };

  // Adjust untuk layar yang lebih kecil dari 360px
  if (screenWidth < 360) {
    if (responsivePosition.left) responsivePosition.left *= 0.8;
    if (responsivePosition.right) responsivePosition.right *= 0.8;
    if (responsivePosition.top) responsivePosition.top *= 0.9;
    if (responsivePosition.bottom) responsivePosition.bottom *= 0.9;
  }

  return responsivePosition;
};

// Helper function untuk transform properties
const getTransformStyle = transform => {
  return {
    transform: [
      { translateX: transform.translateX },
      { translateY: transform.translateY },
      { rotate: transform.rotate },
    ],
  };
};

export default function SplashScreen({ navigation }) {
  const circleScale = new Animated.Value(1);
  const circleOpacity = new Animated.Value(1);
  const contentOpacity = new Animated.Value(0);
  
  // Create animated values for each splash asset movement
  const assetAnimations = splashAssets.reduce((acc, asset) => {
    acc[asset.id] = {
      translateX: new Animated.Value(asset.transform.translateX * 2), // Start from further position
      translateY: new Animated.Value(asset.transform.translateY * 2), // Start from further position
    };
    return acc;
  }, {});

  useEffect(() => {
    // Start circle animation
    const startCircleAnimation = () => {
      // Create asset movement animations
      const assetMovements = splashAssets.map(asset => 
        Animated.parallel([
          Animated.timing(assetAnimations[asset.id].translateX, {
            toValue: asset.transform.translateX, // Move to final position
            duration: 1000,
            delay: 600, // Start after circle is halfway scaled
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(assetAnimations[asset.id].translateY, {
            toValue: asset.transform.translateY, // Move to final position
            duration: 1000,
            delay: 600, // Start after circle is halfway scaled
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      );

      // Animate circle scale down and content fade in simultaneously
      Animated.parallel([
        // Scale down with smooth effect (no bounce)
        Animated.timing(circleScale, {
          toValue: 0,
          duration: 1200,
          easing: Easing.out(Easing.cubic), // Smooth effect, no bounce
          useNativeDriver: true,
        }),
        // Fade out circle as it scales down
        Animated.timing(circleOpacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        // Fade in content simultaneously
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 800,
          delay: 400, // Start showing content when circle is halfway gone
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Move all assets to their final positions
        ...assetMovements,
      ]).start();
    };

    // Start the circle animation immediately
    startCircleAnimation();

    const checkAuthAndNavigate = async () => {
      try {
        // Check if user is already logged in
        const isLoggedIn = await ApiService.isLoggedIn();

        // Wait for animation + content display duration
        setTimeout(() => {
          if (isLoggedIn) {
            navigation.replace('Home');
          } else {
            navigation.replace('Onboarding');
          }
        }, 3500); // Total duration: 1.2s animation + 2.3s content display
      } catch (error) {
        console.error('Auth check error:', error);
        // If error, go to onboarding
        setTimeout(() => {
          navigation.replace('Onboarding');
        }, 3500);
      }
    };

    checkAuthAndNavigate();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Animated Circle */}
        <Animated.View
          style={[
            styles.animatedCircle,
            {
              transform: [{ scale: circleScale }],
              opacity: circleOpacity,
            },
          ]}
        />

        {/* Content - always rendered but controlled by opacity */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: contentOpacity,
            },
          ]}
        >
          {/* Decorative images, using configurable assets with animated transform */}
          {splashAssets.map(asset => (
            <Animated.Image
              key={asset.id}
              source={asset.source}
              style={[
                styles.item,
                getResponsivePosition(asset.position, width, height),
                scaleSize(asset.size, 1), // Scale factor dapat diubah
                {
                  transform: [
                    { translateX: assetAnimations[asset.id].translateX },
                    { translateY: assetAnimations[asset.id].translateY },
                    { rotate: asset.transform.rotate },
                  ],
                },
              ]}
            />
          ))}

          <View style={styles.logoContainer}>
            <Text style={styles.splashText1}>Virtual</Text>
            <Text style={styles.splashText2}>Co-Working Space</Text>
          </View>
        </Animated.View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedCircle: {
    position: 'absolute',
    width: 900,
    height: 900,
    borderRadius: 450,
    backgroundColor: '#0070D8',
    top: '50%',
    left: '50%',
    marginTop: -450,
    marginLeft: -450,
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    position: 'absolute',
    resizeMode: 'cover',
    opacity: 1,
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  splashText1: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 32,
    lineHeight: 24,
    color: '#0070D8',
    paddingBottom: 16,
    width: 120,
    height: 40,
  },
  splashText2: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 32,
    lineHeight: 24,
    color: '#0070D8',
    paddingBottom: 16,
    width: 271,
    height: 48,
  },
});
