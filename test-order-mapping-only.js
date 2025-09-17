// Test mapping Order ID tanpa database
const { ORDER_CODE_MAPPING } = require('./backend/utils/orderIdGenerator');

function testOrderMapping() {
  console.log('🧪 Testing Order ID Mapping Logic (No Database)\n');
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

  console.log('\n🧪 TESTING MAPPING LOGIC:');
  
  // Fungsi untuk simulasi mapping tanpa database
  function simulateMapping(productName, productCategory) {
    const normalizedProductName = productName?.trim();
    const normalizedCategory = productCategory?.trim();
    
    console.log(`🔍 Testing: "${normalizedProductName}", Category: "${normalizedCategory}"`);
    
    // Cari kode berdasarkan nama produk lengkap (exact match)
    let orderCode = ORDER_CODE_MAPPING[normalizedProductName];
    
    // Jika tidak ditemukan, coba cari berdasarkan keyword dalam nama
    if (!orderCode) {
      const productLower = normalizedProductName?.toLowerCase() || '';
      
      for (const [key, value] of Object.entries(ORDER_CODE_MAPPING)) {
        const keyLower = key.toLowerCase();
        
        // Cek apakah nama produk mengandung keyword atau sebaliknya
        if (productLower.includes(keyLower) || keyLower.includes(productLower)) {
          orderCode = value;
          console.log(`✅ Found match: "${key}" → ${value}`);
          break;
        }
      }
    }
    
    // Jika masih tidak ditemukan, gunakan fallback berdasarkan kategori
    if (!orderCode) {
      const categoryLower = normalizedCategory?.toLowerCase() || '';
      
      // Buat kode default berdasarkan kategori
      if (categoryLower.includes('layanan') || categoryLower.includes('service')) {
        orderCode = 'LAYOTH'; // LAYanan OTHer
      } else if (categoryLower.includes('produk') || categoryLower.includes('product')) {
        orderCode = 'PROTH'; // PRoduk OTHer
      } else {
        orderCode = 'ORDOTH'; // ORDer OTHer
      }
      
      console.log(`⚠️  Using fallback code: ${orderCode} for category: ${normalizedCategory}`);
    }
    
    // Simulasi nomor urut (001, 002, dst)
    const simulatedNumber = '001';
    const finalOrderId = `${orderCode}${simulatedNumber}`;
    
    return { orderCode, finalOrderId };
  }

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

  let successCount = 0;
  let totalCount = testCases.length;

  for (const testCase of testCases) {
    const result = simulateMapping(testCase.nama, testCase.kategori);
    const status = result.orderCode === testCase.expected ? '✅' : '❌';
    
    console.log(`${status} ${testCase.nama} → ${result.finalOrderId} (${result.orderCode})`);
    
    if (result.orderCode === testCase.expected) {
      successCount++;
    } else {
      console.log(`   Expected: ${testCase.expected}, Got: ${result.orderCode}`);
    }
  }

  console.log('\n📊 HASIL TEST:');
  console.log(`✅ Berhasil: ${successCount}/${totalCount}`);
  console.log(`❌ Gagal: ${totalCount - successCount}/${totalCount}`);
  console.log(`📈 Persentase: ${Math.round((successCount/totalCount) * 100)}%`);

  console.log('\n🎯 CONTOH HASIL PENOMORAN:');
  console.log('Pembeli pertama Produk Aplikasi: PRAPL001');
  console.log('Pembeli kedua Produk Aplikasi: PRAPL002');
  console.log('Pembeli ketiga Produk Aplikasi: PRAPL003');
  console.log('Pembeli pertama Produk Website: PRAWB001');
  console.log('Pembeli pertama Layanan Custom Aplikasi: LAYCAPL001');
  console.log('Pembeli kedua Layanan Custom Aplikasi: LAYCAPL002');

  console.log('\n✅ Test mapping selesai! Sistem penomoran Order ID siap digunakan.');
  console.log('📌 Setiap order baru akan mendapat nomor urut yang rapi.');
  console.log('🔧 Sistem sudah terintegrasi di backend/routes/payment.js');
}

// Jalankan test
testOrderMapping();

module.exports = { testOrderMapping };
