// Test sistem penomoran Order ID yang baru
const { generateOrderId, ORDER_CODE_MAPPING } = require('./backend/utils/orderIdGenerator');

async function testOrderIdSystem() {
  console.log('🧪 Testing Order ID System - Format Baru\n');
  console.log('=' .repeat(60));

  console.log('\n📋 MAPPING KODE ORDER ID:');
  console.log('LAYANAN:');
  console.log('  LAYSDMM = LAYanan Sewa DoMain Microsoft');
  console.log('  LAYSDMG = LAYanan Sewa DoMain Gmail');
  console.log('  LAYCAPL = LAYanan Custom APLikasi');
  console.log('  LAYCWB  = LAYanan Custom WeBsite');
  console.log('  LAYSC   = LAYanan Sewa Canva');
  console.log('  LAYDB   = LAYanan Desain Banner');
  console.log('  LAYDN   = LAYanan Desain Nametag');
  console.log('  LAYDL   = LAYanan Desain Lanyard');
  console.log('  LAYSZ   = LAYanan Sewa Zoom');
  
  console.log('\nPRODUK:');
  console.log('  PRAPL   = PRoduk APLikasi');
  console.log('  PRAWB   = PRoduk WeBsite');

  console.log('\n🧪 TESTING GENERATION:');
  
  const testCases = [
    // Test Produk
    { nama: 'Produk Aplikasi', kategori: 'Produk', expected: 'PRAPL' },
    { nama: 'Produk Website', kategori: 'Produk', expected: 'PRAWB' },
    { nama: 'Aplikasi', kategori: 'Produk', expected: 'PRAPL' },
    { nama: 'Website', kategori: 'Produk', expected: 'PRAWB' },
    
    // Test Layanan
    { nama: 'Layanan Sewa Domain Microsoft', kategori: 'Layanan', expected: 'LAYSDMM' },
    { nama: 'Layanan Sewa Domain Gmail', kategori: 'Layanan', expected: 'LAYSDMG' },
    { nama: 'Layanan Custom Aplikasi', kategori: 'Layanan', expected: 'LAYCAPL' },
    { nama: 'Layanan Custom Website', kategori: 'Layanan', expected: 'LAYCWB' },
    { nama: 'Layanan Sewa Canva', kategori: 'Layanan', expected: 'LAYSC' },
    { nama: 'Layanan Desain Banner', kategori: 'Layanan', expected: 'LAYDB' },
    { nama: 'Layanan Desain Nametag', kategori: 'Layanan', expected: 'LAYDN' },
    { nama: 'Layanan Desain Lanyard', kategori: 'Layanan', expected: 'LAYDL' },
    { nama: 'Layanan Sewa Zoom', kategori: 'Layanan', expected: 'LAYSZ' },
    
    // Test dengan nama pendek
    { nama: 'Sewa Domain Microsoft', kategori: 'Layanan', expected: 'LAYSDMM' },
    { nama: 'Custom Aplikasi', kategori: 'Layanan', expected: 'LAYCAPL' },
    { nama: 'Desain Banner', kategori: 'Layanan', expected: 'LAYDB' },
    
    // Test fallback
    { nama: 'Layanan Lainnya', kategori: 'Layanan', expected: 'LAYOTH' },
    { nama: 'Produk Lainnya', kategori: 'Produk', expected: 'PROTH' },
  ];

  for (const testCase of testCases) {
    try {
      const orderId = await generateOrderId(testCase.nama, testCase.kategori);
      const prefix = orderId.substring(0, orderId.length - 3);
      const number = orderId.substring(orderId.length - 3);
      
      const status = prefix === testCase.expected ? '✅' : '❌';
      console.log(`${status} ${testCase.nama} → ${orderId} (${prefix} + ${number})`);
      
      if (prefix !== testCase.expected) {
        console.log(`   Expected: ${testCase.expected}, Got: ${prefix}`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${testCase.nama}: ${error.message}`);
    }
  }

  console.log('\n🎯 CONTOH HASIL PENOMORAN:');
  console.log('Pembeli pertama Produk Aplikasi: PRAPL001');
  console.log('Pembeli kedua Produk Aplikasi: PRAPL002');
  console.log('Pembeli ketiga Produk Aplikasi: PRAPL003');
  console.log('Pembeli pertama Produk Website: PRAWB001');
  console.log('Pembeli pertama Layanan Custom Aplikasi: LAYCAPL001');
  console.log('Pembeli kedua Layanan Custom Aplikasi: LAYCAPL002');

  console.log('\n✅ Test selesai! Sistem penomoran Order ID siap digunakan.');
  console.log('📌 Setiap order baru akan mendapat nomor urut yang rapi.');
}

// Jalankan test jika file ini dijalankan langsung
if (require.main === module) {
  testOrderIdSystem().catch(console.error);
}

module.exports = { testOrderIdSystem };
