# Food Ordering Platform - Backend

A production-ready Node.js backend for a food ordering platform with JSON-RPC 2.0 API and WebSocket real-time updates.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Setup PostgreSQL database:**
```bash
# Create database
createdb food_ordering

# Or using psql
psql -c "CREATE DATABASE food_ordering;"
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Initialize database:**
```bash
npm run migrate
npm run seed
```

5. **Start development server:**
```bash
npm run dev
```

The server will be running at:
- **RPC API:** http://localhost:3001/rpc
- **WebSocket:** ws://localhost:3001
- **Health Check:** http://localhost:3001/health

## 🏗 Architecture

### Tech Stack
- **Node.js** + **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Primary database
- **Socket.io** - Real-time WebSocket communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Input validation

### Project Structure
```
src/
├── database/           # Database connection & migrations
│   ├── connection.ts   # PostgreSQL connection pool
│   ├── migrate.ts      # Database schema migrations
│   └── seed.ts         # Initial data seeding
├── models/             # Data access layer
│   ├── User.ts         # User model & queries
│   ├── MenuItem.ts     # Menu item model & queries
│   ├── Order.ts        # Order model & queries
│   └── Analytics.ts    # Analytics queries
├── rpc/                # JSON-RPC 2.0 handlers
│   ├── auth.ts         # Authentication methods
│   ├── menu.ts         # Menu methods
│   ├── orders.ts       # Order methods
│   ├── kitchen.ts      # Kitchen staff methods
│   ├── analytics.ts    # Analytics methods
│   └── index.ts        # RPC request router
├── websocket/          # WebSocket event handlers
│   └── index.ts        # Socket.io setup & events
├── middleware/         # Express middleware
│   └── auth.ts         # JWT authentication
├── types/              # TypeScript definitions
│   └── index.ts        # Shared interfaces
└── server.ts           # Main application entry
```

## 📡 API Reference

### JSON-RPC 2.0 Endpoints

All requests to `/rpc` must follow JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "method": "method.name",
  "params": { ... },
  "id": 1
}
```

### Authentication Methods

#### Register Customer
```json
{
  "method": "auth.registerCustomer",
  "params": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
}
```

#### Register Kitchen Staff
```json
{
  "method": "auth.registerKitchen",
  "params": {
    "name": "Kitchen Staff",
    "email": "kitchen@restaurant.com",
    "password": "password123",
    "kitchenCode": "MAIN_KITCHEN"
  }
}
```

#### Login
```json
{
  "method": "auth.login",
  "params": {
    "email": "john@example.com",
    "password": "password123"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  },
  "id": 1
}
```

### Menu Methods

#### Get Menu
```json
{
  "method": "menu.getMenu"
}
```

#### Get Menu Item
```json
{
  "method": "menu.getItem",
  "params": {
    "itemId": "uuid"
  }
}
```

### Order Methods

#### Place Order (Requires Authentication)
```json
{
  "method": "orders.placeOrder",
  "params": {
    "items": [
      {
        "menuItemId": "uuid",
        "quantity": 2,
        "price": 12.99
      }
    ],
    "customerInfo": {
      "name": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St"
    }
  }
}
```

#### Get Order
```json
{
  "method": "orders.getOrder",
  "params": {
    "orderId": "uuid"
  }
}
```

#### Get Customer Orders
```json
{
  "method": "orders.getCustomerOrders"
}
```

#### Update Order Status (Kitchen/Admin only)
```json
{
  "method": "orders.updateStatus",
  "params": {
    "orderId": "uuid",
    "status": "confirmed"
  }
}
```

### Kitchen Methods

#### Get All Orders (Kitchen/Admin only)
```json
{
  "method": "kitchen.getOrders"
}
```

### Analytics Methods

#### Get Dashboard Stats (Admin/Kitchen only)
```json
{
  "method": "analytics.getDashboardStats"
}
```

## 🔌 WebSocket Events

Connect to `ws://localhost:3001` with authentication:

```javascript
const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events Received by Client

- **`order_created`** - New order placed
- **`order_updated`** - Order status changed
- **`analytics_update`** - Dashboard statistics updated

### Events Sent by Client

- **`join_kitchen`** - Join kitchen room for notifications
- **`join_customer`** - Join customer room for order updates

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('customer', 'kitchen', 'admin')),
  kitchen_code VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Menu Items Table
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image VARCHAR(500),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered')),
  total DECIMAL(10,2) NOT NULL,
  customer_info JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

### Protected Methods
All methods except the following require authentication:
- `auth.login`
- `auth.registerCustomer`
- `auth.registerKitchen`
- `menu.getMenu`
- `menu.getItem`

### Role-Based Access
- **Customer**: Can place orders, view own orders
- **Kitchen**: Can view all orders, update order status
- **Admin**: Full access to all methods

## 🚀 Production Deployment

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=food_ordering
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Server
PORT=3001
NODE_ENV=production

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

### Build & Start
```bash
npm run build
npm start
```

### Health Check
Monitor your deployment:
```bash
curl http://your-domain.com/health
```

## 🧪 Testing

### Test Seeded Data
The seed script creates:
- **Admin user**: admin@restaurant.com / password123
- **Kitchen user**: kitchen@restaurant.com / password123  
- **Customer users**: john@example.com, jane@example.com / password123
- **Sample menu items** in various categories

### Test RPC Calls
```bash
# Test login
curl -X POST http://localhost:3001/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "auth.login",
    "params": {
      "email": "john@example.com",
      "password": "password123"
    },
    "id": 1
  }'
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling with descriptive messages
3. Validate all inputs using Zod schemas
4. Update this README for new endpoints
5. Test WebSocket events end-to-end

## 📞 Support

Check the logs for detailed error information:
```bash
npm run dev
```

Common issues:
- **Database connection errors**: Verify PostgreSQL is running and credentials are correct
- **JWT errors**: Ensure JWT_SECRET is set in environment
- **CORS errors**: Update FRONTEND_URL in environment variables