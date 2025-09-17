import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import ApiService from '../services/api';
import { FontWeight, FontFamily } from '../styles/typography';

const BackIcon = () => (
  <Image
    source={require('./assets/back-icon.png')}
    style={{ width: 24, height: 24 }}
  />
);

const STAR_ON = require('./assets/star-on.png');     // Replace with your yellow star asset
const STAR_OFF = require('./assets/star-off.png');   // Replace with your grey star asset
const PRODUCT_IMAGE = require('./assets/absensi-staff.png'); // Replace with your product image

export default function ReviewProductScreen({ navigation, route }) {
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get data from navigation params
  const orderData = route?.params?.order;
  const productData = route?.params?.product;
  
  // Use dynamic product info or fallback to defaults
  const productInfo = {
    id: productData?.id || orderData?.productId || orderData?.id,
    name: productData?.name || orderData?.title || orderData?.productName || 'Aplikasi Absensi Staf',
    orderId: productData?.orderId || orderData?.orderId || orderData?.orderNumber || 'N/A',
    image: PRODUCT_IMAGE // Could be made dynamic later
  };

  // Minimal validation: rating > 0 dan review minimal 10 karakter
  const isReviewValid = rating > 0 && review.trim().length >= 30;

  // Submit review function
  const submitReview = async () => {
    if (!isReviewValid) {
      Alert.alert('Error', 'Mohon isi rating dan ulasan minimal 30 karakter');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('📝 Submitting review:', {
        productId: productInfo.id,
        orderId: productInfo.orderId,
        rating,
        review: review.trim(),
        reviewLength: review.trim().length
      });

      // Call API to submit review
      const reviewData = {
        productId: productInfo.id,
        productName: productInfo.name,
        orderId: productInfo.orderId,
        rating: rating,
        comment: review.trim(),
        orderData: orderData // Include full order data for backend processing
      };

      console.log('📡 Sending review data to API:', reviewData);
      const response = await ApiService.postSecure('/reviews/submit', reviewData);
      console.log('📡 API response:', response);
      
      if (response.success && response.data.success) {
        Alert.alert(
          'Berhasil!', 
          'Ulasan Anda telah berhasil dikirim. Terima kasih!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to previous screen
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        // Handle API error response
        let errorMessage = 'Gagal mengirim ulasan';
        if (response.error && typeof response.error === 'object' && response.error.message) {
          errorMessage = response.error.message;
        } else if (response.data && response.data.message) {
          errorMessage = response.data.message;
        } else if (typeof response.error === 'string') {
          errorMessage = response.error;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      Alert.alert(
        'Error',
        'Gagal mengirim ulasan. ' + (error.message || 'Silakan coba lagi.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Ulasan Produk dan Layanan</Text>
        </View>

        {/* Product Info */}
        <View style={styles.productRow}>
          <Image source={productInfo.image} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{productInfo.name}</Text>
            {/* <Text style={styles.orderIdText}>Order ID: {productInfo.orderId}</Text> */}
          </View>
        </View>

        {/* Rating */}
        <Text style={styles.label}>Nilai Produk atau Layanan</Text>
        <View style={styles.starsRow}>
          {[1,2,3,4,5].map(idx => (
            <TouchableOpacity key={idx} onPress={() => setRating(idx)}>
              <Image
                source={rating >= idx ? STAR_ON : STAR_OFF}
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Review Text */}
        <Text style={styles.label}>Tuliskan ulasan minimal 30 karakter</Text>
        <View style={styles.textAreaBox}>
          <Text style={styles.textAreaLabel}>Fitur:</Text>
          <Text style={styles.textAreaLabel}>Keunggulan:</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tulis penilaianmu dan bantu pelanggan lain untuk menggunakan produk ini juga"
            placeholderTextColor="#bbb"
            multiline
            value={review}
            onChangeText={setReview}
            numberOfLines={5}
          />
        </View>

        {/* Kirim Button */}
        <TouchableOpacity
          style={[styles.submitBtn, (!isReviewValid || isSubmitting) && {opacity:0.5}]}
          disabled={!isReviewValid || isSubmitting}
          onPress={submitReview}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Kirim</Text>
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
    marginTop: 34,
    marginBottom: 10,
    paddingHorizontal: 18
  },
  backBtn: {
    fontSize: 32,
    color: '#222',
    marginRight: 10,
    marginTop: -6
  },
  title: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    flex: 1,
    fontSize: 23,
    color: '#0070D8',
    textAlign: 'center'
  },
  productRow: {
    flexDirection:'row',
    alignItems:'center',
    marginTop: 18,
    marginBottom: 12,
    marginLeft: 30
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#fff'
  },
  productName: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 22,
    color: '#000'
  },
  productDetails: {
    flex: 1,
  },
  orderIdText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  label: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 18,
    color: '#000',
    marginLeft: 32,
    marginTop: 18,
    marginBottom: 8
  },
  starsRow: {
    flexDirection:'row',
    marginLeft: 32,
    marginBottom: 18
  },
  star: {
    width: 25,
    height: 25,
    marginRight: 7
  },
  textAreaBox: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 28,
    padding: 14,
    backgroundColor: '#fff'
  },
  textAreaLabel: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 17,
    color: '#000',
    fontWeight: '500',
    marginBottom: 1
  },
  textArea: {
    fontFamily: FontFamily.outfit_light,
    fontWeight: FontWeight.light,
    fontSize: 17,
    color: '#000',
    minHeight: 56,
    marginTop: 7
  },
  submitBtn: {
    backgroundColor: '#0070D8',
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 23,
    marginBottom: 30,
    width: '87%',
    alignSelf: 'center'
  },
  submitBtnText: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    color: '#fff',
    fontSize: 22,
    lineHeight: 22,
    lineSpacing: -0.96
  }
});