// Debug script untuk badge yang tidak muncul
const http = require('http');

async function debugBadgeNotShowing() {
  console.log('🔍 Debug Badge Not Showing Issue\n');
  console.log('=' .repeat(50));

  console.log('\n1. 📊 Checking Database Notifications...');
  
  try {
    const { Notification } = require('./backend/models');
    
    // Check total notifications
    const totalNotifications = await Notification.count();
    console.log('📝 Total notifications in database:', totalNotifications);
    
    // Check unread notifications for different users
    const users = [1, 2, 3]; // Check multiple user IDs
    
    for (const userId of users) {
      const unreadCount = await Notification.count({
        where: { 
          userId: userId, 
          isRead: false 
        }
      });
      console.log(`🔔 User ${userId} unread notifications:`, unreadCount);
      
      // Show recent notifications for this user
      if (unreadCount > 0) {
        const recent = await Notification.findAll({
          where: { userId: userId },
          order: [['sentAt', 'DESC']],
          limit: 3,
          attributes: ['id', 'title', 'isRead', 'sentAt']
        });
        
        console.log(`📋 Recent notifications for user ${userId}:`);
        recent.forEach(notif => {
          const status = notif.isRead ? '✅ Read' : '🔔 Unread';
          console.log(`  - [${status}] ${notif.title}`);
        });
      }
    }
    
    // Check broadcast notifications (userId = null)
    const broadcastCount = await Notification.count({
      where: { 
        userId: null, 
        isRead: false 
      }
    });
    console.log('📢 Broadcast unread notifications:', broadcastCount);
    
  } catch (error) {
    console.log('❌ Database check failed:', error.message);
    console.log('💡 Database might not be connected');
  }

  console.log('\n2. 🔗 Testing API Endpoint...');
  
  // Test API without token first
  try {
    const apiTest = await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/notifications?unreadOnly=true&limit=1',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ success: true, status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ success: false, error: 'JSON parse error', rawData: data });
          }
        });
      });

      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });

      req.end();
    });

    console.log('📡 API Response (no token):', apiTest.status);
    if (apiTest.data) {
      console.log('📄 Response data:', JSON.stringify(apiTest.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }

  console.log('\n3. 🔑 Testing with Sample Token...');
  
  // Test with a sample token format
  const sampleTokens = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample', // Sample JWT format
    'test-token',
    'bearer-token'
  ];
  
  for (const token of sampleTokens) {
    try {
      const apiTest = await new Promise((resolve) => {
        const options = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/notifications?unreadOnly=true&limit=1',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const jsonData = JSON.parse(data);
              resolve({ success: true, status: res.statusCode, data: jsonData });
            } catch (e) {
              resolve({ success: false, error: 'JSON parse error', rawData: data });
            }
          });
        });

        req.on('error', (error) => {
          resolve({ success: false, error: error.message });
        });

        req.setTimeout(3000, () => {
          req.destroy();
          resolve({ success: false, error: 'Timeout' });
        });

        req.end();
      });

      console.log(`🔑 Token "${token.substring(0, 10)}...": Status ${apiTest.status}`);
      if (apiTest.data && apiTest.data.data && apiTest.data.data.unreadCount !== undefined) {
        console.log(`✅ Unread count: ${apiTest.data.data.unreadCount}`);
      }
      
    } catch (error) {
      console.log(`❌ Token test failed: ${error.message}`);
    }
  }

  console.log('\n4. 🛠️  TROUBLESHOOTING STEPS:');
  console.log('');
  console.log('A. 📱 Mobile App Issues:');
  console.log('   □ Check if AsyncStorage.getItem("userToken") returns valid token');
  console.log('   □ Check if fetchUnreadNotificationCount() is being called');
  console.log('   □ Check if API call is successful');
  console.log('   □ Check if setUnreadNotificationCount() is being called');
  console.log('');
  console.log('B. 🔗 API Issues:');
  console.log('   □ Check if /api/notifications endpoint is working');
  console.log('   □ Check if authentication middleware is working');
  console.log('   □ Check if unreadCount is being calculated correctly');
  console.log('   □ Check if user ID in token matches notifications userId');
  console.log('');
  console.log('C. 🎨 UI Issues:');
  console.log('   □ Check if NotificationIcon component is receiving unreadCount prop');
  console.log('   □ Check if badge styles are applied correctly');
  console.log('   □ Check if badge is positioned correctly (not hidden)');
  console.log('   □ Check if conditional rendering {unreadCount > 0 && ...} is working');
  console.log('');

  console.log('5. 🧪 QUICK FIXES TO TRY:');
  console.log('');
  console.log('A. Force Badge to Show (Temporary):');
  console.log('   - In HomeScreen.js, temporarily set:');
  console.log('   - setUnreadNotificationCount(5); // Force show badge');
  console.log('');
  console.log('B. Check Token in Mobile App:');
  console.log('   - Add console.log in fetchUnreadNotificationCount():');
  console.log('   - console.log("Token:", token);');
  console.log('   - console.log("API Result:", result);');
  console.log('');
  console.log('C. Simplify Badge Condition:');
  console.log('   - Change {unreadCount > 0 && ...} to {true && ...}');
  console.log('   - This will always show badge for testing');
  console.log('');

  console.log('6. 📋 DEBUGGING COMMANDS:');
  console.log('');
  console.log('In mobile app console, add these logs:');
  console.log('');
  console.log('// In fetchUnreadNotificationCount()');
  console.log('console.log("🔍 Debug - Token:", token);');
  console.log('console.log("🔍 Debug - API URL:", "/notifications?unreadOnly=true&limit=1");');
  console.log('console.log("🔍 Debug - API Result:", result);');
  console.log('console.log("🔍 Debug - Unread Count:", unreadCount);');
  console.log('console.log("🔍 Debug - Setting State:", unreadCount);');
  console.log('');
  console.log('// In NotificationIcon component');
  console.log('console.log("🔍 Debug - Badge Props:", { unreadCount });');
  console.log('console.log("🔍 Debug - Should Show Badge:", unreadCount > 0);');
  console.log('');

  console.log('7. 🎯 EXPECTED RESULTS:');
  console.log('');
  console.log('If everything is working correctly:');
  console.log('✅ Database has unread notifications');
  console.log('✅ API returns unreadCount > 0');
  console.log('✅ Mobile app receives valid token');
  console.log('✅ fetchUnreadNotificationCount() succeeds');
  console.log('✅ setUnreadNotificationCount() is called with count > 0');
  console.log('✅ NotificationIcon receives unreadCount > 0');
  console.log('✅ Badge renders with correct styling');
  console.log('');

  console.log('✅ Debug analysis completed!');
  console.log('📱 Check mobile app console logs and follow troubleshooting steps');
}

// Run debug
if (require.main === module) {
  debugBadgeNotShowing().catch(console.error);
}

module.exports = { debugBadgeNotShowing };
