const mysql = require('mysql2/promise');

async function addTestProduct() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'mobile_coworking_space'
    });

    await connection.execute(`
      INSERT INTO products (name, category, price, description, imageUrl) 
      VALUES ('Test Produk Baru', 'layanan', 75000, 'Produk test untuk notifikasi', 'https://via.placeholder.com/300')
    `);

    console.log('✅ Test product added successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Error adding product:', error);
  }
}

addTestProduct();