# Hypixel Skyblock Tracker

Welcome to our Hypixel Skyblock Tracker React project. This has been a passionate project for us where we have combined gaming and web development.

## What is this site about?

This web app lets you browse through **over 5,000 Hypixel Skyblock items**, search for whatever item you need, filter by rarity/category/type, and even save your favorite items if you create an account.

## Features

- **Massive Item Database**: Every item from the Hypixel Skyblock API, complete with images, stats, and rarity colors

- **Smart Search & Filtering**: Find exactly what you're looking for in seconds
- **Meaningful Animations**: Purple and magenta gradients, floating bubbles in the background, and smooth hover effects
- **Favorites System**: Log in to save your favorite items, useful for tracking what you're working towards
- **Current Mayor Info**: The sidebar shows who's in office and their perks, plus a countdown to the next election
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

**Frontend:**
- React 19 with Vite
- React Router for navigation
- Bootstrap 5 for the layout structure
- Custom CSS for gradients and animations

**Backend:**
- Node.js + Express API
- Azure SQL Database
- bcrypt for password hashing
- Custom favorites system

**APIs:**
- **Hypixel API** for all the Skyblock items
- **Minecraft API** for item images
- **Various fallbacks** for texture loading

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- An Azure SQL database

### Installation

1. **Clone this repo:**
   ```bash
   git clone https://github.com/your-username/React-API.git
   cd React-API
   ```

2. **Install frontend dependencies:**
    ```bash
    cd hypixel-app
    npm install
    ```

3. **Install backend dependencies:**
    ```bash
    cd ../server
    npm install
    ```

4. **Set up your environment variables:**
    Copy .env.example to .env
    Fill in your Azure SQL credentials

    ```bash
    AZURE_SQL_SERVER=your-server.database.windows.net
    AZURE_SQL_DATABASE=your-db-name
    AZURE_SQL_USER=your-username
    AZURE_SQL_PASSWORD=your-password
    PORT=3001
    ```

5. **Start the backend:**
    ```bash 
    cd server
    npm run dev
    ```

6. **Start the frontend (in a new terminal):**
    ```bash
    cd hypixel-app
    npm run dev 
    ```

7. **Open your browser: Navigate to http://localhost:5173**