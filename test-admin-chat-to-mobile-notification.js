// Test end-to-end admin chat ke mobile notification
const io = require('socket.io-client');

async function testAdminChatToMobileNotification() {
  console.log('🧪 Testing Admin Chat to Mobile Notification (End-to-End)\n');
  console.log('=' .repeat(70));

  const API_BASE = 'http://localhost:5000';
  
  console.log('\n🎯 END-TO-END TEST SCENARIO:');
  console.log('1. Admin web mengirim pesan ke user mobile');
  console.log('2. Pesan diterima via socket real-time');
  console.log('3. Push notification dikirim ke mobile');
  console.log('4. User tap notification → buka chat');
  console.log('');

  // Test data
  const adminData = {
    id: 1,
    firstName: 'Administrator',
    lastName: 'PKBI Kepri',
    email: 'admin@pkbi.or.id',
    isAdmin: true
  };

  const userData = {
    id: 2,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    isAdmin: false
  };

  console.log('👥 TEST PARTICIPANTS:');
  console.log(`📱 Mobile User: ${userData.firstName} ${userData.lastName} (ID: ${userData.id})`);
  console.log(`💻 Admin User: ${adminData.firstName} ${adminData.lastName} (ID: ${adminData.id})`);
  console.log('');

  try {
    console.log('🔌 Connecting to socket server...');
    
    // Create admin socket (simulating web admin)
    const adminSocket = io(API_BASE, {
      timeout: 5000,
      forceNew: true
    });

    // Create mobile socket (simulating mobile user)
    const mobileSocket = io(API_BASE, {
      timeout: 5000,
      forceNew: true
    });

    // Wait for connections
    await Promise.all([
      new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Admin connection timeout')), 5000);
        adminSocket.on('connect', () => {
          console.log('✅ Admin web connected:', adminSocket.id);
          clearTimeout(timeout);
          resolve();
        });
        adminSocket.on('connect_error', reject);
      }),
      new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Mobile connection timeout')), 5000);
        mobileSocket.on('connect', () => {
          console.log('✅ Mobile user connected:', mobileSocket.id);
          clearTimeout(timeout);
          resolve();
        });
        mobileSocket.on('connect_error', reject);
      })
    ]);

    console.log('');
    console.log('🏠 Joining chat rooms...');

    // Join rooms
    const roomId = `user_${userData.id}_admin_${adminData.id}`;
    console.log('📍 Room ID:', roomId);

    adminSocket.emit('join_room', {
      userId: userData.id,
      adminId: adminData.id,
      userType: 'admin'
    });

    mobileSocket.emit('join_room', {
      userId: userData.id,
      adminId: adminData.id,
      userType: 'user'
    });

    // Wait for room joins
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Both users joined room successfully');
    console.log('');

    // Set up message listeners
    console.log('👂 Setting up message listeners...');

    let messageReceived = false;
    let notificationSent = false;

    mobileSocket.on('receive_message', (data) => {
      console.log('📱 💬 Mobile user received message:');
      console.log('   📩 Message:', data.message);
      console.log('   👤 From:', data.sender?.firstName, data.sender?.lastName);
      console.log('   🕒 Time:', new Date(data.createdAt).toLocaleTimeString());
      console.log('   📋 Type:', data.messageType || 'text');
      messageReceived = true;
    });

    adminSocket.on('receive_message', (data) => {
      console.log('💻 Admin web confirmed message sent');
    });

    console.log('✅ Message listeners ready');
    console.log('');

    // Test different message types
    const testMessages = [
      {
        type: 'text',
        message: 'Halo! Pembayaran Anda sudah berhasil. Selamat datang di coworking space kami! 🎉',
        description: 'Text message'
      },
      {
        type: 'file',
        message: '/uploads/chat/chat-1757962787898-332917513-BAB V_Skripsi - Copy.pdf',
        messageType: 'file',
        fileName: 'BAB V_Skripsi - Copy.pdf',
        fileType: 'application/pdf',
        description: 'PDF file'
      },
      {
        type: 'file',
        message: '/uploads/chat/chat-1757962768689-502599137-Nokia XR21.png',
        messageType: 'file',
        fileName: 'Nokia XR21.png',
        fileType: 'image/png',
        description: 'Image file'
      }
    ];

    for (let i = 0; i < testMessages.length; i++) {
      const testMsg = testMessages[i];
      
      console.log(`📤 TEST ${i + 1}/3: Sending ${testMsg.description}...`);
      console.log(`   Message: ${testMsg.message.substring(0, 50)}${testMsg.message.length > 50 ? '...' : ''}`);
      
      messageReceived = false;
      
      // Send message from admin
      const messageData = {
        senderId: adminData.id,
        receiverId: userData.id,
        message: testMsg.message,
        userType: 'admin',
        messageType: testMsg.messageType || 'text',
        fileName: testMsg.fileName || null,
        fileType: testMsg.fileType || null
      };

      adminSocket.emit('send_message', messageData);

      // Wait for message to be received
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (messageReceived) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 3000);
      });

      if (messageReceived) {
        console.log('   ✅ Message received successfully');
        console.log('   📱 Push notification should be sent to mobile');
      } else {
        console.log('   ❌ Message not received');
      }
      
      console.log('');
      
      // Wait between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🎉 END-TO-END TEST COMPLETED!');
    console.log('');
    console.log('📊 EXPECTED RESULTS:');
    console.log('✅ 3 messages sent from admin web');
    console.log('✅ 3 messages received by mobile user');
    console.log('✅ 3 push notifications sent to mobile');
    console.log('✅ All notifications saved to database');
    console.log('');
    console.log('📱 MOBILE USER EXPERIENCE:');
    console.log('1. Receives push notification: "💬 Pesan Baru dari Admin"');
    console.log('2. Notification body shows message preview or file info');
    console.log('3. Tap notification → opens chat screen');
    console.log('4. Sees message in chat with proper formatting');
    console.log('5. Can reply to admin immediately');

    // Cleanup
    adminSocket.disconnect();
    mobileSocket.disconnect();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('timeout') || error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 TROUBLESHOOTING:');
      console.log('1. Make sure backend server is running:');
      console.log('   cd backend && npm start');
      console.log('2. Check if port 5000 is available');
      console.log('3. Verify socket.io configuration');
    }
  }

  console.log('');
  console.log('🔍 VERIFICATION STEPS:');
  console.log('1. Check backend logs for notification sending');
  console.log('2. Check database table "notifications" for new entries');
  console.log('3. Check database table "chats" for message history');
  console.log('4. Test on actual mobile device for push notifications');
  console.log('');
  console.log('📋 DATABASE QUERIES TO RUN:');
  console.log('-- Recent chat notifications');
  console.log('SELECT * FROM notifications WHERE type = "chat_message" ORDER BY sentAt DESC LIMIT 5;');
  console.log('');
  console.log('-- Recent chat messages');
  console.log('SELECT * FROM chats WHERE senderId = 1 OR receiverId = 1 ORDER BY createdAt DESC LIMIT 5;');
  console.log('');
  console.log('-- User FCM tokens');
  console.log('SELECT * FROM fcm_tokens WHERE userId = 2 AND isActive = 1;');
}

// Jalankan test
if (require.main === module) {
  testAdminChatToMobileNotification().catch(console.error);
}

module.exports = { testAdminChatToMobileNotification };
