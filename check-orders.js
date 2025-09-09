// Check all orders in database
const Order = require('./backend/models/order');

const checkOrders = async () => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    console.log('Latest orders in database:');
    orders.forEach(order => {
      console.log(
        `- ID: ${order.id}, OrderID: ${order.orderId}, Name: ${order.firstName} ${order.lastName}, Status: ${order.status}, Created: ${order.createdAt}`,
      );
    });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
  }
};

checkOrders();
