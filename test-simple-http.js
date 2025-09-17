const http = require('http');

function testPaymentStatusSimple() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/payment/status/TESTORDER123',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

console.log('🧪 Testing payment status with simple HTTP...');
testPaymentStatusSimple();