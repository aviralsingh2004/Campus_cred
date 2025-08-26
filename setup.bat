@echo off
echo Setting up Campus Cred project...
echo.

echo Step 1: Install PostgreSQL if not already installed
echo - Download from https://www.postgresql.org/download/windows/
echo - Install and remember your password
echo - Default user is usually 'postgres'
echo.

echo Step 2: Create database
echo Run this SQL command in pgAdmin or psql:
echo CREATE DATABASE campus_cred;
echo.

echo Step 3: Update server/.env file with your PostgreSQL credentials
echo - DB_USER should be 'postgres' (or your username)
echo - DB_PASSWORD should be your PostgreSQL password
echo.

echo Step 4: Initialize database tables
cd server
echo Running database initialization...
node scripts/initDb.js
echo.

echo Step 5: Seed database with sample data (optional)
node scripts/seed.js
echo.

echo Step 6: Install dependencies (if not done already)
cd ..
npm run install-all
echo.

echo Setup complete! You can now run: npm run dev
pause
