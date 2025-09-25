# Event Management System - MERN Stack

A comprehensive Event Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) for creating, managing, and attending events. This project is designed for interview preparation and showcases full-stack development skills.

## 🚀 Features

### User Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Event Discovery**: Browse and search events by category, date, and location
- **Event Registration**: Register for events with payment integration
- **User Dashboard**: Manage profile, view registered events, and track attendance
- **Membership System**: Different membership tiers (6 months, 1 year, 2 years)

### Admin Features
- **Admin Dashboard**: Complete overview of system statistics
- **Event Management**: Create, edit, delete, and monitor events
- **User Management**: Manage user accounts and memberships
- **Reports & Analytics**: Generate reports on events, users, and transactions
- **Transaction Management**: Monitor payments and financial data

### Technical Features
- **Responsive Design**: Mobile-first approach with Material-UI components
- **Real-time Updates**: Live event updates and notifications
- **Security**: Password hashing, JWT authentication, input validation
- **File Upload**: Event image upload functionality
- **Search & Filter**: Advanced search and filtering capabilities

## 🛠 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **multer** - File upload handling

### Frontend
- **React.js** - Frontend library
- **Material-UI (MUI)** - React UI framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **Context API** - State management

## 📁 Project Structure

```
Event Management System/
├── backend/
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── validation.js        # Input validation middleware
│   ├── models/
│   │   ├── User.js              # User schema and model
│   │   ├── Event.js             # Event schema and model
│   │   ├── Membership.js        # Membership schema and model
│   │   └── Transaction.js       # Transaction schema and model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management routes
│   │   ├── events.js            # Event management routes
│   │   ├── memberships.js       # Membership routes
│   │   ├── transactions.js      # Transaction routes
│   │   └── reports.js           # Reports and analytics routes
│   ├── package.json             # Backend dependencies
│   └── server.js                # Express server setup
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable components
│   │   │   └── layout/          # Layout components
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── pages/
│   │   │   ├── auth/            # Authentication pages
│   │   │   ├── dashboard/       # Dashboard pages
│   │   │   ├── events/          # Event-related pages
│   │   │   └── public/          # Public pages
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── theme/
│   │   │   └── theme.js         # Material-UI theme
│   │   ├── App.js               # Main App component
│   │   └── index.js             # React entry point
│   └── package.json             # Frontend dependencies
└── README.md                    # Project documentation
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Event Management System"
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/event-management
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   ```

5. **Start the Application**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Auth required)
- `PUT /api/events/:id` - Update event (Owner/Admin only)
- `DELETE /api/events/:id` - Delete event (Owner/Admin only)
- `POST /api/events/:id/register` - Register for event

### Memberships
- `GET /api/memberships` - Get membership plans
- `POST /api/memberships/purchase` - Purchase membership
- `GET /api/memberships/my-membership` - Get user membership

### Transactions
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/all` - Get all transactions (Admin only)
- `POST /api/transactions` - Create transaction

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics (Admin only)
- `GET /api/reports/events` - Event reports (Admin only)
- `GET /api/reports/users` - User reports (Admin only)

## 🔐 Authentication & Authorization

The application uses JWT (JSON Web Tokens) for authentication:

- **Public Routes**: Home, Events listing, Login, Register
- **Protected Routes**: Dashboard, Profile, Create Event
- **Admin Routes**: User management, Reports, All transactions

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Material-UI theming support
- **Smooth Animations**: Framer Motion animations for better UX
- **Loading States**: Loading spinners and skeleton screens
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client and server-side validation

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```
