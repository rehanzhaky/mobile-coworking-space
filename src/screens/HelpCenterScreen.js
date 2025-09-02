import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { FontWeight, FontFamily } from '../styles/typography';

// Sample data for FAQ categories and questions
const CATEGORIES = [
  { key: 'general', label: 'Informasi Umum' },
  { key: 'account', label: 'Akun' },
  { key: 'support', label: 'Customer Support' },
  { key: 'transaction', label: 'Transaksi' },
];

const FAQ = {
  general: [
    {
      q: 'Bagaimana cara membeli produk dan layanan?',
      a: 'Untuk membeli produk dan layanan, silahkan pilih produk/layanan yang diinginkan lalu ikuti proses checkout dan pembayaran.',
    },
    {
      q: 'Apa perbedaan produk dengan layanan?',
      a: 'Produk adalah barang fisik atau digital yang dibeli, sedangkan layanan adalah jasa atau fasilitas yang dapat digunakan.',
    },
  ],
  account: [
    {
      q: 'Bagaimana cara mengganti password?',
      a: 'Masuk ke menu profil, lalu pilih pengaturan akun dan ganti password sesuai petunjuk.',
    },
  ],
  support: [
    {
      q: 'Bagaimana menghubungi customer support?',
      a: 'Anda dapat menghubungi customer support melalui menu bantuan atau kontak yang tersedia di aplikasi.',
    },
  ],
  transaction: [
    {
      q: 'Bagaimana cara melihat riwayat transaksi?',
      a: 'Masuk ke halaman profil, lalu pilih menu riwayat transaksi.',
    },
  ],
};

export default function HelpCenterScreen({ navigation }) {
  const [category, setCategory] = useState('general');
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Image
              source={require('./assets/back-icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Pusat Bantuan</Text>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScrollView}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryBtn,
                category === cat.key && styles.categoryBtnActive,
              ]}
              onPress={() => {
                setCategory(cat.key);
                setOpenIndex(null);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat.key && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ List */}
        <View style={{ marginTop: 24 }}>
          {FAQ[category].map((item, idx) => (
            <View key={idx} style={styles.faqBox}>
              <TouchableOpacity
                style={styles.faqQuestionRow}
                onPress={() => setOpenIndex(openIndex === idx ? null : idx)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{item.q}</Text>
                <Image
                  source={
                    openIndex === idx
                      ? require('./assets/blue-icon-up.png')
                      : require('./assets/blue-icon-down.png')
                  }
                  style={styles.arrowIconImage}
                />
              </TouchableOpacity>
              {openIndex === idx && (
                <Text style={styles.faqAnswer}>{item.a}</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 31,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  backBtn: {
    marginRight: 12,
    marginTop: -6,
  },
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    flex: 1,
    fontSize: 21,
    color: '#0070D8',
    textAlign: 'center',
  },
  categoryScrollView: {
    marginBottom: 30,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#646464',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  categoryBtnActive: {
    backgroundColor: '#0070D8',
    borderColor: '#0070D8',
  },
  categoryText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#112D4E',
  },
  categoryTextActive: {
    color: '#fff',
  },
  faqBox: {
    marginHorizontal: 16,
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#646464',
    backgroundColor: '#fff',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#1976D2',
    marginLeft: 10,
  },
  arrowIconImage: {
    width: 16,
    height: 16,
    marginLeft: 10,
  },
  faqAnswer: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: '#000000',
    paddingTop: 10,
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
});
