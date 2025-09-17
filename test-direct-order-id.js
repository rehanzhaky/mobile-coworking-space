// Direct test untuk generateOrderId function
const { generateOrderId } = require('./backend/utils/orderIdGenerator');

async function testDirectOrderId() {
  console.log('🔧 Direct Order ID Generation Test\n');
  console.log('=' .repeat(50));

  try {
    console.log('\n📋 Testing dengan "Aplikasi Absensi", "Produk"...');
    
    const orderId = await generateOrderId('Aplikasi Absensi', 'Produk');
    
    console.log('\n🎯 Result:', orderId);
    
    if (orderId.startsWith('PRAPL')) {
      console.log('✅ SUCCESS: Structured format PRAPL used');
    } else if (orderId.startsWith('PROTH')) {
      console.log('✅ SUCCESS: Structured format PROTH used');
    } else if (orderId.startsWith('ORDER-')) {
      console.log('❌ FAILED: Fallback format used');
    } else {
      console.log('⚠️  UNKNOWN: Unexpected format');
    }

  } catch (error) {
    console.log('❌ Error during test:', error.message);
    console.log('❌ Stack:', error.stack);
  }

  console.log('\n🔍 Testing different product names...');
  
  const testCases = [
    { name: 'Aplikasi Absensi', category: 'Produk', expected: 'PRAPL' },
    { name: 'Aplikasi Data Relawan', category: 'Produk', expected: 'PRAPL' },
    { name: 'Produk Aplikasi', category: 'Produk', expected: 'PRAPL' },
    { name: 'Unknown Product', category: 'Produk', expected: 'PROTH' },
    { name: 'Test Service', category: 'Layanan', expected: 'LAYOTH' }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📝 Testing: "${testCase.name}" (${testCase.category})`);
      const result = await generateOrderId(testCase.name, testCase.category);
      const isCorrect = result.startsWith(testCase.expected);
      
      console.log(`   Result: ${result}`);
      console.log(`   Expected prefix: ${testCase.expected}`);
      console.log(`   Status: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  console.log('\n✅ Direct test completed!');
}

testDirectOrderId().catch(console.error);
