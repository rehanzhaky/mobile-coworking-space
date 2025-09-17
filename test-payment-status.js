const axios = require('axios');

async function testPaymentStatus() {
  try {
    console.log('🧪 Testing payment status endpoint...');
    
    // Test dengan order ID yang tidak ada
    const response = await axios.get('http://localhost:5000/payment/status/TESTORDER123', {
      timeout: 5000,
      validateStatus: function (status) {
        return status < 500; // Resolve only if the status code is less than 500
      }
    });
    
    console.log('✅ Payment status response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error testing payment status:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.code);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Test beberapa skenario
async function runAllTests() {
  console.log('=== Testing Payment Status Endpoint ===\n');
  
  // Test 1: Order ID yang tidak ada
  console.log('Test 1: Non-existent order ID');
  await testPaymentStatus();
  
  console.log('\n=======================================');
}

runAllTests();