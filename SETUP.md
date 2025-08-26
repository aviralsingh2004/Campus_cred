# Campus Cred - Setup Guide

## Prerequisites

1. **Node.js** (version 16 or higher)
2. **PostgreSQL** (version 12 or higher)
3. **npm** or **yarn**

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (root, server, and client)
npm run install-all
```

### 2. Database Setup

1. **Start PostgreSQL** on your system
2. **Create a database:**
   ```sql
   CREATE DATABASE campus_cred;
   ```

### 3. Environment Configuration

Create a `.env` file in the `server` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_cred
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Client Configuration
CLIENT_URL=http://localhost:5173

# JWT Secret (generate a random string)
JWT_SECRET=campus_cred_secret_key_2024
```

**Important:** Replace `your_password_here` with your actual PostgreSQL password.

### 4. Initialize Database

```bash
cd server
node scripts/initDb.js
```

### 5. Run the Application

```bash
# Run both frontend and backend simultaneously
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## Project Structure

```
Campus_cred/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx   # Community posts/articles
│   │   │   ├── Points.jsx # Student points dashboard
│   │   │   ├── Rewards.jsx # Rewards catalog
│   │   │   ├── Login.jsx  # Authentication
│   │   │   └── Register.jsx
│   │   ├── components/    # Reusable components
│   │   └── context/       # React context
├── server/                # Node.js backend
│   ├── controllers/       # API controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── scripts/          # Database scripts
└── package.json          # Root package.json
```

## Features

### Student Features
- **Home Page**: View community posts, articles, and blogs from peers
- **Points Dashboard**: Track points balance, transactions, and earning opportunities
- **Rewards Catalog**: Browse and redeem points for rewards
- **Authentication**: Secure login and registration

### Admin Features (Coming Soon)
- Student management
- Points administration
- Reward management
- Transaction history

## Sample Data

The application includes sample data for:
- **Community Posts**: 6 example posts with different categories
- **Rewards**: 8 different reward types
- **User Points**: Mock data for demonstration

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your `.env` file configuration
- Verify database exists: `campus_cred`

### Port Conflicts
- Frontend: Change `CLIENT_URL` in `.env` if port 5173 is busy
- Backend: Change `PORT` in `.env` if port 5000 is busy

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json
npm run install-all
```

## Development

### Adding New Pages
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.jsx`
3. Update navigation in `client/src/components/layout/Layout.jsx`

### API Development
1. Add routes in `server/routes/`
2. Create controllers in `server/controllers/`
3. Update models in `server/models/`

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, PostgreSQL, JWT
- **Database**: PostgreSQL with pg library
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS with custom components
