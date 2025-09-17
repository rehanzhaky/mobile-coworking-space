import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';
import ApiService from '../services/api';
import GoogleAuthService from '../services/googleAuth';

// Custom icons for register form - using fallback to existing icon for now
const UserIcon = () => {
  try {
    return (
      <Image
        source={require('./assets/user-icon-login.png')}
        style={{ width: 20, height: 20, marginRight: 10 }}
      />
    );
  } catch (error) {
    return (
      <Image
        source={require('./assets/pkbi-logo.png')}
        style={{ width: 20, height: 20, marginRight: 10 }}
      />
    );
  }
};

const EmailIcon = () => {
  try {
    return (
      <Image
        source={require('./assets/email-icon.png')}
        style={{ width: 19, height: 20, marginRight: 10 }}
      />
    );
  } catch (error) {
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
    return (
      <Image
        source={require('./assets/pkbi-logo.png')}
        style={{ width: 20, height: 20, marginRight: 10 }}
      />
    );
  }
};

const EyeIcon = () => (
  <Image
    source={require('./assets/eye-icon.png')}
    style={{ width: 20, height: 20 }}
  />
);

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [securePass, setSecurePass] = useState(true);
  const [secureRePass, setSecureRePass] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username harus diisi');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email harus diisi');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Format email tidak valid');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Password harus diisi');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return false;
    }

    if (password !== rePassword) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    console.log('handleRegister called');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Starting registration process...');
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

      const userData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      };
      console.log('Calling ApiService.registerUser with:', userData.email);

      const result = await ApiService.registerUser(userData);
      console.log('Registration result:', result);

      if (result.success) {
        console.log('Registration successful');
        Alert.alert(
          'Berhasil!',
          'Akun Anda telah berhasil dibuat. Silakan login.',
          [
            {
              text: 'OK',
              onPress: () => navigation?.navigate('Login'),
            },
          ],
        );
      } else {
        console.log('Registration failed:', result.message);
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Registration catch error:', error);
      Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      console.log('Registration process completed');
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    
    try {
      const result = await GoogleAuthService.signIn();
      
      if (result.success) {
        // Tampilkan pesan sukses dan arahkan ke halaman login dengan email yang sudah dipilih
        Alert.alert(
          'Berhasil!',
          `Akun Google Anda telah berhasil terdaftar dengan email ${result.user?.email || 'yang dipilih'}.\n\nAnda sekarang dapat masuk menggunakan tombol "Masuk dengan Google" di halaman login.`,
          [
            {
              text: 'Lanjut ke Login',
              onPress: () => {
                // Arahkan ke LoginScreen dan pass email yang sudah dipilih
                navigation?.navigate('Login', { 
                  googleEmail: result.user?.email,
                  registrationSuccess: true 
                });
              },
            },
          ],
        );
      } else {
        // Handle DEVELOPER_ERROR with user-friendly message
        if (result.error?.includes('DEVELOPER_ERROR') || result.error?.includes('Unable to sign in')) {
          Alert.alert(
            'Informasi',
            'Saat ini terjadi masalah konfigurasi Google Sign-In. Anda masih bisa mendaftar menggunakan email dan password.',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        } else {
          Alert.alert('Error', result.error || 'Gagal melakukan registrasi dengan Google');
        }
      }
    } catch (error) {
      console.error('Google registration error:', error);
      Alert.alert(
        'Informasi', 
        'Saat ini Google Sign-In tidak tersedia. Silakan gunakan pendaftaran dengan email dan password.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setGoogleLoading(false);
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
          source={require('./assets/register-background.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
              <Text style={styles.header1}>Co-Working Space</Text>
              <Text style={styles.title}>Daftar</Text>
              <Text style={styles.subtitle}>
                Pastikan anda berasal dari komunitas
              </Text>

              <View style={styles.formBox}>
                {/* Username */}
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan username"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor="#BDBDBD"
                  />
                </View>

                {/* Email */}
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  {/* <Text style={{ fontSize: 20, marginRight: 10 }}>＠</Text> */}
                  <EmailIcon />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#BDBDBD"
                    keyboardType="email-address"
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
                    <EyeIcon />
                  </TouchableOpacity>
                </View>

                {/* Re-Password */}
                <Text style={styles.label}>Ulangi Password</Text>
                <View style={styles.inputWrapper}>
                  <LockIcon />
                  <TextInput
                    style={styles.input}
                    placeholder="Ulangi password"
                    value={rePassword}
                    onChangeText={setRePassword}
                    placeholderTextColor="#BDBDBD"
                    secureTextEntry={secureRePass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setSecureRePass(!secureRePass)}
                  >
                    <EyeIcon />
                  </TouchableOpacity>
                </View>

                {/* Button */}
                <TouchableOpacity
                  style={[styles.button, loading && styles.disabledButton]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Daftar</Text>
                  )}
                </TouchableOpacity>

                {/* Already have an account */}
                <View style={styles.bottomTextRow}>
                  <Text style={styles.bottomText}>Sudah mempunyai akun? </Text>
                  <TouchableOpacity
                    onPress={() => navigation?.navigate('Login')}
                  >
                    <Text style={styles.loginText}>Masuk</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.orText}>Atau daftar dengan</Text>

                {/* Google Button */}
                <TouchableOpacity 
                  style={[styles.googleBtn, googleLoading && styles.disabledButton]}
                  onPress={handleGoogleRegister}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <ActivityIndicator color="#4285F4" size="small" />
                  ) : (
                    <Image
                      source={require('./assets/google-icon.png')}
                      style={{ width: 20, height: 20, marginRight: 10 }}
                    />
                  )}
                  <Text style={styles.googleBtnText}>
                    {googleLoading ? 'Mendaftar...' : 'Daftar dengan Google'}
                  </Text>
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
    marginBottom: 30,
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
    marginTop: 6,
    marginBottom: 16,
  },
  label: {
    ...TextStyles.label,
    fontWeight: 'semibold',
    fontSize: 18,
    color: '#0662CE',
    marginTop: 10,
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
    backgroundColor: '#1565C0',
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
    color: '#212121',
  },
  loginText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  orText: {
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
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  googleBtnText: {
    fontSize: 18,
    color: '#212121',
    fontWeight: '500',
  },
});
