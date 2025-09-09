const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`🔵 Network Interface: ${name}`);
        console.log(`📡 IP Address: ${iface.address}`);
        return iface.address;
      }
    }
  }

  return '192.168.1.4'; // Default fallback
}

const localIP = getLocalIPAddress();
console.log('\n✅ Use this IP address in your mobile app:');
console.log(`🔗 Socket.IO URL: http://${localIP}:5000`);
console.log(`🔗 API URL: http://${localIP}:5000/api`);

console.log('\n📝 Update the following files:');
console.log('1. src/services/api.js - COMPUTER_IP variable');
console.log('2. src/screens/ChatScreen.js - Socket.IO connection URL');
console.log('\n🏃‍♂️ Ready for real device testing!');
