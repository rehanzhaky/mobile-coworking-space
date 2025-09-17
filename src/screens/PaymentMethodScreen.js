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
  Animated,
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

// Sub-options untuk setiap kategori payment method
const ewalletOptions = [
  { id: 'gopay', label: 'GoPay', midtransType: 'gopay', description: 'Bayar dengan GoPay' },
  { id: 'shopeepay', label: 'ShopeePay', midtransType: 'shopeepay', description: 'Bayar dengan ShopeePay' },
  { id: 'dana', label: 'DANA', midtransType: 'dana', description: 'Bayar dengan DANA' },
];

const creditCardOptions = [
  { id: 'add_card', label: 'Tambahkan Kartu', midtransType: 'credit_card', description: 'Visa, Mastercard, JCB' },
];

const bankTransferOptions = [
  { id: 'bca', label: 'BCA Virtual Account', midtransType: 'bca_va', description: 'Transfer via BCA Virtual Account' },
  { id: 'bni', label: 'BNI Virtual Account', midtransType: 'bni_va', description: 'Transfer via BNI Virtual Account' },
  { id: 'bri', label: 'BRI Virtual Account', midtransType: 'bri_va', description: 'Transfer via BRI Virtual Account' },
  { id: 'mandiri', label: 'Mandiri Bill Payment', midtransType: 'echannel', description: 'Transfer via Mandiri Bill Payment' },
  { id: 'permata', label: 'Permata Virtual Account', midtransType: 'permata_va', description: 'Transfer via Permata Virtual Account' },
];

const paymentOptions = [
  {
    id: 'ewallet',
    label: 'E-Wallet',
    icon: EWalletIcon,
    midtransType: 'ewallet',
    subOptions: ewalletOptions,
  },
  {
    id: 'credit_card',
    label: 'Kartu Kredit/Debit',
    icon: CardIcon,
    midtransType: 'credit_card',
    subOptions: creditCardOptions,
  },
  {
    id: 'bank_transfer',
    label: 'Transfer Bank',
    icon: BankIcon,
    midtransType: 'bank_transfer',
    subOptions: bankTransferOptions,
  },
];

export default function PaymentMethodScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null); // Main category selection
  const [selectedSub, setSelectedSub] = useState(null); // Sub-option selection
  const [expandedCategory, setExpandedCategory] = useState(null); // Which category is expanded
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
            const isExpanded = expandedCategory === opt.id;
            const isSelected = selected === opt.id;

            return (
              <View key={opt.id} style={styles.categoryContainer}>
                {/* Main Category Option */}
                <TouchableOpacity
                  style={[
                    styles.optionBox,
                    isSelected && styles.optionBoxActive,
                    !isAvailable && styles.optionBoxDisabled,
                  ]}
                  activeOpacity={isAvailable ? 0.7 : 1}
                  onPress={() => {
                    if (!isAvailable) return;
                    
                    if (isExpanded) {
                      // Collapse if already expanded
                      setExpandedCategory(null);
                      setSelected(null);
                      setSelectedSub(null);
                    } else {
                      // Expand this category
                      setExpandedCategory(opt.id);
                      setSelected(opt.id);
                      setSelectedSub(null);
                    }
                  }}
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
                      {/* <Text
                        style={[
                          styles.optionDescription,
                          !isAvailable && styles.disabledText,
                        ]}
                      >
                        {opt.description}
                      </Text> */}
                      {!isAvailable && (
                        <Text style={styles.unavailableText}>Tidak tersedia</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.expandIndicator}>
                    <Image
                      source={require('./assets/arrow-down.png')}
                      style={[
                        styles.expandIcon,
                        isExpanded && styles.expandIconRotated
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                {/* Sub-options Dropdown */}
                {isExpanded && (
                  <View style={styles.subOptionsContainer}>
                    {opt.subOptions.map((subOpt, index) => (
                      <TouchableOpacity
                        key={subOpt.id}
                        style={[
                          styles.subOptionBox,
                          selectedSub === subOpt.id && styles.subOptionBoxActive,
                          index === opt.subOptions.length - 1 && styles.subOptionBoxLast
                        ]}
                        onPress={() => setSelectedSub(subOpt.id)}
                      >
                        <View style={styles.subOptionContent}>
                          <Text style={styles.subOptionLabel}>{subOpt.label}</Text>
                          <Text style={styles.subOptionDescription}>{subOpt.description}</Text>
                        </View>
                        <View
                          style={[
                            styles.radio,
                            selectedSub === subOpt.id && styles.radioActive,
                          ]}
                        >
                          {selectedSub === subOpt.id && <View style={styles.radioInner} />}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.nextBtn, 
            (loading || !selectedSub) && styles.nextBtnDisabled
          ]}
          activeOpacity={0.8}
          disabled={loading || !selectedSub}
          onPress={() => {
            if (loading || !selectedSub) return;

            setLoading(true);

            // Get selected payment method details
            const selectedCategory = paymentOptions.find(
              option => option.id === selected,
            );

            const selectedSubOption = selectedCategory?.subOptions.find(
              subOpt => subOpt.id === selectedSub
            );

            // Prepare payment data with specific Midtrans type
            const paymentData = {
              method: selected, // Main category (ewallet, credit_card, bank_transfer)
              subMethod: selectedSub, // Specific method (gopay, bca, etc.)
              midtransType: selectedSubOption?.midtransType, // Specific Midtrans payment type
              label: selectedSubOption?.label || 'Unknown',
              description: selectedSubOption?.description,
              categoryLabel: selectedCategory?.label,
              details: {
                enabled_payments: [selectedSubOption?.midtransType],
              },
            };

            console.log('🎯 Selected Payment Method:', paymentData);

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
    paddingVertical: 14,
    marginBottom: 10,
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
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 18,
    color: '#17203A',
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
  // New styles for dropdown functionality
  categoryContainer: {
    marginBottom: 24,
  },
  expandIndicator: {
    marginLeft: 10,
  },
  expandIcon: {
    width: 16,
    height: 16,
    tintColor: '#666',
    transform: [{ rotate: '0deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  subOptionsContainer: {
    marginTop: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
  },
  subOptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  subOptionBoxActive: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#0070D8',
  },
  subOptionBoxLast: {
    borderBottomWidth: 0,
  },
  subOptionContent: {
    flex: 1,
    marginLeft: 8,
  },
  subOptionLabel: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    color: '#17203A',
    marginBottom: 2,
  },
  subOptionDescription: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 12,
    color: '#666',
  },
});
