// Temporarily disable Firebase auth to fix app startup issues
// import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ApiService from './api';

// Configure Google Sign In (without Firebase Authentication for now)
GoogleSignin.configure({
  webClientId: '568073459500-rhngllmuujsmikn28dmvtiun42et0unm.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

class GoogleAuthService {
  
  // Alias untuk kemudahan penggunaan
  async signIn() {
    return await this.signInWithGoogle();
  }
  
  async signInWithGoogle() {
    try {
      console.log('🔄 Starting Google Sign-In (without Firebase Auth)...');

      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('✅ Google Play Services available');

      // Get the users ID token and user info
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful, got user info');

      // Prepare user data for backend sync (using Google ID instead of Firebase UID)
      const userData = {
        uid: userInfo.user.id, // Google ID (since Firebase auth is disabled)
        email: userInfo.user.email,
        displayName: userInfo.user.name,
        photoURL: userInfo.user.photo,
        provider: 'google',
        firstName: userInfo.user.givenName || userInfo.user.name?.split(' ')[0] || 'User',
        lastName: userInfo.user.familyName || userInfo.user.name?.split(' ').slice(1).join(' ') || '',
        idToken: userInfo.idToken,
      };
      
      console.log('🔄 Syncing Firebase user to backend...');
      
      // Send Firebase user data to backend
      const backendUser = await this.syncUserToBackend(userData);
      
      console.log('✅ Firebase user synced to backend successfully');
      
      return {
        success: true,
        user: {
          uid: firebaseUser.user.uid,
          email: firebaseUser.user.email,
          name: firebaseUser.user.displayName,
          firstName: userData.firstName,
          lastName: userData.lastName,
          photoURL: firebaseUser.user.photoURL,
          provider: 'google'
        },
        firebaseUser: firebaseUser.user,
        backendUser: backendUser,
        token: backendUser.token
      };
      
    } catch (error) {
      console.error('❌ Firebase Google Sign-In Error:', error);
      
      // Enhanced error handling with Firebase Auth focus
      if (error.code === 'DEVELOPER_ERROR' || error.message?.includes('DEVELOPER_ERROR')) {
        console.log('⚠️ DEVELOPER_ERROR detected - SHA-1 configuration issue');
        console.log('🔧 This error will be resolved when SHA-1 is added to Firebase Console');
        
        // Fallback: Direct Google Sign-In (tanpa Firebase Auth) hanya sebagai temporary
        try {
          console.log('🔄 Using temporary direct Google Sign-In...');
          
          // Reconfigure untuk direct Google Sign-In  
          await GoogleSignin.configure({
            scopes: ['email', 'profile'],
            offlineAccess: false,
          });
          
          // Direct Google Sign-In (bypass Firebase sementara)
          const userInfo = await GoogleSignin.signIn();
          console.log('✅ Direct Google Sign-In successful:', userInfo.user.email);
          
          // Prepare user data for backend (tandai sebagai temporary)
          const userData = {
            googleUid: userInfo.user.id, // Gunakan Google UID langsung
            email: userInfo.user.email,
            displayName: userInfo.user.name,
            photoURL: userInfo.user.photo,
            provider: 'google',
            firstName: userInfo.user.givenName || 'User',
            lastName: userInfo.user.familyName || '',
          };
          
          // Sync to backend
          const backendUser = await this.syncUserToBackend(userData);
          
          console.log('⚠️ NOTE: Using temporary method. Add SHA-1 to Firebase for full Firebase Auth');
          
          return {
            success: true,
            user: {
              uid: userInfo.user.id, // Temporary: gunakan Google ID
              email: userInfo.user.email,
              name: userInfo.user.name,
              firstName: userData.firstName,
              lastName: userData.lastName,
              photoURL: userInfo.user.photo,
              provider: 'google'
            },
            backendUser: backendUser,
            token: backendUser.token,
            method: 'temporary_direct', // Flag temporary method
            note: 'Temporary method used. Please add SHA-1 to Firebase Console for full Firebase Authentication.'
          };
          
        } catch (retryError) {
          console.error('❌ Temporary method also failed:', retryError);
          return {
            success: false,
            error: 'Google Sign-In unavailable. Please add SHA-1 to Firebase Console or use email/password login.'
          };
        }
        
      } else if (error.code === '12501') {
        // User cancelled the sign-in process
        return {
          success: false,
          error: 'Sign-in was cancelled by user.'
        };
      } else if (error.code === '7') {
        // Network error
        return {
          success: false,
          error: 'Network error. Please check your internet connection.'
        };
      } else {
        return {
          success: false,
          error: `Firebase Google Sign-In failed: ${error.message || error}`
        };
      }
    }
  }
  
  async syncUserToBackend(userData) {
    try {
      const response = await ApiService.post('/auth/google-signin', userData);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to sync user to backend');
      }
      
    } catch (error) {
      console.error('❌ Backend sync error:', error);
      throw new Error(`Backend sync failed: ${error.message}`);
    }
  }
  
  async signOut() {
    try {
      console.log('🔄 Signing out...');
      
      // Sign out from Google
      await GoogleSignin.signOut();
      
      // Sign out from Firebase
      await auth().signOut();
      
      console.log('✅ Sign out successful');
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }
  
  getCurrentUser() {
    return auth().currentUser;
  }
  
  async checkGooglePlayServices() {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      return true;
    } catch (error) {
      console.error('Google Play Services not available:', error);
      return false;
    }
  }
  
  // Get current signed in user
  async getCurrentGoogleUser() {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo;
    } catch (error) {
      console.log('No Google user currently signed in');
      return null;
    }
  }
  
  // Check if user is signed in
  async isSignedIn() {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      return isSignedIn;
    } catch (error) {
      console.error('Error checking sign in status:', error);
      return false;
    }
  }
  
  // Reset configuration to use Firebase Auth (setelah SHA-1 diperbaiki)
  async resetToFirebaseAuth() {
    try {
      console.log('🔄 Resetting to Firebase Authentication...');
      
      // Sign out dari any existing session
      await this.signOut();
      
      // Reconfigure dengan Firebase webClientId
      GoogleSignin.configure({
        webClientId: '568073459500-rhngllmuujsmikn28dmvtiun42et0unm.apps.googleusercontent.com',
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
      
      console.log('✅ Google Sign-In reconfigured for Firebase Auth');
      console.log('🔥 Ready to use full Firebase Authentication');
      
      return { success: true, message: 'Firebase Auth configuration restored' };
      
    } catch (error) {
      console.error('❌ Failed to reset to Firebase Auth:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Reset Google Sign-In configuration (for troubleshooting)
  async resetConfiguration() {
    try {
      console.log('🔄 Resetting Google Sign-In configuration...');
      
      // Sign out first
      await GoogleSignin.signOut();
      
      // Reconfigure dengan settings default
      GoogleSignin.configure({
        webClientId: '568073459500-rhngllmuujsmikn28dmvtiun42et0unm.apps.googleusercontent.com',
        offlineAccess: true,
        forceCodeForRefreshToken: true,
        forceCodeForRefreshToken: false,
      });
      
      console.log('✅ Google Sign-In configuration reset successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to reset Google Sign-In configuration:', error);
      return false;
    }
  }
}

export default new GoogleAuthService();
