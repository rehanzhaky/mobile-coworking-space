// Test Order ID generation directly
const { generateOrderId } = require('./backend/utils/orderIdGenerator');

async function testDirectOrderId() {
  console.log('🧪 Testing Order ID generation directly...');
  
  try {
    // Test untuk Produk Aplikasi
    const orderId1 = await generateOrderId('Aplikasi Absensi', 'Produk');
    console.log('✅ Generated Order ID for Aplikasi Absensi (Produk):', orderId1);
    
    // Test untuk Layanan Web
    const orderId2 = await generateOrderId('Website Sekolah', 'Layanan');
    console.log('✅ Generated Order ID for Website Sekolah (Layanan):', orderId2);
    
    // Test untuk Digital Marketing
    const orderId3 = await generateOrderId('Digital Marketing', 'Service');
    console.log('✅ Generated Order ID for Digital Marketing (Service):', orderId3);
    
    console.log('\n📋 Summary:');
    console.log(`Produk Aplikasi → ${orderId1} (should start with PRAPL)`);
    console.log(`Layanan Website → ${orderId2} (should start with LAYSWB)`);
    console.log(`Service Digital Marketing → ${orderId3} (should start with LAYSDMM)`);
    
  } catch (error) {
    console.error('❌ Error testing Order ID generation:', error.message);
  }
}

testDirectOrderId();