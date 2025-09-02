import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { FontWeight, FontFamily } from '../styles/typography';

// Dummy icons, replace with react-native-vector-icons or SVG
const ProductIcon = () => (
  <Image
    source={require('./assets/product-icon.png')}
    style={{ width: 29, height: 29 }}
  />
);
const ServiceIcon = () => (
  <Image
    source={require('./assets/service-icon.png')}
    style={{ width: 29, height: 29 }}
  />
);

const SearchIcon = () => (
  <Image
    source={require('./assets/search-icon.png')}
    style={{ width: 20, height: 20 }}
  />
);

const products = [
  {
    id: '1',
    title: 'Aplikasi Pelaporan Staf',
    subtitle: 'Untuk melaporkan pekerjaan harian staf',
    desc: 'Aplikasi ini cocok untuk kamu yang mempunyai staf paruh waktu atau hanya pelaksana yang ditugaskan beberapa hari.',
    price: 'Rp.700.000',
    image: require('./assets/pelaporan-staff.png'),
    rating: 4,
    type: 'produk',
    category: 'satuan',
    action: 'Beli Produk',
  },
  {
    id: '2',
    title: 'Aplikasi Data Entry Relawan',
    subtitle: 'Untuk menginput data relawan atau anggota\n komunitas anda',
    desc: 'Aplikasi ini cocok untuk mempermudah lembaga anda dalam mendata relawan ataupun anggota anda yang tersebar di beberapa daerah di Indonesia.',
    price: 'Rp.1.000.000',
    image: require('./assets/data-entry.png'),
    rating: 5,
    type: 'produk',
    category: 'satuan',
    action: 'Beli Produk',
  },
  {
    id: '3',
    title: 'Aplikasi Absensi Staff',
    subtitle: 'Untuk absensi staf ataupun pelaksana\n yang ada di lembaga anda',
    desc: 'Aplikasi ini cocok untuk mempermudah lembaga anda dalam melakukan absensi, dapat mendeteksi lokasi, dan juga mempunyai fitur untuk memberikan pernyataan izin',
    price: 'Rp.1.500.000',
    image: require('./assets/absensi-staff.png'),
    rating: 4,
    type: 'produk',
    category: 'satuan',
    action: 'Beli Produk',
  },
  {
    id: '4',
    title: 'Aplikasi Pelaporan Bencana',
    subtitle: 'Untuk melaporkan situasi dan kejadian bencana',
    desc: 'Aplikasi ini cocok untuk mempermudah para Tim Reaksi Cepat (TRC) bencana yang ada di lembaga anda untuk melaporkan langsung keadaan dikejadian bencana.',
    price: 'Rp.1.500.000',
    image: require('./assets/pelaporan-bencana.png'),
    rating: 4,
    type: 'produk',
    category: 'satuan',
    action: 'Beli Produk',
  },
  {
    id: '5',
    title: 'Website LMS',
    subtitle: 'Untuk akses pembelajaran para relawan\n atau komunitas lembaga',
    desc: 'Aplikasi ini cocok untuk mempermudah para Tim Reaksi Cepat (TRC) bencana yang ada di lembaga anda untuk melaporkan langsung keadaan dikejadian bencana.',
    price: 'Rp.1.500.000',
    image: require('./assets/website-lms.png'),
    rating: 5,
    type: 'produk',
    category: 'satuan',
    action: 'Beli Produk',
  },
  {
    id: '6',
    title: 'Website Profile',
    subtitle: 'Portofolio untuk memperkenalkan\n lembaga anda secara digital',
    desc: 'Website ini cocok untuk memperkenalkan kepada publik terkait lembaga anda, mirip dengan portofolio hanya dikemas secara digital melalui web',
    price: 'Rp.1.800.000',
    image: require('./assets/website-profile.png'),
    rating: 5,
    type: 'produk',
    category: 'satuan',
    action: 'Beli Produk',
  },
  {
    id: '7',
    title: 'Layanan Design Nametag (ID Card)',
    subtitle: 'Untuk tanda pengenal para relawan atau staf',
    desc: 'Layanan ini dapat membantu anda untuk lebih mudah membuat desain kartu tanda pengenal (ID Card).',
    price: 'Rp.1.800.000',
    image: require('./assets/id-card.png'),
    rating: 5,
    type: 'layanan',
    category: 'satuan',
    action: 'Pesan Layanan',
  },
  {
    id: '8',
    title: 'Layanan Design Banner',
    subtitle: 'Untuk promosi melalui banner atau spanduk',
    desc: 'Layanan desain ini cocok untuk lembaga anda dalam mempromosikan produk, program, ataupun lembaga melalui media banner.',
    price: 'Rp.1.800.000',
    image: require('./assets/design-banner.png'),
    rating: 4,
    type: 'layanan',
    category: 'satuan',
    action: 'Pesan Layanan',
  },
  {
    id: '9',
    title: 'Layanan Design Poster',
    subtitle: 'Untuk promosi atau memperkenalkan\nkegiatan yang berlangsung',
    desc: 'Layanan desain ini cocok untuk lembaga anda dalam mempromosikan ataupun memperkenalkan kegiatan yang akan diselenggarakan melalui poster.',
    price: 'Rp.1.000.000',
    image: require('./assets/design-poster.png'),
    rating: 4,
    type: 'layanan',
    category: 'satuan',
    action: 'Pesan Layanan',
  },
  {
    id: '10',
    title: 'Layanan Sewa Zoom',
    subtitle:
      'Untuk menjadi ruang kerja secara virtual\ndengan para relawan atau staf',
    desc: 'Layanan sewa ini dapat disewa selama 8 jam, sehingga menjadi ruang kerja ataupun komunikasi jarak jauh yang tak terbatas dengan para relawan atuapun staf melalui zoom pro',
    price: 'Rp.1.000.000',
    image: require('./assets/layanan-zoom.png'),
    rating: 5,
    type: 'layanan',
    category: 'satuan',
    action: 'Pesan Layanan',
  },
];

export default function CatalogScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('produk');
  const [activeCategory, setActiveCategory] = useState('satuan');
  const [expanded, setExpanded] = useState(null);

  const filteredProducts = products.filter(
    p => p.type === activeType && p.category === activeCategory,
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <Text style={styles.title}>Katalog</Text>
        <Text style={styles.subtitle}>Ruang Kerja Virtual</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk/layanan yang anda butuhkan..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
          <SearchIcon />
        </View>

        {/* Produk/Layanan Switch */}
        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[
              styles.switchCard,
              activeType === 'produk' && styles.switchCardActive,
            ]}
            onPress={() => setActiveType('produk')}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <ProductIcon />
              <Text
                style={[
                  styles.switchTitle,
                  activeType === 'produk' && styles.switchTitleActive,
                ]}
              >
                Produk
              </Text>
            </View>
            <Text
              style={[
                styles.switchDesc,
                activeType === 'produk' && styles.switchDescActive,
              ]}
            >
              Aplikasi dan Website untuk komunitas
            </Text>
            <Text
              style={[
                styles.switchLink,
                activeType === 'produk' && styles.switchLinkActive,
              ]}
            >
              Lihat produk
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchCard,
              activeType === 'layanan' && styles.switchCardActive,
            ]}
            onPress={() => setActiveType('layanan')}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <ServiceIcon />
              <Text
                style={[
                  styles.switchTitle,
                  activeType === 'layanan' && styles.switchTitleActive,
                ]}
              >
                Layanan
              </Text>
            </View>
            <Text
              style={[
                styles.switchDesc,
                activeType === 'layanan' && styles.switchDescActive,
              ]}
            >
              Jasa untuk membantu komunitas
            </Text>
            <Text
              style={[
                styles.switchLink,
                activeType === 'layanan' && styles.switchLinkActive,
              ]}
            >
              Lihat layanan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Kategori */}
        <Text style={styles.categoryTitle}>Kategori</Text>
        <View style={styles.categoryRow}>
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              activeCategory === 'satuan' && styles.categoryBtnActive,
            ]}
            onPress={() => setActiveCategory('satuan')}
          >
            <Text
              style={[
                styles.categoryBtnText,
                activeCategory === 'satuan' && styles.categoryBtnTextActive,
              ]}
            >
              Satuan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              activeCategory === 'paket' && styles.categoryBtnActive,
            ]}
            onPress={() => setActiveCategory('paket')}
          >
            <Text
              style={[
                styles.categoryBtnText,
                activeCategory === 'paket' && styles.categoryBtnTextActive,
              ]}
            >
              Paket
            </Text>
          </TouchableOpacity>
        </View>

        {/* Products List */}
        {filteredProducts.map((item, idx) => (
          <View key={item.id} style={styles.productCard}>
            <View style={styles.productImageWrapper}>
              <Image source={item.image} style={styles.productImg} />
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  navigation.navigate('ProductDetailScreen', { product: item })
                }
              >
                <Text style={styles.actionBtnText}>{item.action}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              {/* Conditional Product Details */}
              {expanded === item.id && (
                <>
                  {/* Product Title dan Rating */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.productTitle}>{item.title}</Text>
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
                              width: 11.52,
                              height: 11.52,
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Product Subtitle dan Price */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <Text style={styles.productSubtitle}>{item.subtitle}</Text>
                    <Text style={styles.productPrice}>{item.price}</Text>
                  </View>

                  <View
                    style={{
                      height: 1,
                      backgroundColor: '#ddd',
                      marginVertical: 10,
                    }}
                  />

                  {/* Product Description */}
                  <View style={{ marginBottom: 10 }}>
                    <Text style={styles.productDesc}>{item.desc}</Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.expandBtn}
                onPress={() =>
                  setExpanded(expanded === item.id ? null : item.id)
                }
              >
                <View style={{ alignItems: 'center' }}>
                  {expanded !== item.id && (
                    <Text style={styles.expandText}>lihat selengkapnya</Text>
                  )}
                  <Image
                    source={
                      expanded === item.id
                        ? require('./assets/arrow-up.png')
                        : require('./assets/arrow-down.png')
                    }
                    style={{
                      width: 18,
                      height: 18,
                      marginTop: expanded === item.id ? 0 : 4,
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
        <TouchableOpacity style={styles.tabBtnActive}>
          <Image
            source={require('./assets/katalog-icon-active.png')}
            style={styles.tabIcon}
          />
          <Text style={styles.tabTextActive}>Katalog</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation.navigate('ChatScreen')}
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
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 32,
    color: '#0070D8',
    textAlign: 'center',
    marginTop: 82,
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 16,
    color: '#112D4E',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8C8C8C',
    borderRadius: 26,
    paddingHorizontal: 20,
    marginHorizontal: 18,
    marginTop: 10,
    height: 50,
  },
  searchInput: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    flex: 1,
    fontSize: 14,
    color: '#112D4E',
    paddingVertical: 6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  switchCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    backgroundColor: '#fff',
    padding: 16,
  },
  switchCardActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  switchTitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 18,
    paddingLeft: 10,
    color: '#1976D2',
  },
  switchTitleActive: {
    color: '#fff',
  },
  switchDesc: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 2,
  },
  switchDescActive: {
    color: '#fff',
  },
  switchLink: {
    fontSize: 13,
    color: '#1976D2',
    marginTop: 10,
  },
  switchLinkActive: {
    color: '#fff',
  },
  categoryTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    color: '#000000',
    marginHorizontal: 18,
    marginTop: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 10,
  },
  categoryBtn: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#646464',
    paddingHorizontal: 26,
    paddingVertical: 7,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  categoryBtnActive: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F1FE',
  },
  categoryBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#112D4E',
  },
  categoryBtnTextActive: {
    color: '#1976D2',
  },
  productContainer: {
    marginHorizontal: 16,
    marginBottom: 22,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 22,
    borderWidth: 2,
    borderColor: '#8C8C8C',
    overflow: 'hidden',
  },
  productImageWrapper: {
    borderRadius: 24,
    marginTop: 10,
    width: 350,
    height: 160,
    backgroundColor: '#112D4E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5.8,
  },
  productImg: {
    borderRadius: 24,
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  actionBtn: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
  },
  actionBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#0070D8',
    fontSize: 13,
  },
  productTitle: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#000000',
  },
  productSubtitle: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 11,
    color: '#222',
    marginTop: 2,
  },
  productPrice: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 15,
    color: '#000000',
    marginLeft: 10,
  },
  productDesc: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 13,
    color: '#000000',
    marginTop: 0,
  },
  expandBtn: {
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  expandText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 15,
    color: '#707070',
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
