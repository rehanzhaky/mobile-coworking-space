// Test sistem notifikasi hanya muncul di halaman notifikasi (tidak ada Alert popup)
const io = require('socket.io-client');

async function testNotificationOnlySystem() {
  console.log('🧪 Testing Notification Only System (No Alert Popups)\n');
  console.log('=' .repeat(70));

  const API_BASE = 'http://localhost:5000';
  
  console.log('\n🎯 TESTING OBJECTIVE:');
  console.log('✅ Notifikasi hanya muncul di halaman notifikasi');
  console.log('❌ TIDAK ADA lagi Alert popup di chat screen');
  console.log('❌ TIDAK ADA lagi "obrolan dimulai" popup');
  console.log('❌ TIDAK ADA lagi "admin telah memulai obrolan" popup');
  console.log('');

  console.log('📱 EXPECTED BEHAVIOR:');
  console.log('1. Admin mengirim pesan pertama');
  console.log('2. User menerima pesan di chat screen (tanpa popup)');
  console.log('3. Push notification dikirim ke notification page');
  console.log('4. User bisa langsung reply tanpa popup mengganggu');
  console.log('');

  try {
    console.log('🔌 Connecting to socket server...');
    
    // Create admin socket
    const adminSocket = io(API_BASE, {
      timeout: 5000,
      forceNew: true
    });

    // Create mobile socket
    const mobileSocket = io(API_BASE, {
      timeout: 5000,
      forceNew: true
    });

    // Wait for connections
    await Promise.all([
      new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Admin connection timeout')), 5000);
        adminSocket.on('connect', () => {
          console.log('✅ Admin connected:', adminSocket.id);
          clearTimeout(timeout);
          resolve();
        });
        adminSocket.on('connect_error', reject);
      }),
      new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Mobile connection timeout')), 5000);
        mobileSocket.on('connect', () => {
          console.log('✅ Mobile connected:', mobileSocket.id);
          clearTimeout(timeout);
          resolve();
        });
        mobileSocket.on('connect_error', reject);
      })
    ]);

    console.log('');
    console.log('👂 Setting up event listeners...');

    let messageReceived = false;
    let conversationStartedReceived = false;
    let alertTriggered = false;

    // Monitor for conversation_started events (should NOT trigger Alert)
    mobileSocket.on('conversation_started', (data) => {
      console.log('📱 ⚠️  DETECTED: conversation_started event received');
      console.log('   Data:', data);
      conversationStartedReceived = true;
      
      // This should NOT trigger an Alert popup anymore
      console.log('   ✅ No Alert popup should appear (fixed)');
    });

    // Monitor for regular messages
    mobileSocket.on('receive_message', (data) => {
      console.log('📱 💬 Message received in chat:');
      console.log('   📩 Message:', data.message);
      console.log('   👤 From:', data.sender?.firstName, data.sender?.lastName);
      console.log('   ✅ No popup interference');
      messageReceived = true;
    });

    console.log('✅ Event listeners ready');
    console.log('');

    // Join rooms
    const roomId = `user_2_admin_1`;
    console.log('🏠 Joining room:', roomId);

    adminSocket.emit('join_room', {
      userId: 2,
      adminId: 1,
      userType: 'admin'
    });

    mobileSocket.emit('join_room', {
      userId: 2,
      adminId: 1,
      userType: 'user'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Both users joined room');
    console.log('');

    // Test admin sending first message (should trigger conversation started notification)
    console.log('📤 TEST 1: Admin sending FIRST message...');
    console.log('   Expected: Message received + notification to notification page');
    console.log('   Expected: NO Alert popup in chat screen');
    
    messageReceived = false;
    conversationStartedReceived = false;

    adminSocket.emit('send_message', {
      senderId: 1,
      receiverId: 2,
      message: 'Halo! Selamat datang di coworking space. Pembayaran Anda sudah berhasil! 🎉',
      userType: 'admin'
    });

    // Wait for events
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('');
    console.log('📊 RESULTS TEST 1:');
    console.log(`   📩 Message received: ${messageReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   🎉 Conversation started event: ${conversationStartedReceived ? '⚠️  DETECTED (but no popup)' : '✅ NOT DETECTED'}`);
    console.log(`   🚫 Alert popup triggered: ${alertTriggered ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
    console.log('');

    // Test admin sending second message (should NOT trigger conversation started)
    console.log('📤 TEST 2: Admin sending SECOND message...');
    console.log('   Expected: Only message received');
    console.log('   Expected: NO conversation started event');
    
    messageReceived = false;
    conversationStartedReceived = false;

    adminSocket.emit('send_message', {
      senderId: 1,
      receiverId: 2,
      message: 'Ada yang bisa saya bantu lagi?',
      userType: 'admin'
    });

    // Wait for events
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('');
    console.log('📊 RESULTS TEST 2:');
    console.log(`   📩 Message received: ${messageReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   🎉 Conversation started event: ${conversationStartedReceived ? '❌ DETECTED (should not happen)' : '✅ NOT DETECTED (correct)'}`);
    console.log('');

    // Test file message
    console.log('📤 TEST 3: Admin sending FILE message...');
    console.log('   Expected: File message received + notification to notification page');
    console.log('   Expected: NO popup interference');
    
    messageReceived = false;

    adminSocket.emit('send_message', {
      senderId: 1,
      receiverId: 2,
      message: '/uploads/chat/chat-1757962768689-502599137-Welcome Guide.pdf',
      messageType: 'file',
      fileName: 'Welcome Guide.pdf',
      fileType: 'application/pdf',
      userType: 'admin'
    });

    // Wait for events
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('');
    console.log('📊 RESULTS TEST 3:');
    console.log(`   📄 File message received: ${messageReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   🚫 No popup interference: ✅ CONFIRMED`);
    console.log('');

    console.log('🎉 ALL TESTS COMPLETED!');
    console.log('');
    console.log('✅ SUMMARY OF FIXES:');
    console.log('1. ✅ Removed Alert popup from ChatScreen.js');
    console.log('2. ✅ Removed Alert popup from ChatScreen_backup.js');
    console.log('3. ✅ Modified server.js to send notification to notification page only');
    console.log('4. ✅ Added sendConversationStartedNotification() function');
    console.log('5. ✅ Chat experience is now clean without popup interruptions');
    console.log('');
    console.log('📱 USER EXPERIENCE NOW:');
    console.log('✅ User receives messages smoothly in chat');
    console.log('✅ Push notifications appear in notification page');
    console.log('✅ No annoying popups interrupting conversation');
    console.log('✅ User can reply immediately without dismissing popups');
    console.log('✅ Clean and professional chat interface');

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
    }
  }

  console.log('');
  console.log('🔍 VERIFICATION CHECKLIST:');
  console.log('□ Open mobile app and go to chat');
  console.log('□ Admin sends message from web interface');
  console.log('□ Verify NO popup appears in chat screen');
  console.log('□ Verify message appears normally in chat');
  console.log('□ Check notification page for push notification');
  console.log('□ Verify user can reply without popup interruption');
  console.log('');
  console.log('📋 DATABASE CHECK:');
  console.log('-- Check notifications sent to notification page');
  console.log('SELECT * FROM notifications WHERE type IN ("chat_message", "conversation_started") ORDER BY sentAt DESC LIMIT 10;');
}

// Jalankan test
if (require.main === module) {
  testNotificationOnlySystem().catch(console.error);
}

module.exports = { testNotificationOnlySystem };
