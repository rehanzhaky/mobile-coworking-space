// Simple test untuk memastikan backend endpoint response structure
const http = require('http');

function testPaymentStatusStructure() {
  console.log('🧪 Testing payment status response structure...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/payment/midtrans/status/PRAPL003',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📋 Raw response:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('🔍 Parsed response structure:');
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (jsonData.success && jsonData.data && jsonData.data.transaction_status) {
          console.log('✅ Response structure is correct!');
          console.log(`Transaction Status: ${jsonData.data.transaction_status}`);
        } else {
          console.log('❌ Response structure is incorrect!');
          console.log('Expected: { success: true, data: { transaction_status: "..." } }');
        }
      } catch (e) {
        console.log('❌ Could not parse JSON:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
  });

  req.setTimeout(10000, () => {
    console.log('❌ Request timeout');
    req.destroy();
  });

  req.end();
}

testPaymentStatusStructure();