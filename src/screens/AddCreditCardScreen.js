import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView
} from 'react-native';

export default function AddCreditCardScreen({ navigation }) {
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backBtn}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Tambah Kartu</Text>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
          {/* Nama di kartu */}
          <TextInput
            style={styles.input}
            placeholder="Nama di kartu"
            placeholderTextColor="#888"
            value={nameOnCard}
            onChangeText={setNameOnCard}
          />

          {/* Nomor Kartu */}
          <TextInput
            style={styles.input}
            placeholder="Nomor Kartu"
            placeholderTextColor="#888"
            keyboardType="number-pad"
            value={cardNumber}
            onChangeText={setCardNumber}
            maxLength={19}
          />

          {/* Expiry */}
          <TextInput
            style={styles.input}
            placeholder="Tanggal Kedaluwarsa (BB/TT)"
            placeholderTextColor="#888"
            value={expiry}
            onChangeText={setExpiry}
            maxLength={5}
          />

          {/* CVV */}
          <TextInput
            style={styles.input}
            placeholder="CVV"
            placeholderTextColor="#888"
            keyboardType="number-pad"
            value={cvv}
            onChangeText={setCvv}
            maxLength={4}
          />

          {/* Alamat Tagihan */}
          <Text style={styles.sectionTitle}>Alamat Tagihan</Text>

          {/* Alamat */}
          <TextInput
            style={styles.input}
            placeholder="Alamat"
            placeholderTextColor="#888"
            value={billingAddress}
            onChangeText={setBillingAddress}
          />

          {/* Kode Pos */}
          <TextInput
            style={styles.input}
            placeholder="Kode Pos"
            placeholderTextColor="#888"
            keyboardType="number-pad"
            value={postalCode}
            onChangeText={setPostalCode}
            maxLength={8}
          />

          {/* Tombol Simpan */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              // Simpan kartu, lalu kembali atau lanjut ke proses berikutnya
              // navigation.goBack();
            }}
          >
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
    marginTop: 34,
    marginBottom: 10,
    paddingHorizontal: 24
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 12,
    marginTop: -6
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center'
  },
  input: {
    borderWidth: 2,
    borderColor: '#222',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 18,
    color: '#222',
    backgroundColor: '#fff',
    marginBottom: 19,
    marginTop: 0
  },
  sectionTitle: {
    color: '#1976D2',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 8
  },
  saveBtn: {
    backgroundColor: '#0072DF',
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 24,
    marginBottom: 40,
    width: '70%',
    alignSelf: 'center'
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  }
});