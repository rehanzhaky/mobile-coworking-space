// Test dashboard integration with admin status from pesanan page
const axios = require('axios');

async function testDashboardAdminStatus() {
  try {
    console.log('🔧 Testing Dashboard Admin Status Integration');
    console.log('============================================================\n');

    // Step 1: Get current dashboard data
    console.log('📋 Step 1: Getting current dashboard data...');
    
    const dashboardResponse = await axios.get('http://localhost:5000/api/payment/orders/dashboard');
    
    if (dashboardResponse.data.success) {
      console.log('✅ Dashboard data retrieved successfully');
      console.log(`📊 Total transactions: ${dashboardResponse.data.transactions.length}`);
      
      // Show current status distribution
      const statusCounts = {};
      dashboardResponse.data.transactions.forEach(transaction => {
        statusCounts[transaction.status] = (statusCounts[transaction.status] || 0) + 1;
      });
      
      console.log('\n📊 Current Status Distribution in Dashboard:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} orders`);
      });
      
      // Find orders with admin status
      const ordersWithAdminStatus = dashboardResponse.data.transactions.filter(t => t.adminStatus);
      console.log(`\n🔍 Orders with admin status: ${ordersWithAdminStatus.length}`);
      
      if (ordersWithAdminStatus.length > 0) {
        console.log('\n📋 Orders with Admin Status:');
        ordersWithAdminStatus.forEach(order => {
          console.log(`   Order ${order.orderId}:`);
          console.log(`     Display Status: ${order.status}`);
          console.log(`     Admin Status: ${order.adminStatus}`);
          console.log(`     Raw Status: ${order.rawStatus}`);
          console.log(`     Payment Status: ${order.rawPaymentStatus}`);
        });
      }
      
    } else {
      console.log('❌ Failed to get dashboard data:', dashboardResponse.data.message);
    }

    // Step 2: Get pesanan data for comparison
    console.log('\n📋 Step 2: Getting pesanan data for comparison...');
    
    const pesananResponse = await axios.get('http://localhost:5000/api/payment/orders/pesanan');
    
    if (pesananResponse.data.success) {
      console.log('✅ Pesanan data retrieved successfully');
      console.log(`📊 Total paid orders: ${pesananResponse.data.orders.length}`);
      
      // Show admin status distribution in pesanan
      const pesananStatusCounts = {};
      pesananResponse.data.orders.forEach(order => {
        pesananStatusCounts[order.status] = (pesananStatusCounts[order.status] || 0) + 1;
      });
      
      console.log('\n📊 Admin Status Distribution in Pesanan:');
      Object.entries(pesananStatusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} orders`);
      });
      
      // Find matching orders between dashboard and pesanan
      console.log('\n🔍 Checking status consistency between Dashboard and Pesanan...');
      
      const dashboardOrders = dashboardResponse.data.transactions;
      const pesananOrders = pesananResponse.data.orders;
      
      let consistentCount = 0;
      let inconsistentCount = 0;
      
      pesananOrders.forEach(pesananOrder => {
        const dashboardOrder = dashboardOrders.find(d => d.orderId === pesananOrder.orderId);
        
        if (dashboardOrder) {
          const pesananStatus = pesananOrder.status;
          const dashboardStatus = dashboardOrder.status;
          
          // Map status for comparison
          const mapStatus = (status) => {
            switch (status) {
              case 'selesai': return 'Selesai';
              case 'sedang diproses': return 'Sedang Diproses';
              case 'belum diproses': return 'Belum Diproses';
              default: return status;
            }
          };
          
          const mappedPesananStatus = mapStatus(pesananStatus);
          
          if (mappedPesananStatus === dashboardStatus) {
            consistentCount++;
            console.log(`   ✅ ${pesananOrder.orderId}: ${mappedPesananStatus} (consistent)`);
          } else {
            inconsistentCount++;
            console.log(`   ❌ ${pesananOrder.orderId}: Pesanan="${mappedPesananStatus}" vs Dashboard="${dashboardStatus}" (inconsistent)`);
          }
        }
      });
      
      console.log(`\n📊 Status Consistency Results:`);
      console.log(`   ✅ Consistent: ${consistentCount} orders`);
      console.log(`   ❌ Inconsistent: ${inconsistentCount} orders`);
      
      if (inconsistentCount === 0) {
        console.log('\n🎉 SUCCESS: All statuses are consistent between Dashboard and Pesanan!');
      } else {
        console.log('\n⚠️  WARNING: Some statuses are inconsistent. Dashboard should use admin status from Pesanan.');
      }
      
    } else {
      console.log('❌ Failed to get pesanan data:', pesananResponse.data.message);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('✅ What should happen:');
    console.log('   1. Dashboard "Sedang Diproses" count should match admin status from Pesanan page');
    console.log('   2. When admin changes status in Pesanan, Dashboard should reflect the change');
    console.log('   3. Admin status takes priority over automatic payment status logic');
    
    console.log('\n🔍 How to verify:');
    console.log('   1. Go to http://localhost:5173/aadmin/pesanan');
    console.log('   2. Change an order status to "Sedang Diproses"');
    console.log('   3. Go to http://localhost:5173/aadmin/dashboard');
    console.log('   4. Check that "Sedang Diproses" count includes the changed order');
    
    console.log('\n📱 Expected Behavior:');
    console.log('   - Dashboard section "Sedang Diproses" = Orders with admin_status "sedang diproses"');
    console.log('   - Admin can control order status from Pesanan page');
    console.log('   - Dashboard reflects admin decisions, not just payment status');
    
    console.log('\n✅ Dashboard admin status integration test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDashboardAdminStatus();
