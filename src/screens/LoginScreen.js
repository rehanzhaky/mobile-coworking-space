import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';
import ApiService from '../services/api';
import FirebaseService from '../config/firebase';

// Custom icons for login form - using fallback to existing icon for now
const UserIcon = () => {
  try {
    return (
      <Image
        source={require('./assets/user-icon-login.png')}
        style={{ width: 20, height: 20, marginRight: 10 }}
      />
    );
  } catch (error) {
    // Fallback if icon doesn't exist
    return (
      <Image
        source={require('./assets/pkbi-logo.png')}
        style={{ width: 20, height: 20, marginRight: 10 }}
      />
    );
  }
};

const LockIcon = () => {
  try {
    return (
      <Image
        source={require('./assets/password-icon-login.png')}
        style={{ width: 20, height: 20, marginRight: 10 }}
      />
    );
  } catch (error) {
    // Fallback if icon doesn't exist
    return (
      <Image
        source={require('./assets/pkbi-logo.png')}
        style={{ width: 20, height: 20, marginRight: 10 }}
      />
    );
  }
};

export default function LoginScreen({ navigation }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securePass, setSecurePass] = useState(true);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!usernameOrEmail.trim()) {
      Alert.alert('Error', 'Username atau email harus diisi');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Password harus diisi');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    console.log('handleLogin called');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Starting login process...');
    setLoading(true);

    try {
      // Test connection first
      console.log('Testing connection to backend...');
      const connectionTest = await ApiService.testConnection();
      console.log('Connection test result:', connectionTest);

      if (!connectionTest.success) {
        Alert.alert(
          'Connection Error',
          `Cannot connect to server: ${connectionTest.error}`,
        );
        setLoading(false);
        return;
      }

      const loginData = {
        email: usernameOrEmail.trim(), // backend masih menggunakan parameter 'email' untuk compatibility
        password: password,
      };
      console.log('Calling ApiService.loginUser with:', loginData.email);

      const result = await ApiService.loginUser(loginData);
      console.log('Login result:', result);

      if (result.success) {
        console.log('Login successful');

        // Register Firebase token setelah login berhasil
        try {
          console.log('🔥 Registering Firebase token after login...');
          await FirebaseService.registerToken();
          console.log('✅ Firebase token registered successfully after login');
        } catch (firebaseError) {
          console.error(
            '❌ Firebase token registration failed after login:',
            firebaseError,
          );
          // Jangan gagalkan login jika Firebase error
        }

        console.log('Navigation object:', navigation);
        console.log('Attempting to navigate to Home screen...');

        // Langsung redirect ke Home tanpa alert
        if (navigation) {
          navigation.replace('Home');
          console.log('Navigation.replace("Home") called');
        } else {
          console.error('Navigation object is null/undefined');
        }

        // Optional: Tampilkan toast atau alert singkat jika diperlukan
        // Alert.alert('Berhasil!', 'Login berhasil!');
      } else {
        console.log('Login failed:', result.message);
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Login catch error:', error);
      Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      console.log('Login process completed');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFFFFF', '#0070D8']}
        locations={[0, 1]}
        style={styles.gradientOverlay}
      >
        <ImageBackground
          source={require('./assets/login-background.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
              <Text style={styles.header1}>Co-Working Space</Text>
              <Text style={styles.title}>Masuk</Text>
              <Text style={styles.subtitle}>
                Gunakan domain email komunitas anda
              </Text>

              <View style={styles.formBox}>
                {/* Username/Email */}
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan username/email"
                    value={usernameOrEmail}
                    onChangeText={setUsernameOrEmail}
                    placeholderTextColor="#BDBDBD"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password */}
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <LockIcon />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan password"
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#BDBDBD"
                    secureTextEntry={securePass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setSecurePass(!securePass)}>
                    <Text style={{ fontSize: 20 }}></Text>
                  </TouchableOpacity>
                </View>

                {/* Button */}
                <TouchableOpacity
                  style={[styles.button, loading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Masuk</Text>
                  )}
                </TouchableOpacity>

                {/* Don't have an account */}
                <View style={styles.bottomTextRow}>
                  <Text style={styles.bottomText}>Belum mempunyai akun? </Text>
                  <TouchableOpacity
                    onPress={() => navigation?.navigate('Register')}
                  >
                    <Text style={styles.loginText}>Daftar</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.orText}>Atau masuk dengan</Text>

                {/* Google Button */}
                <TouchableOpacity style={styles.googleBtn}>
                  <Image
                    source={require('./assets/google-icon.png')}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                  <Text style={styles.googleBtnText}>Masuk dengan Google</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  header1: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#0070D8',
    marginBottom: 50,
    marginTop: 20,
    marginLeft: -165,
  },
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 36,
    color: '#112D4E',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 16,
    color: '#646464',
    marginBottom: 20,
    textAlign: 'center',
  },
  formBox: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: '90%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  label: {
    ...TextStyles.label,
    fontWeight: 'semibold',
    fontSize: 18,
    color: '#0662CE',
    marginTop: 14,
    marginBottom: 7,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 18,
    paddingHorizontal: 12,
    marginBottom: 2,
    backgroundColor: '#fff',
    height: 45,
  },
  input: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    flex: 1,
    fontSize: 15,
    color: '#0662CE',
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#0662CE',
    borderRadius: 12,
    marginTop: 26,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    ...TextStyles.button,
    color: '#fff',
    fontSize: 22,
  },
  bottomTextRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  bottomText: {
    ...TextStyles.bodyMedium,
    fontSize: 16,
    color: '#000000',
  },
  loginText: {
    ...TextStyles.bodyMedium,
    fontSize: 16,
    color: '#00A9FF',
    fontWeight: 'bold',
  },
  orText: {
    ...TextStyles.bodyMedium,
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 16,
    color: '#757575',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginTop: 4,
  },
  googleBtnText: {
    ...TextStyles.bodyLarge,
    fontSize: 18,
    color: '#000000',
  },
});
