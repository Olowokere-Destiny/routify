# 🗺️ Routify

A modern, real-time GPS route tracking and mapping application built with Next.js. Create, save, and manage your routes with cloud sync capabilities.

## ✨ Features

- 📍 **Real-time GPS Tracking** - Track your current location and add waypoints
- 🗺️ **Interactive Map** - Built with Leaflet for smooth navigation
- 💾 **Dual Storage** - Save routes locally or sync to the cloud
- 🔐 **User Authentication** - Secure login with JWT tokens
- ↩️ **Undo/Redo** - Full history management for route editing
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Clean interface with Tailwind CSS and shadcn/ui

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd routify
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/routify

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Leaflet (Maps)
- Zustand (State Management)
- shadcn/ui (Components)

**Backend:**
- Next.js API Routes
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (Password Hashing)

## 📖 Usage

### Creating a Route

1. Click the **"Add Point"** button to start tracking
2. Your location will be added as a waypoint
3. Continue adding points to build your route
4. Points are automatically connected with a blue line

### Saving Routes

**Local Storage:**
1. Click the **Save** button
2. Enter a route name
3. Route is saved to your browser's localStorage

**Cloud Storage:**
1. Click the **Cloud** icon
2. Log in or create an account
3. Enter route name and save
4. Access your routes from any device

### Managing Routes

- **View Saved Routes** - Click the folder icon
- **Load Route** - Click "Load Route" on any saved route
- **Delete Route** - Click the trash icon
- **Undo/Redo** - Use arrow buttons to modify your route
- **Clear All** - Remove all points and start fresh

## 🔒 Security

- Passwords hashed with bcrypt
- JWT token authentication
- Rate limiting on API endpoints
- Secure HTTP-only practices

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ using Next.js and Leaflet