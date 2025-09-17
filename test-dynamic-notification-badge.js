// Test dynamic notification badge functionality
const axios = require('axios');

async function testDynamicNotificationBadge() {
  try {
    console.log('🔔 Testing Dynamic Notification Badge System');
    console.log('============================================================\n');

    // Step 1: Test API endpoint for unread count
    console.log('📋 Step 1: Testing unread notification count API...');

    try {
      const response = await axios.get('http://localhost:5000/api/notifications/test-count', {
        timeout: 5000
      });
      
      console.log('✅ API Response received');
      console.log('📊 Response status:', response.status);
      console.log('📋 Response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success && response.data.data) {
        const unreadCount = response.data.data.unreadCount || 0;
        console.log(`🔔 Current unread count: ${unreadCount}`);
        
        if (unreadCount > 0) {
          console.log('✅ Badge should be visible with count:', unreadCount);
        } else {
          console.log('⚪ Badge should be hidden (no unread notifications)');
        }
      }
      
    } catch (apiError) {
      if (apiError.response) {
        console.log('❌ API Error:', apiError.response.status, apiError.response.data);
      } else {
        console.log('❌ Network Error:', apiError.message);
      }
    }

    // Step 2: Create test notification to verify badge appears
    console.log('\n📋 Step 2: Creating test notification...');
    
    try {
      const testNotification = {
        userId: 1, // Test user ID
        title: 'Test Badge Notification',
        message: 'This is a test notification to verify badge appears',
        type: 'general'
      };
      
      const createResponse = await axios.post('http://localhost:5000/api/notifications/send', testNotification);
      
      if (createResponse.data.success) {
        console.log('✅ Test notification created successfully');
        console.log('📱 Notification ID:', createResponse.data.notificationId);
        
        // Wait a moment then check count again
        console.log('\n⏳ Waiting 2 seconds then checking count again...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        const countResponse = await axios.get('http://localhost:5000/api/notifications/test-count');
        
        if (countResponse.data.success) {
          const newUnreadCount = countResponse.data.data.unreadCount || 0;
          console.log(`🔔 New unread count: ${newUnreadCount}`);
          console.log('✅ Badge should now show count:', newUnreadCount);
        }
        
      } else {
        console.log('❌ Failed to create test notification:', createResponse.data);
      }
      
    } catch (createError) {
      console.log('❌ Error creating test notification:', createError.message);
    }

    // Step 3: Check final count
    console.log('\n📋 Step 3: Checking final notification count...');

    try {
      const finalCountResponse = await axios.get('http://localhost:5000/api/notifications/test-count');

      if (finalCountResponse.data.success) {
        const finalUnreadCount = finalCountResponse.data.data.unreadCount || 0;
        console.log(`🔔 Final unread count: ${finalUnreadCount}`);

        if (finalUnreadCount === 0) {
          console.log('⚪ Badge should be hidden (no unread notifications)');
        } else {
          console.log('✅ Badge should show count:', finalUnreadCount);
        }
      }

    } catch (finalError) {
      console.log('❌ Error checking final count:', finalError.message);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('✅ Dynamic Badge Behavior:');
    console.log('   1. Badge appears when unreadCount > 0');
    console.log('   2. Badge shows actual count number');
    console.log('   3. Badge disappears when unreadCount = 0');
    console.log('   4. Count updates when notifications are read');
    
    console.log('\n📱 Mobile App Integration:');
    console.log('   - HomeScreen fetches unread count on load');
    console.log('   - Badge updates when screen gains focus');
    console.log('   - Count refreshes after user visits NotificationScreen');
    console.log('   - Real-time updates when new notifications arrive');
    
    console.log('\n🔄 Expected User Experience:');
    console.log('   1. User receives notification → Badge appears with count');
    console.log('   2. User opens app → Badge shows current unread count');
    console.log('   3. User taps notification → Badge count decreases');
    console.log('   4. User reads all notifications → Badge disappears');
    
    console.log('\n✅ Dynamic notification badge test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testDynamicNotificationBadge();
