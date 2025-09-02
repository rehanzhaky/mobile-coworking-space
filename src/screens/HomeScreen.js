import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';

const SearchIcon = () => (
  <Image
    source={require('./assets/search-icon.png')}
    style={{ width: 20, height: 20 }}
  />
);

// Dummy Notification Icon with Badge
const NotificationIcon = () => {
  try {
    return (
      <Image
        source={require('./assets/notification-icon.png')}
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

const promoImages = [
  // Replace with your real images
  { id: 'promo1', image: 'https://i.imgur.com/H6b1KqK.png' },
  { id: 'promo2', image: 'https://i.imgur.com/H6b1KqK.png' },
];

const products = [
  {
    id: '1',
    title: 'Aplikasi Data Relawan',
    subtitle: 'Aplikasi untuk mengelola data relawan',
    desc: 'Aplikasi ini membantu organisasi dalam mengelola database relawan secara efisien dan terorganisir.',
    price: 'Rp.25.000.000',
    image: 'https://i.imgur.com/gDVUu0z.png',
    rating: 4,
    type: 'produk',
    category: 'paket',
    action: 'Beli Produk',
  },
  {
    id: '2',
    title: 'Aplikasi absen',
    subtitle: 'Aplikasi untuk absensi digital',
    desc: 'Sistem absensi digital yang memudahkan monitoring kehadiran karyawan secara real-time.',
    price: 'Rp.28.000.000',
    image: 'https://i.imgur.com/AZzGS8J.png',
    rating: 5,
    type: 'produk',
    category: 'paket',
    action: 'Beli Produk',
  },
  {
    id: '3',
    title: 'Aplikasi lainnya',
    subtitle: 'Aplikasi custom sesuai kebutuhan',
    desc: 'Solusi aplikasi yang dapat disesuaikan dengan kebutuhan spesifik organisasi Anda.',
    price: 'Rp.20.000.000',
    image: 'https://i.imgur.com/pni2qU2.png',
    rating: 3,
    type: 'produk',
    category: 'satuan',
    action: 'Beli Produk',
  },
  {
    id: '4',
    title: 'Aplikasi komunitas',
    subtitle: 'Platform untuk mengelola komunitas',
    desc: 'Aplikasi yang dirancang khusus untuk memfasilitasi interaksi dan pengelolaan komunitas.',
    price: 'Rp.21.000.000',
    image: 'https://i.imgur.com/k16AnH0.png',
    rating: 4,
    type: 'produk',
    category: 'paket',
    action: 'Beli Produk',
  },
];

const categories = [
  { id: 'all', label: 'Semua' },
  { id: 'produk', label: 'Produk' },
  { id: 'layanan', label: 'Layanan' },
];

export default function HomeScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Dummy filtered data
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(p => selectedCategory === 'produk');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerTitle}>Temukan Ruang Kerja Virtual</Text>
            <Text style={styles.headerSubtitle}>Untuk Komunitas Anda</Text>
          </View>
          <TouchableOpacity
            style={styles.iconNotif}
            onPress={() => navigation?.navigate('NotificationScreen')}
          >
            <NotificationIcon />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk yang anda butuhkan..."
            placeholderTextColor="#112D4E"
            value={search}
            onChangeText={setSearch}
          />
          <SearchIcon />
        </View>

        {/* Promo Banner */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 20 }}
          contentContainerStyle={{ paddingLeft: 18 }}
        >
          <View style={styles.promoCard}>
            <Image
              source={require('./assets/promo-image.png')}
              style={styles.promoImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.promoCard}>
            <Image
              source={require('./assets/promo-image.png')}
              style={styles.promoImage}
              resizeMode="cover"
            />
          </View>
          {/* Bisa tambah promo lain */}
        </ScrollView>

        {/* Katalog */}
        <View style={styles.catalogHeader}>
          <Text style={styles.catalogTitle}>Katalog</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CatalogScreen')}
          >
            <Text style={styles.seeAll}>lihat semua</Text>
          </TouchableOpacity>
        </View>
        {/* Category Filter */}
        <View style={styles.categoryRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryBtn,
                selectedCategory === cat.id && styles.categoryBtnActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryBtnText,
                  selectedCategory === cat.id && styles.categoryBtnTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Product List */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            marginTop: 10,
          }}
        >
          {filteredProducts.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              onPress={() =>
                navigation.navigate('ProductDetailScreen', { product: item })
              }
            >
              <Image source={{ uri: item.image }} style={styles.productImg} />
              <View style={{ padding: 10 }}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 6,
                  }}
                >
                  <Text style={styles.productPrice}>{item.price}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <View
                        key={i}
                        style={{
                          marginRight: i < 5 ? 2 : 0,
                        }}
                      >
                        <Image
                          source={
                            i <= item.rating
                              ? require('./assets/Star-Yellow.png')
                              : require('./assets/Star.png')
                          }
                          style={{
                            width: 10,
                            height: 10,
                          }}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabBtnActive}>
          <Image
            source={require('./assets/beranda-icon-active.png')}
            style={styles.tabIcon}
          />
          <Text style={styles.tabTextActive}>Beranda</Text>
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
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('ProfileScreen')}
        >
          <Image
            source={require('./assets/profile-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 80,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#0070D8',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: '#112D4E',
    marginBottom: 10,
  },
  iconNotif: {
    marginTop: 5,
    marginRight: 4,
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 26,
    paddingHorizontal: 20,
    marginHorizontal: 18,
    marginTop: 8,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#112D4E',
    paddingVertical: 3,
  },
  promoCard: {
    width: 313,
    height: 146,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginRight: 16,
    elevation: 2,
    shadowColor: '#fffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  promoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  catalogHeader: {
    marginTop: 30,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  catalogTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#000000',
  },
  seeAll: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 14,
    color: '#0070D8',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 8,
    marginTop: 2,
  },
  categoryBtn: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#646464',
    marginRight: 14,
    paddingHorizontal: 20,
    paddingVertical: 7,
    backgroundColor: '#fff',
  },
  categoryBtnActive: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F1FE',
  },
  categoryBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#112D4E',
    fontSize: 12,
  },
  categoryBtnTextActive: {
    color: '#1976D2',
  },
  productCard: {
    width: '47%',
    backgroundColor: '#F4F8FB',
    borderRadius: 18,
    marginBottom: 18,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
    backgroundColor: '#fff',
  },
  productTitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 12,
    color: '#000000',
  },
  productPrice: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 10,
    color: '#000000',
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
