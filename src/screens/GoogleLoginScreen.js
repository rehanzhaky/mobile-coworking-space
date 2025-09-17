import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleAuthService from '../services/googleAuth';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';

const GoogleLoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Starting Google Sign-In process...');
      
      // Check Google Play Services availability (Android only)
      if (Platform.OS === 'android') {
        const hasPlayServices = await GoogleAuthService.checkGooglePlayServices();
        if (!hasPlayServices) {
          Alert.alert(
            'Google Play Services Required',
            'Please install or update Google Play Services to use Google Sign-In.'
          );
          setLoading(false);
          return;
        }
      }
      
      // Perform Google Sign-In
      const result = await GoogleAuthService.signInWithGoogle();
      
      // Store user data and token
      await AsyncStorage.setItem('userToken', result.token);
      await AsyncStorage.setItem('userData', JSON.stringify(result.backendUser.user));
      
      Alert.alert(
        'Login Berhasil! 🎉',
        `Selamat datang, ${result.backendUser.user.firstName}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to main app
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }], // Adjust route name as needed
              });
            },
          },
        ]
      );
      
    } catch (error) {
      console.error('❌ Google Sign-In failed:', error);
      
      let errorMessage = 'Login dengan Google gagal. Silakan coba lagi.';
      
      // Handle specific error cases
      if (error.message.includes('cancelled')) {
        errorMessage = 'Login dibatalkan oleh pengguna.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Tidak ada koneksi internet. Periksa koneksi Anda.';
      } else if (error.message.includes('Play Services')) {
        errorMessage = 'Google Play Services tidak tersedia atau perlu diperbarui.';
      }
      
      Alert.alert('Login Gagal', errorMessage);
      
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Login dengan Google</Text>
        </View>
        
        {/* Logo atau Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>🏢</Text>
            <Text style={styles.appName}>Mobile Coworking Space</Text>
          </View>
        </View>
        
        {/* Google Sign-In Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.googleButtonTextLoading}>Sedang masuk...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.googleIcon}>🔍</Text>
                <Text style={styles.googleButtonText}>Lanjutkan dengan Google</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Dengan masuk, Anda menyetujui syarat dan ketentuan aplikasi
          </Text>
        </View>
        
        {/* Alternative Login */}
        <View style={styles.alternativeContainer}>
          <TouchableOpacity
            style={styles.alternativeButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.alternativeText}>
              Kembali ke login biasa
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333333',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    marginBottom: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleButtonTextLoading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginLeft: 8,
  },
  infoContainer: {
    marginBottom: 40,
  },
  infoText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  alternativeContainer: {
    alignItems: 'center',
  },
  alternativeButton: {
    padding: 12,
  },
  alternativeText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default GoogleLoginScreen;
