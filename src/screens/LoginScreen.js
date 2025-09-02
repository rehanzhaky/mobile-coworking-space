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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [securePass, setSecurePass] = useState(true);

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
                {/* Username */}
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan username/email"
                    value={username}
                    onChangeText={setUsername}
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
                  style={styles.button}
                  onPress={() => navigation?.replace('Home')}
                >
                  <Text style={styles.buttonText}>Masuk</Text>
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
    paddingTop: 40,
    paddingHorizontal: 0,
  },
  header1: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#0070D8',
    marginBottom: 78,
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
    marginBottom: 30,
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
    height: 54,
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
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginTop: 4,
  },
  googleBtnText: {
    ...TextStyles.bodyLarge,
    fontSize: 18,
    color: '#000000',
  },
});
