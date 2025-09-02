import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';

const { width, height } = Dimensions.get('window');

const splashAssets = [
  {
    id: 'call',
    source: require('./assets/splash-call.png'),
    position: { top: 0, left: 0 },
    size: { width: 200, height: 100 },
    transform: { translateX: -60, translateY: 150, rotate: '45deg' },
  },
  {
    id: 'orangeclip',
    source: require('./assets/splash-orangeclip.png'),
    position: { top: 150, right: 150 },
    size: { width: 174, height: 176 },
    transform: { translateX: 80, translateY: -90, rotate: '69deg' },
  },
  {
    id: 'blueclip',
    source: require('./assets/splash-blueclip.png'),
    position: { top: 150, right: 150 },
    size: { width: 86, height: 134 },
    transform: { translateX: 175, translateY: 150, rotate: '40deg' },
  },
  {
    id: 'paperstack',
    source: require('./assets/splash-paperstack.png'),
    position: { top: 15, left: 15 },
    size: { width: 210, height: 270 },
    transform: { translateX: -20, translateY: 260, rotate: '2deg' },
  },
  {
    id: 'pinkpaper',
    source: require('./assets/splash-pinkpaper.png'),
    position: { top: 150, right: 15 },
    size: { width: 98.99, height: 107.54 },
    transform: { translateX: -10, translateY: 380, rotate: '-5deg' },
  },
  {
    id: 'paperclip',
    source: require('./assets/splash-paperclip.png'),
    position: { bottom: 190, left: -10 },
    size: { width: 73, height: 110 },
    transform: { translateX: -15, translateY: 0, rotate: '-13deg' },
  },
  {
    id: 'pen',
    source: require('./assets/splash-pen.png'),
    position: { bottom: 110, right: 60 },
    size: { width: 120, height: 180 },
    transform: { translateX: -30, translateY: 30, rotate: '10deg' },
  },
  {
    id: 'crumple',
    source: require('./assets/splash-crumple.png'),
    position: { bottom: 60, left: 30 },
    size: { width: 150, height: 130 },
    transform: { translateX: 10, translateY: 30, rotate: '-3deg' },
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
  useEffect(() => {
    // Simulasi splash selama 3 detik sebelum pindah ke onboarding
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Decorative images, using configurable assets with transform */}
        {splashAssets.map(asset => (
          <Image
            key={asset.id}
            source={asset.source}
            style={[
              styles.item,
              getResponsivePosition(asset.position, width, height),
              scaleSize(asset.size, 1), // Scale factor dapat diubah
              getTransformStyle(asset.transform), // Transform properties
            ]}
          />
        ))}

        <View style={styles.logoContainer}>
          <Text style={styles.splashText1}>Virtual</Text>
          <Text style={styles.splashText2}>Co-Working Space</Text>
        </View>
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
  item: {
    position: 'absolute',
    resizeMode: 'cover',
    opacity: 1,
  },
  logoContainer: {
    marginTop: 45,
    position: 'absolute',
    top: height * 0.43,
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
    width: 100,
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
