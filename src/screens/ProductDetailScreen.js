import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';

const { width } = Dimensions.get('window');
const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

const tabList = ['Fitur', 'Keterangan', 'Keunggulan', 'Ulasan'];

export default function ProductDetailScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState(1);
  const { product } = route.params || {};

  // Default product jika tidak ada data yang dikirim
  const defaultProduct = {
    id: 1,
    title: 'Aplikasi Absensi Staff',
    subtitle: 'Aplikasi dan Website untuk komunitas',
    price: 'Rp 2.000.000',
    rating: 4,
    image: './assets/absensi-staff.png',
    type: 'produk',
    action: 'Beli Produk',
  };

  const currentProduct = product || defaultProduct;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentProduct.title}</Text>
        </View>

        {/* Product Image with carousel indicator (dummy, single image) */}
        <View style={styles.imageContainer}>
          <Image
            source={
              currentProduct.image &&
              typeof currentProduct.image === 'string' &&
              currentProduct.image.startsWith('http')
                ? { uri: currentProduct.image }
                : require('./assets/absensi-staff.png')
            }
            style={styles.productImage}
            resizeMode="contain"
          />
          <View style={styles.carouselIndicator}>
            <View style={[styles.dot, { backgroundColor: '#1976D2' }]} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Deskripsi */}
        <Text style={styles.descText}>
          {currentProduct.desc ||
            currentProduct.subtitle ||
            `Solusi digital untuk ${
              currentProduct.type === 'produk'
                ? 'memantau kehadiran dan aktivitas staff'
                : 'layanan profesional'
            } di lingkungan kerja anda. Dirancang untuk mempermudah pengelolaan operasional harian dan meningkatkan efisiensi manajemen ${
              currentProduct.type === 'produk' ? 'tenaga kerja' : 'layanan'
            }.`}
        </Text>

        {/* Harga */}
        <Text style={styles.priceText}>{currentProduct.price}</Text>

        {/* Tab Section */}
        <View style={styles.tabRow}>
          {tabList.map((tab, idx) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabBtn}
              onPress={() => setActiveTab(idx)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === idx && styles.tabLabelActive,
                ]}
              >
                {tab}
              </Text>
              {activeTab === idx && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tabContent}>
          {activeTab === 0 && (
            <View>
              <Text style={styles.bullet}>
                • Interface yang user-friendly dan mudah digunakan
              </Text>
              <Text style={styles.bullet}>
                • Real-time monitoring dan reporting
              </Text>
              <Text style={styles.bullet}>
                • Multi-platform support (Web & Mobile)
              </Text>
              <Text style={styles.bullet}>• Keamanan data tingkat tinggi</Text>
            </View>
          )}
          {activeTab === 1 && (
            <View>
              <Text style={styles.bullet}>
                • Proses pemberian produk akan dilakukan melalui chat
              </Text>
              <Text style={styles.bullet}>
                • Admin akan menghubungi kamu melalui chat
              </Text>
              <Text style={styles.bullet}>
                • Konsultasi gratis untuk setup awal
              </Text>
              <Text style={styles.bullet}>• Training penggunaan sistem</Text>
            </View>
          )}
          {activeTab === 2 && (
            <View>
              <Text style={styles.bullet}>
                • Teknologi terdepan dan terupdate
              </Text>
              <Text style={styles.bullet}>
                • Support 24/7 dari tim profesional
              </Text>
              <Text style={styles.bullet}>• Garansi kepuasan pelanggan</Text>
              <Text style={styles.bullet}>
                • Harga kompetitif dengan kualitas premium
              </Text>
            </View>
          )}
          {activeTab === 3 && (
            <View>
              {/* Rating Section in Ulasan Tab */}
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Rating Produk: </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View key={i} style={{ marginRight: i < 5 ? 2 : 0 }}>
                      <Image
                        source={
                          i <= currentProduct.rating
                            ? require('./assets/Star-Yellow.png')
                            : require('./assets/Star.png')
                        }
                        style={{ width: 16, height: 16 }}
                      />
                    </View>
                  ))}
                </View>
                <Text style={styles.ratingText}>
                  ({currentProduct.rating}/5)
                </Text>
              </View>

              {/* Sample Reviews */}
              <Text style={styles.bullet}>
                • "Sangat membantu dalam mengelola operasional harian" - User A
              </Text>
              <Text style={styles.bullet}>
                • "Interface yang mudah dipahami dan user-friendly" - User B
              </Text>
              <Text style={styles.bullet}>
                • "Recommend untuk semua jenis bisnis" - User C
              </Text>
              <Text style={styles.bullet}>
                • "Support team sangat responsif dan helpful" - User D
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Beli Sekarang Button */}
      <TouchableOpacity style={styles.buyBtn}>
        <Text style={styles.buyBtnText}>Beli Sekarang</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 38,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 12,
    marginTop: -6,
  },
  headerTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    marginLeft: 16,
    fontSize: 18,
    color: '#0070D8',
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#0070D8',
    borderRadius: 24,
    marginHorizontal: 18,
    marginTop: 12,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  productImage: {
    width: width * 0.7,
    height: 160,
  },
  carouselIndicator: {
    flexDirection: 'column',
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -15 }],
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ebebeb',
    marginVertical: 4,
  },
  descText: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 16,
    color: 'grey',
    marginHorizontal: 24,
    marginTop: 22,
    marginBottom: 8,
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  priceText: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 24,
    color: '#0070D8',
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 18,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 0,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e6e6e6',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  tabLabel: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#000000',
  },
  tabLabelActive: {
    color: '#0070D8',
  },
  tabUnderline: {
    marginTop: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#0070D8',
    width: '60%',
  },
  tabContent: {
    marginHorizontal: 24,
    marginVertical: 18,
  },
  bullet: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
  },
  buyBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0070D8',
    borderRadius: 24,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 32,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buyBtnText: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    color: '#fff',
    fontSize: 22,
    letterSpacing: -0.96,
  },
});
