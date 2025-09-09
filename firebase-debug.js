// Firebase Debug Script - Jalankan ini untuk mengecek status Firebase

import { Platform } from 'react-native';

console.log('🔍 FIREBASE DEBUG INFORMATION');
console.log('=====================================');

// 1. Check Platform
console.log('📱 Platform:', Platform.OS);

// 2. Check if Firebase packages are available
console.log('\n📦 CHECKING FIREBASE PACKAGES:');

try {
  const firebaseApp = require('@react-native-firebase/app');
  console.log('✅ @react-native-firebase/app: FOUND');
  console.log('   Version:', firebaseApp.default.SDK_VERSION || 'Unknown');
} catch (error) {
  console.log('❌ @react-native-firebase/app: NOT FOUND');
  console.log('   Error:', error.message);
}

try {
  const firebaseMessaging = require('@react-native-firebase/messaging');
  console.log('✅ @react-native-firebase/messaging: FOUND');
} catch (error) {
  console.log('❌ @react-native-firebase/messaging: NOT FOUND');
  console.log('   Error:', error.message);
}

// 3. Check Firebase App initialization
console.log('\n🔥 CHECKING FIREBASE APP:');

try {
  const firebase = require('@react-native-firebase/app').default;
  console.log('✅ Firebase imported successfully');

  if (firebase.apps && firebase.apps.length > 0) {
    console.log('✅ Firebase apps initialized:', firebase.apps.length);
    firebase.apps.forEach((app, index) => {
      console.log(
        `   App ${index + 1}: ${app.name} (${app.options.projectId})`,
      );
    });
  } else {
    console.log('❌ No Firebase apps initialized');
    console.log(
      '   This means google-services.json is not properly configured',
    );
  }
} catch (error) {
  console.log('❌ Firebase initialization error:', error.message);
}

// 4. Check configuration files
console.log('\n📄 CONFIGURATION FILES STATUS:');

if (Platform.OS === 'android') {
  console.log('📁 Expected: android/app/google-services.json');
  console.log(
    '   Status: Please verify this file contains REAL values (not placeholders)',
  );
} else {
  console.log('📁 Expected: ios/[AppName]/GoogleService-Info.plist');
  console.log(
    '   Status: Please verify this file contains REAL values (not placeholders)',
  );
}

// 5. Check what needs to be done
console.log('\n🔧 WHAT TO DO TO FIX:');
console.log(
  '1. Create Firebase project at https://console.firebase.google.com/',
);
console.log('2. Add Android/iOS app to your Firebase project');
console.log('3. Download REAL google-services.json (not placeholder)');
console.log('4. Replace the current file with downloaded file');
console.log('5. Rebuild the app: npx react-native run-android');

console.log('\n📝 CURRENT CONFIG FILE SAMPLE:');
console.log("If your google-services.json looks like this, it's PLACEHOLDER:");
console.log('{');
console.log('  "project_info": {');
console.log('    "project_number": "YOUR_PROJECT_NUMBER",  <- FAKE');
console.log('    "project_id": "co-working-space-d8c34"');
console.log('  }');
console.log('}');
console.log('\nReal file should have actual numbers and IDs!');

export default function FirebaseDebug() {
  return null; // This is just a debug script
}
