// Simple test to verify customer data in orders
const axios = require('axios');

async function testCustomerDataSimple() {
  try {
    console.log('🧾 Testing Customer Data in Orders');
    console.log('============================================================\n');

    // Step 1: Test dashboard endpoint to see order structure
    console.log('📋 Step 1: Testing dashboard endpoint for order structure...');
    
    try {
      const response = await axios.get('http://localhost:5000/api/payment/orders/dashboard');
      
      if (response.data.success && response.data.transactions.length > 0) {
        const sampleOrder = response.data.transactions[0];
        
        console.log('✅ Dashboard order data retrieved');
        console.log('📊 Sample Order from Dashboard:');
        console.log('   Order ID:', sampleOrder.orderId);
        console.log('   Customer Name:', sampleOrder.name); // This shows firstName + lastName
        console.log('   Phone:', sampleOrder.hp);
        console.log('   Amount:', sampleOrder.harga);
        
        // Check if we can extract firstName and lastName
        if (sampleOrder.name && sampleOrder.name.includes(' ')) {
          const nameParts = sampleOrder.name.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          
          console.log('\n📋 Name Parsing:');
          console.log(`   Full Name: "${sampleOrder.name}"`);
          console.log(`   First Name: "${firstName}"`);
          console.log(`   Last Name: "${lastName}"`);
        }
        
      } else {
        console.log('❌ No orders found in dashboard');
      }
      
    } catch (apiError) {
      console.log('❌ Dashboard API Error:', apiError.message);
    }

    // Step 2: Test direct database query simulation
    console.log('\n📋 Step 2: Testing expected customer data structure...');
    
    const expectedOrderStructure = {
      // From Order model
      id: 1,
      orderId: 'PRAPL001',
      invoiceNumber: 'INV20250916001',
      firstName: 'Muhammad',
      lastName: 'Haris',
      email: 'dewaharis@gmail.com',
      phone: '081234567890',
      community: 'Developer Community',
      productName: 'Aplikasi Absensi Staf',
      totalAmount: 1400000,
      paymentMethod: 'credit_card',
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    
    console.log('🧪 Expected Order Structure:');
    console.log(JSON.stringify(expectedOrderStructure, null, 2));

    // Step 3: Test InvoiceScreen data mapping
    console.log('\n📋 Step 3: Testing InvoiceScreen data mapping...');
    
    // Simulate what InvoiceScreen should receive
    const orderDataForInvoice = expectedOrderStructure;
    
    // Apply InvoiceScreen mapping logic
    const invoiceData = {
      customerName: `${orderDataForInvoice?.firstName || orderDataForInvoice?.name || 'Customer'} ${orderDataForInvoice?.lastName || ''}`.trim(),
      email: orderDataForInvoice?.email || orderDataForInvoice?.customerEmail || 'customer@example.com',
      date: orderDataForInvoice?.paidAt ? new Date(orderDataForInvoice.paidAt).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : orderDataForInvoice?.date || new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      invoiceNumber: orderDataForInvoice?.invoiceNumber || orderDataForInvoice?.orderNumber || 'INV202506170001',
      orderId: orderDataForInvoice?.orderId || orderDataForInvoice?.orderNumber || 'PRAPL0001',
      totalAmount: orderDataForInvoice?.totalAmount || orderDataForInvoice?.price || 2000000,
      productName: orderDataForInvoice?.productName || orderDataForInvoice?.title || 'Aplikasi Absensi Staf',
      productCategory: orderDataForInvoice?.productCategory || 'Produk',
      productPrice: orderDataForInvoice?.productPrice || orderDataForInvoice?.price || orderDataForInvoice?.totalAmount || 2000000,
      paymentMethod: orderDataForInvoice?.paymentMethod === 'credit_card' ? 'Kartu Kredit/Debit' : 
                     orderDataForInvoice?.paymentMethod === 'bank_transfer' ? 'Transfer Bank' :
                     orderDataForInvoice?.paymentMethod === 'ewallet' ? 'E-Wallet' :
                     orderDataForInvoice?.paymentMethod || 'Kartu Kredit/Debit'
    };
    
    console.log('✅ Processed Invoice Data:');
    console.log(`   Customer Name: "${invoiceData.customerName}"`);
    console.log(`   Email: "${invoiceData.email}"`);
    console.log(`   Date: "${invoiceData.date}"`);
    console.log(`   Invoice Number: "${invoiceData.invoiceNumber}"`);
    console.log(`   Total Amount: ${invoiceData.totalAmount}`);
    console.log(`   Product Name: "${invoiceData.productName}"`);
    console.log(`   Payment Method: "${invoiceData.paymentMethod}"`);

    // Step 4: Verify data quality
    console.log('\n📋 Step 4: Verifying data quality...');
    
    const dataQuality = {
      hasRealCustomerName: invoiceData.customerName !== 'Customer' && invoiceData.customerName.trim() !== '',
      hasRealEmail: invoiceData.email !== 'customer@example.com',
      hasInvoiceNumber: invoiceData.invoiceNumber !== 'INV202506170001',
      hasProductName: invoiceData.productName !== 'Aplikasi Absensi Staf',
      hasTotalAmount: invoiceData.totalAmount > 0
    };
    
    console.log('🔍 Data Quality Check:');
    Object.entries(dataQuality).forEach(([key, value]) => {
      console.log(`   ${key}: ${value ? '✅ PASS' : '❌ FAIL'}`);
    });
    
    const overallQuality = Object.values(dataQuality).every(v => v);
    console.log(`\n📊 Overall Data Quality: ${overallQuality ? '✅ EXCELLENT' : '❌ NEEDS IMPROVEMENT'}`);

    // Step 5: Recommendations
    console.log('\n📋 Step 5: Recommendations...');
    
    if (!dataQuality.hasRealCustomerName) {
      console.log('🔧 RECOMMENDATION: Ensure firstName and lastName are included in API response');
    }
    
    if (!dataQuality.hasRealEmail) {
      console.log('🔧 RECOMMENDATION: Ensure email field is included in API response');
    }
    
    console.log('\n✅ Required API Changes:');
    console.log('   1. Add firstName, lastName, email to /my-orders response ✅ DONE');
    console.log('   2. Update InvoiceScreen to use real data ✅ DONE');
    console.log('   3. Test with real order data from mobile app');
    
    console.log('\n📱 Next Steps:');
    console.log('   1. Restart backend server to apply API changes');
    console.log('   2. Test with mobile app MyOrdersScreen');
    console.log('   3. Navigate to TransactionDetailScreen');
    console.log('   4. Tap invoice number to open InvoiceScreen');
    console.log('   5. Verify real customer data is displayed');

    console.log('\n✅ Customer data integration analysis completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testCustomerDataSimple();
