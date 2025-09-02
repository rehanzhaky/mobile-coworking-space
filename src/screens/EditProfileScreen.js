import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { FontWeight, FontFamily } from '../styles/typography';

// Replace with your default profile image
const DEFAULT_PROFILE = require('./assets/edit-profile.png');
const CAMERA_ICON = require('./assets/camera-icon.png'); // Replace with your camera icon

export default function EditProfileScreen({ navigation }) {
  // Example initial data, replace with your state management
  const [photo, setPhoto] = useState(DEFAULT_PROFILE);
  const [firstName, setFirstName] = useState('Maxwell');
  const [lastName, setLastName] = useState('Lawson');
  const [username, setUsername] = useState('Maxwell');
  const [community, setCommunity] = useState('Komunitas Waria');
  const [email, setEmail] = useState('Maxwell@sembangin.com');

  const handlePhotoChange = () => {
    // Open image picker here
  };

  const handleSave = () => {
    // Save profile logic here
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
        <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
          <Text style={styles.label}>Nama Depan</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nama Depan"
            placeholderTextColor="#bbb"
          />

          <Text style={styles.label}>Nama Belakang</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nama Belakang"
            placeholderTextColor="#bbb"
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#bbb"
          />

          <Text style={styles.label}>Komunitas</Text>
          <TextInput
            style={styles.input}
            value={community}
            onChangeText={setCommunity}
            placeholder="Komunitas"
            placeholderTextColor="#bbb"
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
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 73,
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
    right: 156,
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
    marginBottom: 9,
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
  saveBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#fff',
    fontSize: 16,
  },
});
