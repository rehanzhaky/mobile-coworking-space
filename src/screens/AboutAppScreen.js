import React from 'react';
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

const LOGO = require('./assets/sembangin-logo.png'); // Replace with the actual logo image path

export default function AboutAppScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Image
              source={require('./assets/back-icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Tentang Aplikasi Ini</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Description */}
        <View style={styles.descContainer}>
          <Text style={styles.heading}>Sembangin Coworking Space</Text>
          <Text style={styles.desc}>
            Aplikasi ini dibuat untuk menjual dan juga membeli ruang kerja
            bersama secara virtual untuk komunitas.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 12,
    marginTop: -6,
  },
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    flex: 1,
    fontSize: 21,
    color: '#0070D8',
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 55,
    marginBottom: 51,
  },
  logo: {
    width: 201,
    height: 83,
  },
  descContainer: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  heading: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 15,
    marginBottom: 15,
    color: '#000',
    lineHeight: 22,
  },
  desc: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 16,
    color: '#222',
    lineHeight: 26,
  },
  backBtn: {
    fontSize: 32,
    color: '#000',
    marginRight: 10,
    marginTop: -6,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
});
