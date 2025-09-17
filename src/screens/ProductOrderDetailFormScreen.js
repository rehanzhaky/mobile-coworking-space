import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';
import ApiService from '../services/api';

const provinces = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Sumatera Selatan',
  'Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'DKI Jakarta',
  'Banten',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Gorontalo',
  'Sulawesi Tengah',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
  'Papua Selatan',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Barat Daya',
];

const ArrowDown = () => (
  <Image
    source={require('./assets/arrow-down.png')}
    style={{ width: 24, height: 24 }}
  />
);
const cities = {
  Aceh: [
    'Banda Aceh',
    'Sabang',
    'Langsa',
    'Lhokseumawe',
    'Subulussalam',
    'Aceh Barat',
    'Aceh Barat Daya',
    'Aceh Besar',
    'Aceh Jaya',
    'Aceh Selatan',
    'Aceh Singkil',
    'Aceh Tamiang',
    'Aceh Tengah',
    'Aceh Tenggara',
    'Aceh Timur',
    'Aceh Utara',
    'Bener Meriah',
    'Bireuen',
    'Gayo Lues',
    'Nagan Raya',
    'Pidie',
    'Pidie Jaya',
    'Simeulue',
  ],
  'Sumatera Utara': [
    'Binjai',
    'Gunungsitoli',
    'Medan',
    'Padangsidimpuan',
    'Pematangsiantar',
    'Sibolga',
    'Tanjungbalai',
    'Tebing Tinggi',
    'Asahan',
    'Batu Bara',
    'Dairi',
    'Deli Serdang',
    'Humbang Hasundutan',
    'Karo',
    'Labuhanbatu',
    'Labuhanbatu Selatan',
    'Labuhanbatu Utara',
    'Langkat',
    'Mandailing Natal',
    'Nias',
    'Nias Barat',
    'Nias Selatan',
    'Nias Utara',
    'Padang Lawas',
    'Padang Lawas Utara',
    'Pakpak Bharat',
    'Samosir',
    'Serdang Bedagai',
    'Simalungun',
    'Tapanuli Selatan',
    'Tapanuli Tengah',
    'Tapanuli Utara',
    'Toba',
  ],
  'Sumatera Barat': [
    'Bukittinggi',
    'Padang',
    'Padang Panjang',
    'Pariaman',
    'Payakumbuh',
    'Sawahlunto',
    'Solok',
    'Agam',
    'Dharmasraya',
    'Kepulauan Mentawai',
    'Lima Puluh Kota',
    'Padang Pariaman',
    'Pasaman',
    'Pasaman Barat',
    'Pesisir Selatan',
    'Sijunjung',
    'Solok',
    'Solok Selatan',
    'Tanah Datar',
  ],
  Riau: [
    'Dumai',
    'Pekanbaru',
    'Bengkalis',
    'Indragiri Hilir',
    'Indragiri Hulu',
    'Kampar',
    'Kepulauan Meranti',
    'Kuantan Singingi',
    'Pelalawan',
    'Rokan Hilir',
    'Rokan Hulu',
    'Siak',
  ],
  'Kepulauan Riau': [
    'Batam',
    'Tanjungpinang',
    'Bintan',
    'Karimun',
    'Kepulauan Anambas',
    'Lingga',
    'Natuna',
  ],
  Jambi: [
    'Jambi',
    'Sungai Penuh',
    'Batanghari',
    'Bungo',
    'Kerinci',
    'Merangin',
    'Muaro Jambi',
    'Sarolangun',
    'Tanjung Jabung Barat',
    'Tanjung Jabung Timur',
    'Tebo',
  ],
  'Sumatera Selatan': [
    'Lubuklinggau',
    'Pagar Alam',
    'Palembang',
    'Prabumulih',
    'Banyuasin',
    'Empat Lawang',
    'Lahat',
    'Muara Enim',
    'Musi Banyuasin',
    'Musi Rawas',
    'Musi Rawas Utara',
    'Ogan Ilir',
    'Ogan Komering Ilir',
    'Ogan Komering Ulu',
    'Ogan Komering Ulu Selatan',
    'Ogan Komering Ulu Timur',
    'Penukal Abab Lematang Ilir',
  ],
  'Bangka Belitung': [
    'Pangkalpinang',
    'Bangka',
    'Bangka Barat',
    'Bangka Selatan',
    'Bangka Tengah',
    'Belitung',
    'Belitung Timur',
  ],
  Bengkulu: [
    'Bengkulu',
    'Bengkulu Selatan',
    'Bengkulu Tengah',
    'Bengkulu Utara',
    'Kaur',
    'Kepahiang',
    'Lebong',
    'Mukomuko',
    'Rejang Lebong',
    'Seluma',
  ],
  Lampung: [
    'Bandar Lampung',
    'Metro',
    'Lampung Barat',
    'Lampung Selatan',
    'Lampung Tengah',
    'Lampung Timur',
    'Lampung Utara',
    'Mesuji',
    'Pesawaran',
    'Pesisir Barat',
    'Pringsewu',
    'Tanggamus',
    'Tulang Bawang',
    'Tulang Bawang Barat',
    'Way Kanan',
  ],
  'DKI Jakarta': [
    'Jakarta Barat',
    'Jakarta Pusat',
    'Jakarta Selatan',
    'Jakarta Timur',
    'Jakarta Utara',
    'Kepulauan Seribu',
  ],
  Banten: [
    'Cilegon',
    'Serang',
    'Tangerang',
    'Tangerang Selatan',
    'Lebak',
    'Pandeglang',
    'Serang',
    'Tangerang',
  ],
  'Jawa Barat': [
    'Bandung',
    'Banjar',
    'Bekasi',
    'Bogor',
    'Cimahi',
    'Cirebon',
    'Depok',
    'Sukabumi',
    'Tasikmalaya',
    'Bandung',
    'Bandung Barat',
    'Bekasi',
    'Bogor',
    'Ciamis',
    'Cianjur',
    'Cirebon',
    'Garut',
    'Indramayu',
    'Karawang',
    'Kuningan',
    'Majalengka',
    'Pangandaran',
    'Purwakarta',
    'Subang',
    'Sukabumi',
    'Sumedang',
    'Tasikmalaya',
  ],
  'Jawa Tengah': [
    'Magelang',
    'Pekalongan',
    'Salatiga',
    'Semarang',
    'Surakarta',
    'Tegal',
    'Banjarnegara',
    'Banyumas',
    'Batang',
    'Blora',
    'Boyolali',
    'Brebes',
    'Cilacap',
    'Demak',
    'Grobogan',
    'Jepara',
    'Karanganyar',
    'Kebumen',
    'Kendal',
    'Klaten',
    'Kudus',
    'Magelang',
    'Pati',
    'Pekalongan',
    'Pemalang',
    'Purbalingga',
    'Purworejo',
    'Rembang',
    'Semarang',
    'Sragen',
    'Sukoharjo',
    'Tegal',
    'Temanggung',
    'Wonogiri',
    'Wonosobo',
  ],
  'DI Yogyakarta': [
    'Yogyakarta',
    'Bantul',
    'Gunungkidul',
    'Kulon Progo',
    'Sleman',
  ],
  'Jawa Timur': [
    'Batu',
    'Blitar',
    'Kediri',
    'Madiun',
    'Malang',
    'Mojokerto',
    'Pasuruan',
    'Probolinggo',
    'Surabaya',
    'Bangkalan',
    'Banyuwangi',
    'Blitar',
    'Bojonegoro',
    'Bondowoso',
    'Gresik',
    'Jember',
    'Jombang',
    'Kediri',
    'Lamongan',
    'Lumajang',
    'Madiun',
    'Magetan',
    'Malang',
    'Mojokerto',
    'Nganjuk',
    'Ngawi',
    'Pacitan',
    'Pamekasan',
    'Pasuruan',
    'Ponorogo',
    'Probolinggo',
    'Sampang',
    'Sidoarjo',
    'Situbondo',
    'Sumenep',
    'Trenggalek',
    'Tuban',
    'Tulungagung',
  ],
  Bali: [
    'Denpasar',
    'Badung',
    'Bangli',
    'Buleleng',
    'Gianyar',
    'Jembrana',
    'Karangasem',
    'Klungkung',
    'Tabanan',
  ],
  'Nusa Tenggara Barat': [
    'Bima',
    'Mataram',
    'Bima',
    'Dompu',
    'Lombok Barat',
    'Lombok Tengah',
    'Lombok Timur',
    'Lombok Utara',
    'Sumbawa',
    'Sumbawa Barat',
  ],
  'Nusa Tenggara Timur': [
    'Kupang',
    'Alor',
    'Belu',
    'Ende',
    'Flores Timur',
    'Kupang',
    'Lembata',
    'Manggarai',
    'Manggarai Barat',
    'Manggarai Timur',
    'Nagekeo',
    'Ngada',
    'Rote Ndao',
    'Sabu Raijua',
    'Sikka',
    'Sumba Barat',
    'Sumba Barat Daya',
    'Sumba Tengah',
    'Sumba Timur',
    'Timor Tengah Selatan',
    'Timor Tengah Utara',
  ],
  'Kalimantan Barat': [
    'Pontianak',
    'Singkawang',
    'Bengkayang',
    'Kapuas Hulu',
    'Kayong Utara',
    'Ketapang',
    'Kubu Raya',
    'Landak',
    'Melawi',
    'Mempawah',
    'Sambas',
    'Sanggau',
    'Sekadau',
    'Sintang',
  ],
  'Kalimantan Tengah': [
    'Palangka Raya',
    'Barito Selatan',
    'Barito Timur',
    'Barito Utara',
    'Gunung Mas',
    'Kapuas',
    'Katingan',
    'Kotawaringin Barat',
    'Kotawaringin Timur',
    'Lamandau',
    'Murung Raya',
    'Pulang Pisau',
    'Sukamara',
    'Seruyan',
  ],
  'Kalimantan Selatan': [
    'Banjarbaru',
    'Banjarmasin',
    'Balangan',
    'Banjar',
    'Barito Kuala',
    'Hulu Sungai Selatan',
    'Hulu Sungai Tengah',
    'Hulu Sungai Utara',
    'Kotabaru',
    'Tabalong',
    'Tanah Bumbu',
    'Tanah Laut',
    'Tapin',
  ],
  'Kalimantan Timur': [
    'Balikpapan',
    'Bontang',
    'Samarinda',
    'Berau',
    'Kutai Barat',
    'Kutai Kartanegara',
    'Kutai Timur',
    'Mahakam Ulu',
    'Paser',
    'Penajam Paser Utara',
  ],
  'Kalimantan Utara': [
    'Tarakan',
    'Bulungan',
    'Malinau',
    'Nunukan',
    'Tana Tidung',
  ],
  'Sulawesi Utara': [
    'Bitung',
    'Kotamobagu',
    'Manado',
    'Tomohon',
    'Bolaang Mongondow',
    'Bolaang Mongondow Selatan',
    'Bolaang Mongondow Timur',
    'Bolaang Mongondow Utara',
    'Kepulauan Sangihe',
    'Kepulauan Sitaro',
    'Kepulauan Talaud',
    'Minahasa',
    'Minahasa Selatan',
    'Minahasa Tenggara',
    'Minahasa Utara',
  ],
  Gorontalo: [
    'Gorontalo',
    'Boalemo',
    'Bone Bolango',
    'Gorontalo',
    'Gorontalo Utara',
    'Pohuwato',
  ],
  'Sulawesi Tengah': [
    'Palu',
    'Banggai',
    'Banggai Kepulauan',
    'Banggai Laut',
    'Buol',
    'Donggala',
    'Morowali',
    'Morowali Utara',
    'Parigi Moutong',
    'Poso',
    'Sigi',
    'Tojo Una-Una',
    'Tolitoli',
  ],
  'Sulawesi Barat': [
    'Majene',
    'Mamasa',
    'Mamuju',
    'Mamuju Tengah',
    'Pasangkayu',
    'Polewali Mandar',
  ],
  'Sulawesi Selatan': [
    'Makassar',
    'Palopo',
    'Parepare',
    'Bantaeng',
    'Barru',
    'Bone',
    'Bulukumba',
    'Enrekang',
    'Gowa',
    'Jeneponto',
    'Kepulauan Selayar',
    'Luwu',
    'Luwu Timur',
    'Luwu Utara',
    'Maros',
    'Pangkajene dan Kepulauan',
    'Pinrang',
    'Sidenreng Rappang',
    'Sinjai',
    'Soppeng',
    'Takalar',
    'Tana Toraja',
    'Toraja Utara',
    'Wajo',
  ],
  'Sulawesi Tenggara': [
    'Bau-Bau',
    'Kendari',
    'Bombana',
    'Buton',
    'Buton Selatan',
    'Buton Tengah',
    'Buton Utara',
    'Kolaka',
    'Kolaka Timur',
    'Kolaka Utara',
    'Konawe',
    'Konawe Kepulauan',
    'Konawe Selatan',
    'Konawe Utara',
    'Muna',
    'Muna Barat',
    'Wakatobi',
  ],
  Maluku: [
    'Ambon',
    'Tual',
    'Buru',
    'Buru Selatan',
    'Kepulauan Aru',
    'Maluku Barat Daya',
    'Maluku Tengah',
    'Maluku Tenggara',
    'Maluku Tenggara Barat',
    'Seram Bagian Barat',
    'Seram Bagian Timur',
  ],
  'Maluku Utara': [
    'Ternate',
    'Tidore Kepulauan',
    'Halmahera Barat',
    'Halmahera Tengah',
    'Halmahera Timur',
    'Halmahera Utara',
    'Kepulauan Sula',
    'Pulau Morotai',
    'Pulau Taliabu',
    'Halmahera Selatan',
  ],
  Papua: [
    'Jayapura',
    'Asmat',
    'Biak Numfor',
    'Boven Digoel',
    'Jayapura',
    'Jayawijaya',
    'Keerom',
    'Kepulauan Yapen',
    'Lanny Jaya',
    'Mamberamo Raya',
    'Mamberamo Tengah',
    'Mappi',
    'Merauke',
    'Mimika',
    'Nabire',
    'Nduga',
    'Paniai',
    'Pegunungan Bintang',
    'Puncak',
    'Puncak Jaya',
    'Sarmi',
    'Supiori',
    'Tolikara',
    'Waropen',
    'Yahukimo',
    'Yalimo',
  ],
  'Papua Barat': [
    'Sorong',
    'Fakfak',
    'Kaimana',
    'Manokwari',
    'Manokwari Selatan',
    'Maybrat',
    'Pegunungan Arfak',
    'Raja Ampat',
    'Sorong',
    'Sorong Selatan',
    'Tambrauw',
    'Teluk Bintuni',
    'Teluk Wondama',
  ],
  'Papua Selatan': ['Merauke', 'Boven Digoel', 'Mappi', 'Asmat'],
  'Papua Tengah': [
    'Mimika',
    'Nabire',
    'Paniai',
    'Deiyai',
    'Dogiyai',
    'Intan Jaya',
  ],
  'Papua Pegunungan': [
    'Jayawijaya',
    'Lanny Jaya',
    'Mamberamo Tengah',
    'Nduga',
    'Pegunungan Bintang',
    'Tolikara',
    'Yahukimo',
    'Yalimo',
  ],
  'Papua Barat Daya': [
    'Sorong',
    'Maybrat',
    'Sorong Selatan',
    'Tambrauw',
    'Raja Ampat',
  ],
};

const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

export default function ProductOrderDetailFormScreen({ navigation, route }) {
  // Get product data from navigation params
  const { product, actionType } = route.params || {};

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [community, setCommunity] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [postal, setPostal] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // Add current user state

  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  // Fetch user profile data on component mount
  useEffect(() => {
    const isLoggedIn = ApiService.isLoggedIn();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // First try to get current user data (which is already available locally)
      const currentUser = await ApiService.getCurrentUser();

      if (currentUser) {
        // Store current user for userId
        setCurrentUser(currentUser);

        // Auto-fill form fields with current user data
        if (currentUser.firstName) {
          setFirstName(currentUser.firstName);
        }
        if (currentUser.lastName) {
          setLastName(currentUser.lastName);
        }
        if (currentUser.community) {
          setCommunity(currentUser.community);
        }

        return;
      }

      // Fallback: try getUserProfile method
      const result = await ApiService.getUserProfile();

      if (result.success && result.data) {
        // Auto-fill form fields with profile data
        if (result.data.firstName) {
          setFirstName(result.data.firstName);
        }
        if (result.data.lastName) {
          setLastName(result.data.lastName);
        }
        if (result.data.community) {
          setCommunity(result.data.community);
        }
      } else {
        // Demo data for testing when no user is logged in
        setFirstName('John');
        setLastName('Doe');
        setCommunity('Demo Community');
      }
    } catch (error) {
      // Continue without auto-fill if profile fetch fails
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Detail Form</Text>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 18 }}>
          {/* Nama Depan */}
          <Text style={styles.label}>Nama Depan</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nama Depan"
            placeholderTextColor="#bbb"
          />

          {/* Nama Belakang */}
          <Text style={styles.label}>Nama Belakang</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nama Belakang"
            placeholderTextColor="#bbb"
          />

          {/* Nama Komunitas */}
          <Text style={styles.label}>Nama Komunitas</Text>
          <TextInput
            style={styles.input}
            value={community}
            onChangeText={setCommunity}
            placeholder="Nama Komunitas"
            placeholderTextColor="#bbb"
          />

          {/* Provinsi */}
          <Text style={styles.label}>Provinsi</Text>
          <TouchableOpacity
            style={styles.input}
            activeOpacity={0.7}
            onPress={() => setShowProvinceModal(true)}
          >
            <Text
              style={{
                color: province ? '#222' : '#bbb',
                fontSize: 17,
              }}
            >
              {province || 'Pilih provinsi'}
            </Text>
            <Text
              style={{ position: 'absolute', right: 18, fontSize: 18, top: 6 }}
            >
              <ArrowDown />
            </Text>
          </TouchableOpacity>

          {/* Kota/Kabupaten */}
          <Text style={styles.label}>Kota/Kabupaten</Text>
          <TouchableOpacity
            style={styles.input}
            activeOpacity={0.7}
            onPress={() => province && setShowCityModal(true)}
            disabled={!province}
          >
            <Text
              style={{
                color: city ? '#222' : '#bbb',
                fontSize: 17,
              }}
            >
              {city || 'Pilih kota/kabupaten'}
            </Text>
            <Text
              style={{ position: 'absolute', right: 18, fontSize: 18, top: 6 }}
            >
              <ArrowDown />
            </Text>
          </TouchableOpacity>

          {/* Nomor Telepon */}
          <Text style={styles.label}>Nomor telepon</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nomor telepon"
            keyboardType="phone-pad"
            placeholderTextColor="#bbb"
          />

          {/* Kode Pos */}
          <Text style={styles.label}>Kode Pos</Text>
          <TextInput
            style={styles.input}
            value={postal}
            onChangeText={setPostal}
            placeholder="Kode Pos"
            keyboardType="number-pad"
            placeholderTextColor="#bbb"
          />

          {/* Button */}
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              // Validate form data
              if (
                !firstName ||
                !lastName ||
                !province ||
                !city ||
                !phone ||
                !postal
              ) {
                alert('Mohon lengkapi semua data yang diperlukan');
                return;
              }

              // Prepare customer data
              const customerData = {
                userId: currentUser?.id, // Add userId for chat functionality
                firstName,
                lastName,
                email: currentUser?.email, // Add email from current user
                community,
                province,
                city,
                phone,
                postal,
              };

              // Navigate to PaymentMethodScreen with data
              navigation?.navigate('PaymentMethodScreen', {
                customerData,
                product,
                actionType,
              });
            }}
          >
            <Text style={styles.nextBtnText}>Selanjutnya</Text>
          </TouchableOpacity>
        </View>

        {/* Modal Provinsi */}
        <Modal visible={showProvinceModal} transparent animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowProvinceModal(false)}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <FlatList
                data={provinces}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setProvince(item);
                      setCity('');
                      setShowProvinceModal(false);
                    }}
                  >
                    <Text style={styles.modalText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Kota */}
        <Modal visible={showCityModal} transparent animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowCityModal(false)}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <FlatList
                data={province ? cities[province] : []}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setCity(item);
                      setShowCityModal(false);
                    }}
                  >
                    <Text style={styles.modalText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 24,
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 12,
    marginTop: -6,
  },
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 24,
    color: '#1976D2',
    marginLeft: 10,
    flex: 1,
  },
  label: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    color: '#000000',
    marginTop: 18,
    marginBottom: 7,
  },
  input: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 17,
    color: '#222',
    backgroundColor: '#fff',
    marginBottom: 0,
    marginTop: 0,
    marginBottom: 0,
    position: 'relative',
  },
  nextBtn: {
    backgroundColor: '#0070D8',
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 30,
    marginBottom: 40,
    width: '70%',
    alignSelf: 'center',
  },
  nextBtnText: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    color: '#fff',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    maxHeight: 400,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  modalItem: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 17,
    color: '#222',
  },
});
