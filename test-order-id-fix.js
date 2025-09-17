// Test script untuk debug dan fix order ID generation
const axios = require('axios');

async function testOrderIdFix() {
  console.log('🔧 Testing Order ID Generation Fix\n');
  console.log('=' .repeat(70));

  try {
    console.log('\n📋 Testing dengan data mobile app yang sebenarnya...');
    
    // Test dengan data yang mirip dengan yang dikirim mobile app
    const testData = {
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
          name: 'Aplikasi Absensi', // Nama yang umum dari mobile app
          category: 'Produk' // Kategori yang umum
        }
      ],
      paymentType: 'credit_card',
      enabledPayments: ['credit_card']
    };

    console.log('📤 Sending test data to /midtrans/create:');
    console.log(JSON.stringify(testData, null, 2));

    // Test endpoint /test-mobile-order-id (no auth required)
    const response = await axios.post('http://localhost:5000/api/payment/test-mobile-order-id', {
      itemDetails: testData.itemDetails
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('\n📥 Response from backend:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    if (response.data.success && response.data.data.order_id) {
      const orderId = response.data.data.order_id;
      const isStructured = response.data.data.is_structured;
      const format = response.data.data.format;

      console.log('\n🎯 Generated Order ID:', orderId);
      console.log('📋 Format Used:', format);
      console.log('🔧 Is Structured:', isStructured);

      if (isStructured) {
        console.log('✅ Order ID follows structured format!');
        if (orderId.startsWith('PRAPL')) {
          console.log('✅ Correctly mapped to PRAPL (Produk Aplikasi)');
        } else if (orderId.startsWith('PROTH')) {
          console.log('✅ Correctly mapped to PROTH (Produk Other)');
        }
      } else {
        console.log('❌ Order ID still using fallback format');
        console.log('❌ This means the product name/category mapping failed');
        console.log('💡 Check backend logs for detailed error information');
      }
    } else {
      console.log('❌ No Order ID returned from backend');
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

  console.log('\n🔍 DEBUGGING GUIDE:');
  console.log('');
  console.log('If Order ID still uses fallback format (ORDER-xxxxx):');
  console.log('');
  console.log('1. Check Backend Logs:');
  console.log('   - Look for "🔍 DEBUG - First Item:" in console');
  console.log('   - Check if name and category are present');
  console.log('   - Look for "⚠️  Product info incomplete" message');
  console.log('');
  console.log('2. Check Product Name Mapping:');
  console.log('   - Verify product name matches ORDER_CODE_MAPPING');
  console.log('   - Check if keyword matching works');
  console.log('   - Look for "✅ Found match" or "⚠️  Using fallback code"');
  console.log('');
  console.log('3. Check Database Connection:');
  console.log('   - Ensure Order model is accessible');
  console.log('   - Check for database query errors');
  console.log('   - Look for "❌ Error generating structured Order ID"');
  console.log('');
  console.log('4. Common Issues:');
  console.log('   - Product name case sensitivity');
  console.log('   - Missing category field');
  console.log('   - Database connection problems');
  console.log('   - Authentication token issues');
  console.log('');

  console.log('📋 CURRENT PRODUCT NAME MAPPINGS:');
  console.log('');
  console.log('Exact Matches:');
  console.log('├─ "Aplikasi Absensi" → PRAPL');
  console.log('├─ "Aplikasi Data Relawan" → PRAPL');
  console.log('├─ "Aplikasi absen" → PRAPL');
  console.log('├─ "Produk Aplikasi" → PRAPL');
  console.log('└─ "Produk Website" → PRAWB');
  console.log('');
  console.log('Keyword Matches:');
  console.log('├─ Contains "aplikasi" → PRAPL');
  console.log('├─ Contains "website" → PRAWB');
  console.log('└─ Contains "produk" → PROTH');
  console.log('');
  console.log('Fallback by Category:');
  console.log('├─ Category "Produk" → PROTH');
  console.log('├─ Category "Layanan" → LAYOTH');
  console.log('└─ Unknown → ORDOTH');
  console.log('');

  console.log('🔧 POTENTIAL FIXES:');
  console.log('');
  console.log('A. Add More Product Name Mappings:');
  console.log('   - Add common mobile app product names');
  console.log('   - Include variations and typos');
  console.log('   - Add case-insensitive matching');
  console.log('');
  console.log('B. Improve Keyword Matching:');
  console.log('   - Better substring matching logic');
  console.log('   - Handle partial words');
  console.log('   - Add fuzzy matching');
  console.log('');
  console.log('C. Enhanced Fallback Logic:');
  console.log('   - Better category-based codes');
  console.log('   - Product type detection');
  console.log('   - Smart defaults');
  console.log('');

  console.log('🎯 NEXT STEPS:');
  console.log('');
  console.log('1. Run this test and check backend logs');
  console.log('2. Identify why fallback is being used');
  console.log('3. Add missing product name mappings');
  console.log('4. Test with real mobile app data');
  console.log('5. Verify structured Order ID generation');
  console.log('');

  console.log('✅ Test completed! Check backend logs for detailed debugging info.');
}

// Run the test
testOrderIdFix().catch(console.error);
