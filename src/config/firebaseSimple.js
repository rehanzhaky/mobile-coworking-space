// Simple Firebase Service untuk testing
console.log('🔥 Loading Simple Firebase Service...');

class SimpleFirebaseService {
  constructor() {
    console.log('🔥 SimpleFirebaseService constructor called');
    this.isInitialized = false;
  }

  async registerToken() {
    console.log('🔥 registerToken called');
    return Promise.resolve();
  }

  async getStoredNotifications() {
    console.log('🔥 getStoredNotifications called');
    return Promise.resolve([]);
  }

  onMessageReceived(callback) {
    console.log('🔥 onMessageReceived called');
    // Return empty unsubscribe function
    return () => {};
  }
}

console.log('🔥 Creating SimpleFirebaseService instance...');
const instance = new SimpleFirebaseService();
console.log('🔥 SimpleFirebaseService instance created:', instance);

export default instance;
