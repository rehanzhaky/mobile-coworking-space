const axios = require('axios');

async function testPaymentStatusEndpoint() {
  console.log('🧪 Testing payment status endpoint...');
  
  try {
    // Test dengan Order ID yang structured
    const response = await axios.get('http://localhost:5000/payment/midtrans/status/PRAPL003', {
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // Resolve only if the status code is less than 500
      }
    });
    
    console.log('✅ Payment status response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.transaction_status) {
      console.log(`🎯 Transaction Status: ${response.data.data.transaction_status}`);
      console.log(`💳 Payment Type: ${response.data.data.payment_type}`);
    }
    
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

testPaymentStatusEndpoint();