const fs = require('fs');
const path = require('path');

console.log('🔍 FIREBASE CONFIGURATION VALIDATOR');
console.log('=====================================\n');

// Check Android configuration
const androidConfigPath = path.join(
  __dirname,
  'android',
  'app',
  'google-services.json',
);
const iosConfigPath = path.join(
  __dirname,
  'ios',
  'mobile_coworking_space',
  'GoogleService-Info.plist',
);

function validateAndroidConfig() {
  console.log('📱 CHECKING ANDROID CONFIGURATION:');

  if (!fs.existsSync(androidConfigPath)) {
    console.log('❌ google-services.json NOT FOUND at:', androidConfigPath);
    return false;
  }

  try {
    const configContent = fs.readFileSync(androidConfigPath, 'utf8');
    const config = JSON.parse(configContent);

    console.log('✅ google-services.json found and valid JSON');

    // Check for placeholder values
    const placeholders = [
      'YOUR_PROJECT_NUMBER',
      'YOUR_APP_ID',
      'YOUR_CLIENT_ID',
      'YOUR_API_KEY',
    ];

    const hasPlaceholders = placeholders.some(placeholder =>
      configContent.includes(placeholder),
    );

    if (hasPlaceholders) {
      console.log('❌ CONTAINS PLACEHOLDER VALUES!');
      console.log(
        '   File masih menggunakan template, bukan data real dari Firebase Console',
      );
      console.log('   Project Number:', config.project_info?.project_number);
      console.log('   Project ID:', config.project_info?.project_id);
      return false;
    }

    // Check required fields
    if (
      !config.project_info?.project_number ||
      !config.project_info?.project_id ||
      !config.client?.[0]?.client_info?.mobilesdk_app_id
    ) {
      console.log('❌ MISSING REQUIRED FIELDS');
      return false;
    }

    // Check if values look real (numeric project_number, proper IDs)
    const projectNumber = config.project_info.project_number;
    if (!/^\d+$/.test(projectNumber)) {
      console.log('❌ Project number is not numeric:', projectNumber);
      return false;
    }

    console.log('✅ CONFIGURATION VALID!');
    console.log('   Project Number:', projectNumber);
    console.log('   Project ID:', config.project_info.project_id);
    console.log(
      '   Package Name:',
      config.client[0]?.client_info?.android_client_info?.package_name,
    );

    return true;
  } catch (error) {
    console.log('❌ ERROR reading configuration:', error.message);
    return false;
  }
}

function validateiOSConfig() {
  console.log('\n🍎 CHECKING iOS CONFIGURATION:');

  if (!fs.existsSync(iosConfigPath)) {
    console.log('❌ GoogleService-Info.plist NOT FOUND at:', iosConfigPath);
    return false;
  }

  try {
    const configContent = fs.readFileSync(iosConfigPath, 'utf8');

    // Check for placeholder values
    const placeholders = [
      'YOUR_CLIENT_ID',
      'YOUR_API_KEY',
      'YOUR_PROJECT_NUMBER',
    ];

    const hasPlaceholders = placeholders.some(placeholder =>
      configContent.includes(placeholder),
    );

    if (hasPlaceholders) {
      console.log('❌ CONTAINS PLACEHOLDER VALUES!');
      console.log(
        '   File masih menggunakan template, bukan data real dari Firebase Console',
      );
      return false;
    }

    console.log('✅ GoogleService-Info.plist looks valid');
    return true;
  } catch (error) {
    console.log('❌ ERROR reading iOS configuration:', error.message);
    return false;
  }
}

// Run validation
const androidValid = validateAndroidConfig();
const iosValid = validateiOSConfig();

console.log('\n📋 SUMMARY:');
console.log('===========');
console.log('Android Config:', androidValid ? '✅ VALID' : '❌ INVALID');
console.log('iOS Config:', iosValid ? '✅ VALID' : '❌ INVALID');

if (!androidValid || !iosValid) {
  console.log('\n🔧 TO FIX:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Create/select your project');
  console.log(
    '3. Add Android app with package name: com.mobile_coworking_space',
  );
  console.log('4. Download the REAL google-services.json');
  console.log(
    '5. Replace android/app/google-services.json with downloaded file',
  );
  console.log('6. Rebuild app: npx react-native run-android');
} else {
  console.log('\n🎉 Firebase configuration is ready!');
  console.log('Rebuild your app to activate Firebase.');
}
