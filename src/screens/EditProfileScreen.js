import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontWeight, FontFamily } from '../styles/typography';
import ApiService from '../services/api';


// Replace with your default profile image
const DEFAULT_PROFILE = require('./assets/edit-profile.png');
const CAMERA_ICON = require('./assets/camera-icon.png'); // Replace with your camera icon

export default function EditProfileScreen({ navigation }) {
  const [photo, setPhoto] = useState(DEFAULT_PROFILE);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [community, setCommunity] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('Loading user data...');

      // Check if user is logged in first
      const isLoggedIn = await ApiService.isLoggedIn();
      console.log('Is logged in:', isLoggedIn);

      if (!isLoggedIn) {
        console.log('User not logged in, redirecting to login');
        Alert.alert(
          'Error',
          'Anda belum login. Silakan login terlebih dahulu.',
          [
            {
              text: 'OK',
              onPress: () => navigation?.replace('Login'),
            },
          ],
        );
        return;
      }

      const user = await ApiService.getCurrentUser();
      console.log('User data loaded:', user);

      if (user) {
        setUserData(user);
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setUsername(user.username || '');
        setCommunity(user.community || '');
        setEmail(user.email || '');
        setProfilePhoto(user.profilePhoto || '');

        // Update photo display
        if (user.profilePhoto) {
          setPhoto({ uri: user.profilePhoto });
        }

        console.log('Form data set:', {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          username: user.username || '',
          community: user.community || '',
          email: user.email || '',
          profilePhoto: user.profilePhoto || '',
        });
      } else {
        console.log(
          'No user data found, but user is logged in - this is unexpected',
        );
        Alert.alert(
          'Error',
          'User data tidak ditemukan. Silakan login ulang.',
          [
            {
              text: 'OK',
              onPress: () => navigation?.replace('Login'),
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Gagal memuat data profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = () => {
    Alert.alert(
      'Fitur Upload Foto',
      'Fitur upload foto sedang dalam pengembangan dan akan segera tersedia.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleSave = async () => {
    if (!userData?.id) {
      Alert.alert('Error', 'User data tidak ditemukan');
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        username: username.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        community: community.trim(),
        profilePhoto: profilePhoto,
      };

      console.log('Saving profile data:', profileData);

      const result = await ApiService.updateProfile(userData.id, profileData);

      if (result.success) {
        Alert.alert('Berhasil!', 'Profile berhasil diupdate', [
          {
            text: 'OK',
            onPress: () => navigation?.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Save profile error:', error);
      Alert.alert('Error', 'Gagal menyimpan profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Image
              source={require('./assets/back-icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Foto Profil */}
        <TouchableOpacity
          style={styles.photoWrapper}
          onPress={handlePhotoChange}
        >
          <Image source={photo} style={styles.avatar} />
          <View style={styles.cameraIconWrapper}>
            <Image source={CAMERA_ICON} style={styles.cameraIcon} />
          </View>
          <Text style={styles.photoText}>Tap untuk ganti foto</Text>
        </TouchableOpacity>

        {/* Form */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Memuat data profile...</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
            <Text style={styles.label}>Nama Depan</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Nama Depan"
              placeholderTextColor="#bbb"
              editable={!saving}
            />

            <Text style={styles.label}>Nama Belakang</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Nama Belakang"
              placeholderTextColor="#bbb"
              editable={!saving}
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#bbb"
              editable={!saving}
            />

            <Text style={styles.label}>Komunitas</Text>
            <TextInput
              style={styles.input}
              value={community}
              onChangeText={setCommunity}
              placeholder="Komunitas"
              placeholderTextColor="#bbb"
              editable={!saving}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#bbb"
              editable={!saving}
            />
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.disabledBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 18,
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
  photoWrapper: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 109,
    height: 109,
    borderRadius: 70,
    backgroundColor: '#D9D9D9',
  },
  cameraIconWrapper: {
    position: 'absolute',
    right: 130,
    bottom: 33,
    width: 26,
    height: 26,
    borderRadius: 24,
    backgroundColor: '#112D4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    width: 12,
    height: 12,
    tintColor: '#fff',
  },
  photoText: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    marginTop: 12,
    fontSize: 17,
    color: '#000',
  },
  label: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#000',
    marginTop: 10,
    marginBottom: 7,
  },
  input: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#fff',
    marginBottom: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  saveBtn: {
    backgroundColor: '#0070D8',
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 35,
    marginBottom: 38,
    width: '70%',
    alignSelf: 'center',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  saveBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#fff',
    fontSize: 16,
  },
});
