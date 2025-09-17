const axios = require('axios');

async function testOrderIdGeneration() {
  try {
    console.log('🧪 Testing Order ID generation from mobile app flow...');
    
    // Simulate mobile app request to /midtrans/create
    const orderData = {
      grossAmount: 2000000,
      customerDetails: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+6281234567890'
      },
      itemDetails: [
        {
          id: 'PRODUCT-1',
          price: 2000000,
          quantity: 1,
          name: 'Aplikasi Absensi',
          category: 'Produk'
        }
      ],
      paymentType: 'credit_card',
      enabledPayments: ['credit_card']
    };

    console.log('📤 Sending request to create transaction...');
    console.log('Item Details:', JSON.stringify(orderData.itemDetails, null, 2));

    const response = await axios.post('http://localhost:5000/payment/test-order-id', { itemDetails: orderData.itemDetails }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Transaction created successfully!');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.order_id) {
      console.log('🎯 Generated Order ID:', response.data.data.order_id);
      
      // Test if this Order ID follows the structured format
      if (response.data.data.order_id.startsWith('PRAPL')) {
        console.log('✅ Order ID follows structured format (PRAPL for Produk Aplikasi)');
      } else {
        console.log('❌ Order ID does not follow expected structured format');
      }
    } else {
      console.log('❌ No Order ID returned from backend');
    }

  } catch (error) {
    console.log('❌ Error testing Order ID generation:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testOrderIdGeneration();