# Food Ordering Web Platform - Frontend

A production-ready React frontend for a food ordering platform with role-based authentication supporting customers and kitchen staff.

## 🏗️ Architecture Overview

This frontend communicates with a backend via **JSON-RPC 2.0** over HTTP and **WebSockets** for real-time updates.

### Tech Stack
- **React 18** + Vite
- **TypeScript**
- **Tailwind CSS 3.4** (design system)
- **Redux Toolkit** (state management)
- **React Router** (routing)
- **Zod** (form validation)

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common business components
│   │   ├── Header.tsx
│   │   ├── CartSidebar.tsx
│   │   ├── MenuItemCard.tsx
│   │   └── ProtectedRoute.tsx
│   └── ui/              # Base UI components (shadcn/ui)
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ...
├── pages/               # Route components
│   ├── auth/           # Authentication pages
│   │   ├── Login.tsx
│   │   └── register/
│   │       ├── Customer.tsx
│   │       └── Kitchen.tsx
│   ├── customer/       # Customer-facing pages
│   │   ├── Menu.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   └── OrderTracking.tsx
│   ├── kitchen/        # Kitchen staff pages
│   │   └── Kitchen.tsx
│   ├── admin/          # Admin pages
│   │   └── Dashboard.tsx
│   └── common/         # Shared pages
│       ├── Index.tsx
│       ├── NotFound.tsx
│       └── Unauthorized.tsx
├── store/              # Redux state management
│   ├── store.ts        # Store configuration
│   └── slices/         # Redux slices
│       ├── authSlice.ts
│       ├── menuSlice.ts
│       ├── cartSlice.ts
│       ├── orderSlice.ts
│       └── kitchenSlice.ts
├── lib/                # Utilities and clients
│   ├── rpcClient.ts    # JSON-RPC 2.0 client
│   ├── socketClient.ts # WebSocket client
│   └── utils.ts        # Helper utilities
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   └── use-toast.ts    # Toast notifications
├── types/              # TypeScript definitions
│   └── api.ts          # API response types
└── styles/
    └── index.css       # Design system & global styles
```

---

## 🔌 Backend Integration

### Required Backend Endpoints (JSON-RPC 2.0)

The frontend expects a JSON-RPC 2.0 server running on `http://localhost:3001/rpc` (configurable).

#### Authentication Methods
```typescript
// User registration
auth.registerCustomer({ name, email, password }) → { token, user }
auth.registerKitchen({ name, email, password, kitchenCode? }) → { token, user }

// User authentication
auth.login({ email, password }) → { token, user }
auth.logout() → success

// User object structure
interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'kitchen' | 'admin';
  kitchenCode?: string;
}
```

#### Menu Methods
```typescript
menu.getMenu() → MenuItem[]
menu.getItem({ itemId }) → MenuItem

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}
```

#### Order Methods
```typescript
// Customer orders
orders.placeOrder({ items, customerInfo }) → Order
orders.getOrder({ orderId }) → Order
orders.getCustomerOrders() → Order[]

// Kitchen orders
kitchen.getOrders() → Order[]
orders.updateStatus({ orderId, status }) → Order

interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  total: number;
  createdAt: string;
  customerInfo: {
    name: string;
    phone: string;
    address?: string;
  };
}
```

#### Analytics Methods
```typescript
analytics.getDashboardStats() → {
  totalOrders: number;
  revenue: number;
  popularItems: MenuItem[];
  ordersToday: number;
}
```

### WebSocket Events

The frontend connects to WebSocket at `ws://localhost:3001` for real-time updates:

```typescript
// Client listens for:
'order_created'     → { order: Order }       // New order notification
'order_updated'     → { order: Order }       // Order status changed
'analytics_update'  → { stats: Analytics }   // Dashboard updates

// Client can emit:
'join_kitchen'      → { kitchenId: string }  // Join kitchen room
'join_customer'     → { customerId: string } // Join customer room
```

---

## 🚀 Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in the root directory:

```env
# API Configuration
VITE_RPC_BASE_URL=http://localhost:3001/rpc
VITE_WEBSOCKET_URL=ws://localhost:3001

# Optional: Custom branding
VITE_APP_NAME="Your Restaurant Name"
```

### RPC Client Configuration

The RPC client is configurable in `src/lib/rpcClient.ts`:

```typescript
// Change base URL
const rpcClient = new RpcClient('http://your-backend.com/rpc');
```

---

## 🎨 Design System

The app uses a food-themed design system with warm colors defined in `src/index.css`:

- **Primary**: Warm orange (#ea580c)
- **Secondary**: Rich amber tones
- **Background**: Gradient warm backgrounds
- **Text**: High contrast dark/light modes

### Customizing Colors

Update the CSS variables in `src/index.css`:

```css
:root {
  --primary: 22 93% 49%;        /* Orange HSL */
  --primary-foreground: 0 0% 98%;
  --secondary: 32 95% 44%;      /* Amber HSL */
  /* ... */
}
```

---

## 🔐 Authentication Flow

1. **User Registration**:
   - Customers: `/register/customer`
   - Kitchen Staff: `/register/kitchen`

2. **Login**: `/login`
   - Redirects based on role:
     - Customer → `/menu`
     - Kitchen → `/kitchen`
     - Admin → `/dashboard`

3. **Token Management**:
   - JWT stored in `localStorage`
   - Auto-refresh on page load
   - Protected routes redirect to `/login`

---

## 📱 User Flows

### Customer Journey
1. Register/Login → `/menu`
2. Browse menu, add items to cart
3. View cart → `/cart`
4. Proceed to checkout → `/checkout`
5. Place order → `/order/:id` (real-time tracking)

### Kitchen Staff Journey
1. Login → `/kitchen`
2. View incoming orders (real-time)
3. Update order status (pending → confirmed → preparing → ready → delivered)
4. View analytics → `/dashboard` (if admin)

---

## 🛠️ Backend Implementation Guide

### Recommended Tech Stack
- **Node.js** + Express/Fastify
- **Database**: PostgreSQL/MongoDB
- **Real-time**: Socket.io/native WebSockets
- **Authentication**: JWT

### Sample Backend Structure
```
backend/
├── src/
│   ├── rpc/            # JSON-RPC 2.0 handlers
│   │   ├── auth.ts
│   │   ├── menu.ts
│   │   ├── orders.ts
│   │   └── analytics.ts
│   ├── websocket/      # WebSocket handlers
│   ├── models/         # Database models
│   ├── middleware/     # Auth middleware
│   └── server.ts       # Main server
```

### Example RPC Handler
```typescript
// auth.ts
export const authHandlers = {
  'auth.login': async ({ email, password }) => {
    const user = await User.findByCredentials(email, password);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    return { user, token };
  },
  
  'auth.registerCustomer': async ({ name, email, password }) => {
    const user = await User.create({ name, email, password, role: 'customer' });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    return { user, token };
  }
};
```

---

## 🔄 State Management

The app uses Redux Toolkit with the following slices:

- **authSlice**: User authentication and session
- **menuSlice**: Menu items and categories
- **cartSlice**: Shopping cart management
- **orderSlice**: Order tracking and history
- **kitchenSlice**: Kitchen dashboard and order management

### Redux Persistence

Auth and cart state are persisted to localStorage using `redux-persist`.

---

## 🚢 Deployment

### Frontend Deployment
- **Vercel**: `vercel deploy`
- **Netlify**: Connect GitHub repo
- **Custom**: Build with `npm run build` and serve `dist/`

### Backend Requirements
- Ensure CORS is configured for your frontend domain
- WebSocket server must handle `socket.io` or native WebSocket connections
- Database migrations for User, Menu, Order models

---

## 📚 API Documentation

For detailed API documentation, refer to the RPC method signatures in `src/lib/rpcClient.ts`.

The frontend is designed to be backend-agnostic as long as the JSON-RPC 2.0 interface is implemented correctly.

---

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Follow the design system (use semantic tokens)
4. Add proper error handling
5. Update this README if adding new features

---

## 📞 Support

For questions about the frontend implementation, check the code comments in key files:
- `src/lib/rpcClient.ts` - API client implementation
- `src/store/slices/` - State management logic
- `src/components/ProtectedRoute.tsx` - Authentication routing