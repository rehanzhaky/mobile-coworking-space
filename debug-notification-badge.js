// Debug script untuk notification badge
const http = require('http');

async function debugNotificationBadge() {
  console.log('🔍 Debug Notification Badge System\n');
  console.log('=' .repeat(50));

  // 1. Check if backend server is running
  console.log('\n1. 🔌 Checking backend server...');
  
  try {
    const serverCheck = await new Promise((resolve) => {
      const req = http.get('http://localhost:5000/api/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ success: true, status: res.statusCode, data });
        });
      });
      
      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
      
      req.setTimeout(3000, () => {
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });
    });

    if (serverCheck.success) {
      console.log('✅ Backend server is running');
      console.log('📡 Status:', serverCheck.status);
    } else {
      console.log('❌ Backend server not accessible:', serverCheck.error);
      console.log('💡 Start server with: cd backend && npm start');
      return;
    }
  } catch (error) {
    console.log('❌ Server check failed:', error.message);
    return;
  }

  // 2. Check notifications table
  console.log('\n2. 📊 Checking notifications in database...');
  
  try {
    const { Notification } = require('./backend/models');
    
    // Count total notifications
    const totalNotifications = await Notification.count();
    console.log('📝 Total notifications in database:', totalNotifications);
    
    // Count unread notifications
    const unreadNotifications = await Notification.count({
      where: { isRead: false }
    });
    console.log('🔔 Unread notifications:', unreadNotifications);
    
    // Get recent notifications
    const recentNotifications = await Notification.findAll({
      limit: 5,
      order: [['sentAt', 'DESC']],
      attributes: ['id', 'userId', 'title', 'isRead', 'sentAt']
    });
    
    console.log('\n📋 Recent notifications:');
    recentNotifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ID: ${notif.id}, User: ${notif.userId}, Read: ${notif.isRead}, Title: "${notif.title}"`);
    });
    
    if (unreadNotifications === 0) {
      console.log('\n⚠️  No unread notifications found!');
      console.log('💡 Creating test notification...');
      
      // Create test notification
      const testNotification = await Notification.create({
        userId: 2, // Assuming user ID 2 for testing
        title: '🧪 Test Notification',
        body: 'This is a test notification for badge testing',
        type: 'test',
        data: JSON.stringify({ test: true }),
        isRead: false,
        sentAt: new Date()
      });
      
      console.log('✅ Test notification created:', testNotification.id);
    }
    
  } catch (error) {
    console.log('❌ Database check failed:', error.message);
    console.log('💡 Make sure database is connected and models are synced');
  }

  // 3. Test API endpoint
  console.log('\n3. 🔗 Testing API endpoint...');
  
  try {
    const apiTest = await new Promise((resolve) => {
      const postData = JSON.stringify({});
      
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/notifications?unreadOnly=true&limit=1',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // You may need a real token
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

    if (apiTest.success) {
      console.log('✅ API endpoint accessible');
      console.log('📊 Response status:', apiTest.status);
      console.log('📋 Response data:', JSON.stringify(apiTest.data, null, 2));
      
      if (apiTest.data.success && apiTest.data.data) {
        const unreadCount = apiTest.data.data.unreadCount || 0;
        console.log(`🔔 Unread count from API: ${unreadCount}`);
        
        if (unreadCount > 0) {
          console.log('✅ Badge should appear with count:', unreadCount);
        } else {
          console.log('⚠️  No unread notifications - badge will not appear');
        }
      }
    } else {
      console.log('❌ API endpoint failed:', apiTest.error);
      if (apiTest.rawData) {
        console.log('📄 Raw response:', apiTest.rawData);
      }
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }

  // 4. Check mobile app implementation
  console.log('\n4. 📱 Checking mobile app implementation...');
  
  try {
    const fs = require('fs');
    const homeScreenContent = fs.readFileSync('./src/screens/HomeScreen.js', 'utf8');
    
    // Check for required implementations
    const checks = [
      { name: 'unreadNotificationCount state', pattern: /unreadNotificationCount/ },
      { name: 'fetchUnreadNotificationCount function', pattern: /fetchUnreadNotificationCount/ },
      { name: 'NotificationIcon with unreadCount prop', pattern: /unreadCount={unreadNotificationCount}/ },
      { name: 'notificationBadge styles', pattern: /notificationBadge/ },
      { name: 'AsyncStorage import', pattern: /AsyncStorage/ }
    ];
    
    console.log('🔍 Implementation checks:');
    checks.forEach(check => {
      const found = check.pattern.test(homeScreenContent);
      console.log(`  ${found ? '✅' : '❌'} ${check.name}: ${found ? 'Found' : 'Missing'}`);
    });
    
  } catch (error) {
    console.log('❌ File check failed:', error.message);
  }

  // 5. Debugging suggestions
  console.log('\n5. 🛠️  Debugging Suggestions:');
  console.log('');
  console.log('If badge is not appearing, check:');
  console.log('');
  console.log('A. 📊 Data Issues:');
  console.log('   □ Are there unread notifications in database?');
  console.log('   □ Is API returning correct unreadCount?');
  console.log('   □ Is user token valid for API calls?');
  console.log('');
  console.log('B. 📱 Mobile App Issues:');
  console.log('   □ Is fetchUnreadNotificationCount being called?');
  console.log('   □ Is unreadNotificationCount state being set?');
  console.log('   □ Is NotificationIcon receiving unreadCount prop?');
  console.log('   □ Are badge styles applied correctly?');
  console.log('');
  console.log('C. 🎨 UI Issues:');
  console.log('   □ Is badge positioned correctly (not hidden)?');
  console.log('   □ Are colors contrasting enough to see?');
  console.log('   □ Is badge size appropriate?');
  console.log('');
  console.log('D. 🔄 Timing Issues:');
  console.log('   □ Is API call completing before render?');
  console.log('   □ Is state update triggering re-render?');
  console.log('   □ Is useFocusEffect working correctly?');

  console.log('\n6. 🧪 Quick Test Commands:');
  console.log('');
  console.log('-- Create test notification:');
  console.log('INSERT INTO notifications (userId, title, body, type, isRead, sentAt) VALUES (2, "Test Badge", "Test notification for badge", "test", false, NOW());');
  console.log('');
  console.log('-- Check unread count:');
  console.log('SELECT COUNT(*) as unread_count FROM notifications WHERE userId = 2 AND isRead = false;');
  console.log('');
  console.log('-- Reset all notifications to unread (for testing):');
  console.log('UPDATE notifications SET isRead = false WHERE userId = 2;');

  console.log('\n✅ Debug completed!');
  console.log('📱 Check mobile app console logs for fetchUnreadNotificationCount calls');
  console.log('🔔 Badge should appear if unreadCount > 0');
}

// Run debug
if (require.main === module) {
  debugNotificationBadge().catch(console.error);
}

module.exports = { debugNotificationBadge };
