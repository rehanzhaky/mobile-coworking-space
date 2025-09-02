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

export default function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <Text style={styles.header}>Profil</Text>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>Maxwell</Text>
            <Text style={styles.community}>Komunitas Waria</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation?.navigate('EditProfileScreen')}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuList}>
          <MenuItem
            icon={require('./assets/pesanan-saya.png')}
            label="Pesanan Saya"
            onPress={() => navigation?.navigate('MyOrdersScreen')}
          />
          <MenuItem
            icon={require('./assets/tentang-aplikasi.png')}
            label="Tentang Aplikasi Ini"
            onPress={() => navigation?.navigate('AboutAppScreen')}
          />
          <MenuItem
            icon={require('./assets/ulasan-saya.png')}
            label="Ulasan Saya"
            onPress={() => navigation?.navigate('MyReviewsScreen')}
          />
          <MenuItem
            icon={require('./assets/pusat-bantuan.png')}
            label="Pusat Bantuan"
            onPress={() => navigation?.navigate('HelpCenterScreen')}
            isLast
          />
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation?.navigate('Login')}
        >
          <Text style={styles.logoutBtnText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('Home')}
        >
          <Image
            source={require('./assets/beranda-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('CatalogScreen')}
        >
          <Image
            source={require('./assets/katalog-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('ChatScreen')}
        >
          <Image
            source={require('./assets/pesan-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtnActive}>
          <Image
            source={require('./assets/profile-icon-active.png')}
            style={styles.tabIcon}
          />
          <Text style={styles.tabTextActive}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress, isLast }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.menuItem}>
        <View style={styles.menuIcon}>
          <Image source={icon} style={styles.menuIconImage} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <Image
          source={require('./assets/arrow-right.png')}
          style={styles.menuChevronImage}
        />
      </View>
      {!isLast && <View style={styles.menuDivider} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 32,
    color: '#0070D8',
    marginLeft: 20,
    marginTop: 80,
    marginBottom: 32,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 28,
  },
  avatar: {
    width: 67,
    height: 67,
    borderRadius: 41,
    marginRight: 11,
    backgroundColor: '#D9D9D9',
  },
  name: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 18,
    color: '#000',
  },
  community: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    color: '#000',
    fontSize: 16,
    marginTop: 2,
  },
  editBtn: {
    marginLeft: 'auto',
    borderWidth: 0.6,
    borderColor: '#0070D8',
    borderRadius: 500,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  editBtnText: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    color: '#0070D8',
    fontSize: 14,
  },
  menuList: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  menuIcon: {
    width: 34,
    alignItems: 'center',
  },
  menuIconImage: {
    width: 24,
    height: 24,
  },
  menuLabel: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 18,
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  menuChevron: {
    fontSize: 22,
    color: '#bbb',
  },
  menuChevronImage: {
    width: 24,
    height: 24,
  },
  menuDivider: {
    height: 0.2,
    backgroundColor: '#8C8C8C',
    marginHorizontal: 18,
  },
  logoutBtn: {
    backgroundColor: '#FF3E43',
    marginTop: 38,
    marginHorizontal: 10,
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#fff',
    fontSize: 20,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 22,
    paddingBottom: 32,
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabBtn: {
    alignItems: 'center',
    flex: 1,
  },
  tabBtnActive: {
    backgroundColor: '#E3F1FE',
    borderRadius: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 10,
  },
  tabIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  tabTextActive: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 15,
    color: '#0070D8',
  },
});
