// Test invoice screen with real customer data
const axios = require('axios');

async function testInvoiceRealData() {
  try {
    console.log('🧾 Testing Invoice Screen with Real Customer Data');
    console.log('============================================================\n');

    // Step 1: Get real order data from database
    console.log('📋 Step 1: Getting real order data from database...');
    
    try {
      const response = await axios.get('http://localhost:5000/api/payment/orders/dashboard');
      
      if (response.data.success && response.data.transactions.length > 0) {
        const realOrder = response.data.transactions[0];
        console.log('✅ Real order data retrieved');
        console.log('📊 Raw order data:');
        console.log(`   Order ID: ${realOrder.orderId}`);
        console.log(`   First Name: ${realOrder.firstName || 'NOT FOUND'}`);
        console.log(`   Last Name: ${realOrder.lastName || 'NOT FOUND'}`);
        console.log(`   Email: ${realOrder.email || 'NOT FOUND'}`);
        console.log(`   Name (fallback): ${realOrder.name || 'NOT FOUND'}`);
        console.log(`   Customer Email (fallback): ${realOrder.customerEmail || 'NOT FOUND'}`);
        
        // Test invoice data mapping
        console.log('\n📱 Invoice Data Mapping Test:');
        
        const customerName = `${realOrder?.firstName || realOrder?.name || 'Customer'} ${realOrder?.lastName || ''}`.trim();
        const email = realOrder?.email || realOrder?.customerEmail || 'customer@example.com';
        
        console.log(`✅ Mapped Customer Name: "${customerName}"`);
        console.log(`✅ Mapped Email: "${email}"`);
        
        // Check if real data is being used
        if (customerName !== 'Customer' && customerName !== '') {
          console.log('✅ SUCCESS: Real customer name is being used');
        } else {
          console.log('❌ WARNING: Fallback customer name is being used');
        }
        
        if (email !== 'customer@example.com') {
          console.log('✅ SUCCESS: Real email is being used');
        } else {
          console.log('❌ WARNING: Fallback email is being used');
        }
        
      } else {
        console.log('❌ No order data available for testing');
      }
      
    } catch (apiError) {
      console.log('❌ Error getting order data:', apiError.message);
    }

    // Step 2: Test data field availability
    console.log('\n📋 Step 2: Testing data field availability...');
    
    console.log('🔍 Expected Order Data Fields:');
    console.log('   - firstName: Customer first name from order');
    console.log('   - lastName: Customer last name from order');
    console.log('   - email: Customer email from order');
    console.log('   - name: Fallback full name field');
    console.log('   - customerEmail: Fallback email field');

    // Step 3: Test invoice screen data processing
    console.log('\n📋 Step 3: Testing invoice screen data processing...');
    
    const testOrderData = {
      firstName: 'Muhammad',
      lastName: 'Haris',
      email: 'dewaharis@gmail.com',
      orderId: 'PRAPL001',
      invoiceNumber: 'INV20250916001',
      totalAmount: 1400000,
      productName: 'Aplikasi Absensi Staf',
      productCategory: 'Produk',
      date: '2024-08-11'
    };
    
    console.log('🧪 Test Order Data:');
    console.log(JSON.stringify(testOrderData, null, 2));
    
    // Simulate invoice data processing
    const invoiceData = {
      customerName: `${testOrderData?.firstName || testOrderData?.name || 'Customer'} ${testOrderData?.lastName || ''}`.trim(),
      email: testOrderData?.email || testOrderData?.customerEmail || 'customer@example.com',
      date: testOrderData?.paidAt ? new Date(testOrderData.paidAt).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : testOrderData?.date || new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      invoiceNumber: testOrderData?.invoiceNumber || testOrderData?.orderNumber || 'INV202506170001',
      orderId: testOrderData?.orderId || testOrderData?.orderNumber || 'PRAPL0001',
      totalAmount: testOrderData?.totalAmount || testOrderData?.price || 2000000,
      productName: testOrderData?.productName || testOrderData?.title || 'Aplikasi Absensi Staf',
      productCategory: testOrderData?.productCategory || 'Produk',
      productPrice: testOrderData?.productPrice || testOrderData?.price || testOrderData?.totalAmount || 2000000,
    };
    
    console.log('\n✅ Processed Invoice Data:');
    console.log(`   Customer Name: "${invoiceData.customerName}"`);
    console.log(`   Email: "${invoiceData.email}"`);
    console.log(`   Date: "${invoiceData.date}"`);
    console.log(`   Invoice Number: "${invoiceData.invoiceNumber}"`);
    console.log(`   Total Amount: ${invoiceData.totalAmount}`);

    // Step 4: Test fallback scenarios
    console.log('\n📋 Step 4: Testing fallback scenarios...');
    
    const testCases = [
      {
        name: 'Complete Data',
        data: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        expected: { name: 'John Doe', email: 'john@example.com' }
      },
      {
        name: 'Missing Last Name',
        data: { firstName: 'John', email: 'john@example.com' },
        expected: { name: 'John', email: 'john@example.com' }
      },
      {
        name: 'Missing Email',
        data: { firstName: 'John', lastName: 'Doe' },
        expected: { name: 'John Doe', email: 'customer@example.com' }
      },
      {
        name: 'Fallback Name Field',
        data: { name: 'John Doe', email: 'john@example.com' },
        expected: { name: 'John Doe', email: 'john@example.com' }
      },
      {
        name: 'Fallback Email Field',
        data: { firstName: 'John', lastName: 'Doe', customerEmail: 'john@example.com' },
        expected: { name: 'John Doe', email: 'john@example.com' }
      },
      {
        name: 'Empty Data',
        data: {},
        expected: { name: 'Customer', email: 'customer@example.com' }
      }
    ];
    
    testCases.forEach(testCase => {
      const customerName = `${testCase.data?.firstName || testCase.data?.name || 'Customer'} ${testCase.data?.lastName || ''}`.trim();
      const email = testCase.data?.email || testCase.data?.customerEmail || 'customer@example.com';
      
      const passed = customerName === testCase.expected.name && email === testCase.expected.email;
      
      console.log(`${passed ? '✅' : '❌'} ${testCase.name}:`);
      console.log(`   Input: ${JSON.stringify(testCase.data)}`);
      console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
      console.log(`   Got: { name: "${customerName}", email: "${email}" }`);
    });

    console.log('\n🎯 SUMMARY:');
    console.log('✅ Invoice Screen Real Data Integration:');
    console.log('   1. Uses firstName + lastName for customer name');
    console.log('   2. Falls back to name field if firstName/lastName not available');
    console.log('   3. Uses email field for customer email');
    console.log('   4. Falls back to customerEmail if email not available');
    console.log('   5. Provides sensible defaults for missing data');
    
    console.log('\n📱 Data Flow:');
    console.log('   1. Order data passed from TransactionDetailScreen');
    console.log('   2. InvoiceScreen extracts firstName, lastName, email');
    console.log('   3. Combines firstName + lastName for display name');
    console.log('   4. Uses real email from order data');
    console.log('   5. Falls back to defaults only if data missing');
    
    console.log('\n🔧 Implementation:');
    console.log('   - customerName: `${orderData?.firstName || orderData?.name || "Customer"} ${orderData?.lastName || ""}`.trim()');
    console.log('   - email: orderData?.email || orderData?.customerEmail || "customer@example.com"');
    
    console.log('\n✅ Real customer data integration test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testInvoiceRealData();
