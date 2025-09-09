import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import ApiService from '../services/api';
import { FontWeight, FontFamily } from '../styles/typography';

const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

// Simple SVG icon replacement with emoji (replace with SVG/Icon in production)
const EWalletIcon = () => (
  <Image
    source={require('./assets/ewallet-icon.png')}
    style={{ width: 20, height: 19 }}
  />
);
const CardIcon = () => (
  <Image
    source={require('./assets/credit-card-icon.png')}
    style={{ width: 20, height: 15 }}
  />
);
const BankIcon = () => (
  <Image
    source={require('./assets/transfer-bank-icon.png')}
    style={{ width: 20, height: 19 }}
  />
);

const paymentOptions = [
  {
    id: 'ewallet',
    label: 'E-Wallet',
    icon: EWalletIcon,
    midtransType: 'ewallet',
    description: 'GoPay, ShopeePay, DANA, OVO, LinkAja',
  },
  {
    id: 'credit_card',
    label: 'Kartu Kredit/Debit',
    icon: CardIcon,
    midtransType: 'credit_card',
    description: 'Visa, Mastercard, JCB',
  },
  {
    id: 'bank_transfer',
    label: 'Transfer Bank',
    icon: BankIcon,
    midtransType: 'bank_transfer',
    description: 'BCA, BNI, BRI, Mandiri, Permata',
  },
];

export default function PaymentMethodScreen({ navigation, route }) {
  const [selected, setSelected] = useState(paymentOptions[0].id);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(null);

  // Get data from previous screen
  const { customerData, product, actionType } = route.params || {};

  // Load available payment methods from Midtrans
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    // Since API is not ready, directly use default methods
    console.log('Loading default payment methods...');
    const result = await ApiService.getMidtransPaymentMethods();
    setPaymentMethods(result.data);
    console.log('Payment methods loaded successfully');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Pembayaran</Text>
        </View>

        <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
          {paymentOptions.map(opt => {
            const isAvailable = paymentMethods
              ? paymentMethods[opt.midtransType]?.enabled
              : true;

            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionBox,
                  selected === opt.id && styles.optionBoxActive,
                  !isAvailable && styles.optionBoxDisabled,
                ]}
                activeOpacity={isAvailable ? 0.7 : 1}
                onPress={() => isAvailable && setSelected(opt.id)}
                disabled={!isAvailable}
              >
                <View style={styles.optionContent}>
                  <opt.icon />
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionLabel,
                        !isAvailable && styles.disabledText,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        !isAvailable && styles.disabledText,
                      ]}
                    >
                      {opt.description}
                    </Text>
                    {!isAvailable && (
                      <Text style={styles.unavailableText}>Tidak tersedia</Text>
                    )}
                  </View>
                </View>
                <View
                  style={[
                    styles.radio,
                    selected === opt.id && styles.radioActive,
                  ]}
                >
                  {selected === opt.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
          activeOpacity={0.8}
          disabled={loading}
          onPress={() => {
            if (loading) return;

            setLoading(true);

            // Get selected payment method details
            const selectedPaymentMethod = paymentOptions.find(
              option => option.id === selected,
            );

            // Prepare payment data with Midtrans specifics
            const paymentData = {
              method: selected,
              midtransType: selectedPaymentMethod?.midtransType,
              label: selectedPaymentMethod?.label || 'Unknown',
              description: selectedPaymentMethod?.description,
              details: {
                enabled_payments: [selectedPaymentMethod?.midtransType],
              },
            };

            // Navigate to CheckoutDetailScreen with all data
            navigation?.navigate('CheckoutDetailScreen', {
              customerData,
              product,
              actionType,
              paymentData,
            });

            setLoading(false);
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.nextBtnText}>Selanjutnya</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 12,
    marginTop: -6,
  },
  title: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 24,
    color: '#0070D8',
    flex: 1,
    textAlign: 'center',
  },
  optionBox: {
    borderWidth: 1,
    borderColor: '#112D4E',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 13,
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  optionBoxActive: {
    borderColor: '#0070D8',
  },
  optionBoxDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontFamily: FontFamily.outfit_,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  optionLabel: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 18,
    color: '#17203A',
    marginBottom: 2,
  },
  optionDescription: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 12,
    color: '#666',
  },
  disabledText: {
    color: '#999',
  },
  unavailableText: {
    fontSize: 12,
    color: '#ff6b6b',
    fontStyle: 'italic',
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#1976D2',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1976D2',
  },
  nextBtn: {
    backgroundColor: '#0070D8',
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 18,
    marginBottom: 40,
    width: '70%',
    alignSelf: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#ccc',
  },
  nextBtnText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    color: '#fff',
    fontSize: 20,
  },
});
