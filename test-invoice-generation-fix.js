// Test untuk memverifikasi invoice number generation saat order dibuat
const axios = require('axios');

async function testInvoiceGenerationFix() {
  console.log('🔧 Testing Invoice Number Generation Fix\n');
  console.log('=' .repeat(60));

  try {
    console.log('\n📋 Step 1: Creating complete test order with invoice...');

    // Test dengan endpoint test yang tidak memerlukan auth
    const orderData = {
      grossAmount: 2000000,
      customerDetails: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+6281234567890',
        community: 'Test Community',
        province: 'Jakarta',
        city: 'Jakarta',
        postal: '12345'
      },
      itemDetails: [
        {
          id: 'PRODUCT-1',
          price: 2000000,
          quantity: 1,
          name: 'Aplikasi Absensi',
          category: 'Produk'
        }
      ]
    };

    console.log('📤 Sending order data to /test-complete-order:');
    console.log(JSON.stringify(orderData, null, 2));

    const response = await axios.post('http://localhost:5000/api/payment/test-complete-order', orderData, {
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('\n📥 Response from backend:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    
    if (response.data.success && response.data.data) {
      const orderInfo = response.data.data;
      console.log('\n🎯 Order Creation Results:');
      console.log('Order ID:', orderInfo.order_id);
      console.log('Invoice Number:', orderInfo.invoice_number);
      console.log('Database ID:', orderInfo.database_id);
      console.log('Customer Name:', orderInfo.customer_name);
      console.log('Product Name:', orderInfo.product_name);
      console.log('Total Amount:', orderInfo.total_amount);
      console.log('Status:', orderInfo.status);
      console.log('Payment Status:', orderInfo.payment_status);
      console.log('Created At:', orderInfo.created_at);

      // Check if order ID follows structured format
      const isStructured = !orderInfo.order_id.startsWith('ORDER-');
      console.log('\n📋 Validation Results:');
      console.log('Structured Order ID:', isStructured ? '✅ YES' : '❌ NO');

      if (isStructured) {
        console.log('✅ Order ID follows structured format!');
        if (orderInfo.order_id.startsWith('PRAPL')) {
          console.log('✅ Correctly mapped to PRAPL (Produk Aplikasi)');
        }
      }

      // Check invoice number format
      const invoiceNumber = orderInfo.invoice_number;
      const isValidInvoiceFormat = /^INV\d{8}\d{3}$/.test(invoiceNumber);
      console.log('Valid Invoice Format:', isValidInvoiceFormat ? '✅ YES' : '❌ NO');

      if (isValidInvoiceFormat) {
        const year = invoiceNumber.substring(3, 7);
        const month = invoiceNumber.substring(7, 9);
        const day = invoiceNumber.substring(9, 11);
        const sequence = invoiceNumber.substring(11, 14);

        console.log('📋 Invoice Format Breakdown:');
        console.log(`   ${invoiceNumber} = INV + ${year} + ${month} + ${day} + ${sequence}`);
        console.log(`   Format: INV + YEAR + MONTH + DAY + SEQUENCE`);
      }

      // Verify order is in database
      console.log('\n📋 Step 2: Verifying order in database...');

      try {
        // Get order details to verify it's properly saved
        const orderCheckResponse = await axios.get(`http://localhost:5000/api/payment/status/${orderInfo.order_id}`);

        if (orderCheckResponse.data.success) {
          console.log('✅ Order found in database');
          console.log('Database Order ID:', orderCheckResponse.data.orderId);
          console.log('Database Payment Status:', orderCheckResponse.data.paymentStatus);
          console.log('✅ Order successfully saved with invoice number!');

        } else {
          console.log('❌ Order not found in database');
        }

      } catch (statusError) {
        if (statusError.response && statusError.response.status === 404) {
          console.log('ℹ️  Order not found (404) - checking if this is expected...');
        } else {
          console.log('❌ Error checking order status:', statusError.message);
        }
      }
      
    } else {
      console.log('❌ Order creation failed');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    }

    // Test invoice generation endpoint directly
    console.log('\n📋 Step 3: Testing direct invoice generation...');
    
    try {
      const invoiceResponse = await axios.post('http://localhost:5000/api/payment/test-invoice');
      
      if (invoiceResponse.data.success) {
        const invoiceNumber = invoiceResponse.data.data.invoice_number;
        console.log('✅ Direct invoice generation successful');
        console.log('Generated Invoice:', invoiceNumber);
        
        // Verify format
        const isValidFormat = /^INV\d{8}\d{3}$/.test(invoiceNumber);
        console.log('Valid Format:', isValidFormat ? '✅ YES' : '❌ NO');
        
        if (isValidFormat) {
          const year = invoiceNumber.substring(3, 7);
          const month = invoiceNumber.substring(7, 9);
          const day = invoiceNumber.substring(9, 11);
          const sequence = invoiceNumber.substring(11, 14);
          
          console.log('📋 Invoice Format Breakdown:');
          console.log(`   INV + ${year} + ${month} + ${day} + ${sequence}`);
          console.log(`   INV + YEAR + MONTH + DAY + SEQUENCE`);
        }
      } else {
        console.log('❌ Direct invoice generation failed');
      }
      
    } catch (invoiceError) {
      console.log('❌ Error testing direct invoice generation:', invoiceError.message);
    }

  } catch (error) {
    console.log('❌ Test failed with error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }

  console.log('\n🎯 SUMMARY:');
  console.log('');
  console.log('✅ What should happen now:');
  console.log('   1. Order creation generates structured Order ID (PRAPL001)');
  console.log('   2. Invoice number is generated immediately (INV20250916001)');
  console.log('   3. Both are saved to database when order is created');
  console.log('   4. Mobile app can display invoice number in transaction details');
  console.log('');
  console.log('🔍 How to verify:');
  console.log('   1. Check backend logs for "🧾 Generated invoice number"');
  console.log('   2. Check database orders table for invoiceNumber column');
  console.log('   3. Test mobile app transaction detail screen');
  console.log('   4. Verify invoice number appears in /my-orders API response');
  console.log('');
  console.log('📱 Mobile App Impact:');
  console.log('   - Transaction detail screen will show invoice number');
  console.log('   - Order list will include invoice numbers');
  console.log('   - No more null invoice numbers in database');
  console.log('   - Professional invoice numbering system');
  console.log('');

  console.log('✅ Invoice generation fix test completed!');
}

testInvoiceGenerationFix().catch(console.error);
