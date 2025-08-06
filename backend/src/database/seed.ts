import pool from './connection';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Seed users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await client.query(`
      INSERT INTO users (name, email, password, role, kitchen_code) VALUES
      ('Admin User', 'admin@restaurant.com', $1, 'admin', NULL),
      ('Kitchen Staff', 'kitchen@restaurant.com', $1, 'kitchen', 'MAIN_KITCHEN'),
      ('John Customer', 'john@example.com', $1, 'customer', NULL),
      ('Jane Customer', 'jane@example.com', $1, 'customer', NULL)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    // Seed menu items
    await client.query(`
      INSERT INTO menu_items (name, description, price, category, image, available) VALUES
      ('Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and fresh basil', 12.99, 'Pizza', 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', true),
      ('Pepperoni Pizza', 'Traditional pizza with pepperoni and mozzarella cheese', 14.99, 'Pizza', 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg', true),
      ('Chicken Caesar Salad', 'Fresh romaine lettuce with grilled chicken, parmesan, and caesar dressing', 10.99, 'Salads', 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg', true),
      ('Classic Burger', 'Beef patty with lettuce, tomato, onion, and our special sauce', 13.99, 'Burgers', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', true),
      ('Fish & Chips', 'Beer-battered cod with crispy fries and tartar sauce', 15.99, 'Main Course', 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg', true),
      ('Chocolate Cake', 'Rich chocolate cake with chocolate frosting', 6.99, 'Desserts', 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg', true),
      ('Pasta Carbonara', 'Creamy pasta with bacon, eggs, and parmesan cheese', 14.99, 'Pasta', 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', true),
      ('Greek Salad', 'Fresh vegetables with feta cheese and olive oil dressing', 9.99, 'Salads', 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg', true),
      ('Chicken Wings', 'Spicy buffalo wings with blue cheese dip', 11.99, 'Appetizers', 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg', true),
      ('Tiramisu', 'Classic Italian dessert with coffee and mascarpone', 7.99, 'Desserts', 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg', true)
      ON CONFLICT DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('Database seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedData };