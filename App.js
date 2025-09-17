/**
 * Mobile Co-Working Space App
 * React Native Navigation App
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import Safe Firebase Service
import FirebaseService from './src/config/firebase_safe';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import GoogleLoginScreen from './src/screens/GoogleLoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import AboutAppScreen from './src/screens/AboutAppScreen';
import MyReviewsScreen from './src/screens/MyReviewsScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ProductOrderDetailFormScreen from './src/screens/ProductOrderDetailFormScreen';
import PaymentMethodScreen from './src/screens/PaymentMethodScreen';
import CheckoutDetailScreen from './src/screens/CheckoutDetailScreen_new';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';
import MidtransWebViewScreen from './src/screens/MidtransWebViewScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import ReviewProductScreen from './src/screens/ReviewProductScreen';
import FirebaseTestScreen from './src/screens/FirebaseTestScreen';

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // Initialize Firebase when app starts (with error handling)
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('🔧 Initializing Firebase in App.js...');
        const result = await FirebaseService.initialize();
        if (result) {
          console.log('✅ Firebase initialized successfully in App.js');
        } else {
          console.log('⚠️ Firebase initialization completed with warnings');
        }
      } catch (error) {
        console.error('❌ Firebase initialization failed in App.js:', error);
        console.log('🔧 App will continue without Firebase features');
        // Don't crash the app if Firebase fails
      }
    };

    // Delay Firebase initialization to ensure app is fully loaded
    setTimeout(() => {
      initializeFirebase();
    }, 1000);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen 
            name="GoogleLogin" 
            component={GoogleLoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
          />
          <Stack.Screen name="CatalogScreen" component={CatalogScreen} />
          <Stack.Screen
            name="ProductDetailScreen"
            component={ProductDetailScreen}
          />
          <Stack.Screen
            name="ProductOrderDetailFormScreen"
            component={ProductOrderDetailFormScreen}
          />
          <Stack.Screen
            name="PaymentMethodScreen"
            component={PaymentMethodScreen}
          />
          <Stack.Screen
            name="CheckoutDetailScreen"
            component={CheckoutDetailScreen}
          />
          <Stack.Screen
            name="PaymentSuccessScreen"
            component={PaymentSuccessScreen}
          />
          <Stack.Screen
            name="FirebaseTestScreen"
            component={FirebaseTestScreen}
          />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="MyOrdersScreen" component={MyOrdersScreen} />
          <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
          <Stack.Screen name="InvoiceScreen" component={InvoiceScreen} />
          <Stack.Screen name="ReviewProductScreen" component={ReviewProductScreen} />
          <Stack.Screen name="AboutAppScreen" component={AboutAppScreen} />
          <Stack.Screen name="MyReviewsScreen" component={MyReviewsScreen} />
          <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen} />
          <Stack.Screen
            name="EditProfileScreen"
            component={EditProfileScreen}
          />
          <Stack.Screen
            name="MidtransWebViewScreen"
            component={MidtransWebViewScreen}
            options={{
              headerShown: false,
              gestureEnabled: false
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
