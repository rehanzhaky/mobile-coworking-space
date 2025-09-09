/**
 * Test Firebase Service Import
 */

import FirebaseService from '../config/firebase';

console.log('🧪 Testing Firebase Service import...');
console.log('FirebaseService:', FirebaseService);
console.log(
  'Available methods:',
  Object.getOwnPropertyNames(Object.getPrototypeOf(FirebaseService)),
);

// Test methods
if (typeof FirebaseService.registerToken === 'function') {
  console.log('✅ registerToken method exists');
} else {
  console.log('❌ registerToken method missing');
}

if (typeof FirebaseService.getStoredNotifications === 'function') {
  console.log('✅ getStoredNotifications method exists');
} else {
  console.log('❌ getStoredNotifications method missing');
}

if (typeof FirebaseService.onMessageReceived === 'function') {
  console.log('✅ onMessageReceived method exists');
} else {
  console.log('❌ onMessageReceived method missing');
}

export default null; // Just for testing
