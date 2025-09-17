// Script untuk membuat test notifications
const http = require('http');

async function createTestNotifications() {
  console.log('🧪 Creating Test Notifications for Dynamic Badge Testing\n');
  console.log('=' .repeat(60));

  // Test data
  const testNotifications = [
    {
      userId: 2, // Adjust this to your test user ID
      title: '🎉 Selamat Datang!',
      body: 'Terima kasih telah bergabung dengan aplikasi kami. Nikmati fitur-fitur menarik yang tersedia!',
      type: 'general'
    },
    {
      userId: 2,
      title: '🛍️ Produk Baru Tersedia',
      body: 'Kami telah menambahkan ruang kerja baru dengan fasilitas premium. Cek sekarang!',
      type: 'new_product'
    },
    {
      userId: 2,
      title: '💰 Promo Spesial',
      body: 'Dapatkan diskon 30% untuk pemesanan ruang kerja hari ini. Jangan sampai terlewat!',
      type: 'promo'
    },
    {
      userId: 2,
      title: '📋 Update Pesanan',
      body: 'Pesanan Anda dengan ID PRAPL001 telah dikonfirmasi dan sedang diproses.',
      type: 'order_status'
    },
    {
      userId: 2,
      title: '💳 Pembayaran Berhasil',
      body: 'Pembayaran Anda sebesar Rp 150.000 telah berhasil diproses. Terima kasih!',
      type: 'payment'
    }
  ];

  console.log('\n📊 Test Notifications to Create:');
  testNotifications.forEach((notif, index) => {
    console.log(`${index + 1}. ${notif.title}`);
    console.log(`   Type: ${notif.type}`);
    console.log(`   User: ${notif.userId}`);
    console.log('');
  });

  console.log('🔧 Creating notifications in database...\n');

  try {
    // Import models
    const { Notification } = require('./backend/models');
    
    // Create notifications
    for (let i = 0; i < testNotifications.length; i++) {
      const notifData = testNotifications[i];
      
      console.log(`📝 Creating notification ${i + 1}: ${notifData.title}`);
      
      const notification = await Notification.create({
        userId: notifData.userId,
        title: notifData.title,
        body: notifData.body,
        type: notifData.type,
        data: JSON.stringify({ test: true, index: i + 1 }),
        isRead: false, // Important: Set as unread for testing
        sentAt: new Date()
      });
      
      console.log(`✅ Created notification ID: ${notification.id}`);
    }
    
    console.log('\n🎉 All test notifications created successfully!');
    
    // Verify count
    const unreadCount = await Notification.count({
      where: {
        userId: testNotifications[0].userId,
        isRead: false
      }
    });
    
    console.log(`\n📊 Total unread notifications for user ${testNotifications[0].userId}: ${unreadCount}`);
    
    // Show recent notifications
    const recentNotifications = await Notification.findAll({
      where: { userId: testNotifications[0].userId },
      order: [['sentAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'title', 'isRead', 'sentAt']
    });
    
    console.log('\n📋 Recent notifications:');
    recentNotifications.forEach((notif, index) => {
      const status = notif.isRead ? '✅ Read' : '🔔 Unread';
      console.log(`  ${index + 1}. [${status}] ${notif.title} (ID: ${notif.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error creating notifications:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Database is running');
    console.log('2. Models are properly synced');
    console.log('3. User ID exists in users table');
    return;
  }

  console.log('\n🧪 TESTING INSTRUCTIONS:');
  console.log('');
  console.log('Now test the dynamic badge system:');
  console.log('');
  console.log('1. 📱 Open mobile app');
  console.log('2. 👀 Check badge on bell icon');
  console.log('3. 🔍 Expected: Badge shows "5" (5 unread notifications)');
  console.log('4. 📱 Tap bell icon → Open NotificationScreen');
  console.log('5. 👆 Tap one notification to mark as read');
  console.log('6. ↩️  Return to HomeScreen');
  console.log('7. 🔍 Expected: Badge shows "4" (decreased by 1)');
  console.log('8. 🔄 Repeat steps 4-7 until badge disappears');
  console.log('');

  console.log('📊 EXPECTED BADGE BEHAVIOR:');
  console.log('');
  console.log('Initial state: Badge shows "5"');
  console.log('After reading 1: Badge shows "4"');
  console.log('After reading 2: Badge shows "3"');
  console.log('After reading 3: Badge shows "2"');
  console.log('After reading 4: Badge shows "1"');
  console.log('After reading 5: Badge disappears (count = 0)');
  console.log('');

  console.log('🔍 CONSOLE LOGS TO WATCH:');
  console.log('');
  console.log('In mobile app console:');
  console.log('✅ HomeScreen: Real unread notification count: 5');
  console.log('✅ HomeScreen: Real unread notification count: 4');
  console.log('✅ HomeScreen: Real unread notification count: 3');
  console.log('... (decreasing as notifications are read)');
  console.log('✅ HomeScreen: Real unread notification count: 0');
  console.log('');

  console.log('🛠️  MANUAL VERIFICATION:');
  console.log('');
  console.log('Check database after each read:');
  console.log('');
  console.log('-- Count unread notifications');
  console.log(`SELECT COUNT(*) as unread_count FROM notifications WHERE userId = ${testNotifications[0].userId} AND isRead = false;`);
  console.log('');
  console.log('-- Check read status');
  console.log(`SELECT id, title, isRead, readAt FROM notifications WHERE userId = ${testNotifications[0].userId} ORDER BY sentAt DESC;`);
  console.log('');

  console.log('🎯 SUCCESS CRITERIA:');
  console.log('');
  console.log('✅ Badge appears with count = 5');
  console.log('✅ Badge decreases when notifications are read');
  console.log('✅ Badge updates when returning to HomeScreen');
  console.log('✅ Badge disappears when all notifications are read');
  console.log('✅ Console logs show real count updates');
  console.log('');

  console.log('🔄 RESET FOR RETESTING:');
  console.log('');
  console.log('To reset all notifications to unread:');
  console.log(`UPDATE notifications SET isRead = false, readAt = NULL WHERE userId = ${testNotifications[0].userId};`);
  console.log('');

  console.log('✅ Test notifications created successfully!');
  console.log('📱 Now test the dynamic badge system in mobile app');
}

// Helper function to create notification via API (alternative method)
async function createNotificationViaAPI(notificationData) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(notificationData);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/notifications/send-test',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token' // You may need a real admin token
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

    req.write(postData);
    req.end();
  });
}

// Run the script
if (require.main === module) {
  createTestNotifications().catch(console.error);
}

module.exports = { createTestNotifications };
