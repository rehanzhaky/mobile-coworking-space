import React from 'react';
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

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
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

        {/* Promo cards (illustration) */}
        <View style={styles.cardStack}>
          <Image
            source={require('./assets/promo-image.png')}
            style={[
              styles.promoCard,
              {
                zIndex: 3,
                transform: [
                  { rotate: '-8.68deg' },
                  { translateY: 75 },
                  { translateX: 50 },
                ],
              },
            ]}
          />
          <Image
            source={require('./assets/promo-image.png')}
            style={[
              styles.promoCard,
              {
                zIndex: 2,
                transform: [
                  { rotate: '18.82deg' },
                  { translateY: 230 },
                  { translateX: 40 },
                ],
              },
            ]}
          />
          <Image
            source={require('./assets/promo-image.png')}
            style={[
              styles.promoCard,
              {
                zIndex: 3,
                transform: [
                  { rotate: '3.3deg' },
                  { translateY: 400 },
                  { translateX: 80 },
                ],
              },
            ]}
          />
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
    marginTop: height * 0.13,
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    ...TextStyles.onboardTitle,
  },
  cardStack: {
    width: width,
    height: 260,
    marginTop: 38,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  promoCard: {
    width: 313,
    height: 138,
    position: 'absolute',
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 50,
    backgroundColor: 'transparent',
    zIndex: 5,
    transform: [
                  { translateY: 125 },
                  { translateX: 0 },
                ],
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
