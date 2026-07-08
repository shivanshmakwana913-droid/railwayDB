# 🚆 Vande Bharat Hub — Next-Gen Railway Ticket Booking Portal

An ultra-modern, glassmorphic dashboard for booking and managing railway travel tickets. Built as a full-stack JavaScript application utilizing a Node/Express backend with Mongoose validation rules, and a clean, responsive front-end dashboard themed with cyber-midnight accents (neon cyan, orange, and active alert systems).

---

## ✨ Features

- **📺 Cyberpunk-Midnight User Console**: Sleek panels using raw CSS variables, glassmorphic backdrops (`backdrop-filter`), hover actions, and custom font sets.
- **🔄 Station Router Swap**: Quick interface button that visually spins and swaps Source and Destination stations.
- **🗓️ Smart Date Constraints**: Automatic frontend validation locks date selection to future days from tomorrow onwards, preventing database-level schematics errors.
- **🎫 Skeuomorphic E-Tickets**: Departures are rendered as passenger boarding passes, complete with simulated barcodes, passenger metadata, perforation ticket cutouts, and neon border lights.
- **📊 Real-time Dashboard Analytics**: Instant widget updates tracking total ticket reservations pulled via live database aggregation.
- **🔍 Flight-Board Filtering**: Live station query filters, pagination indexing (5 items per page), and skeleton loaders during network latency.
- **❌ Per-Ticket Cancellation**: Custom warning overlay confirmation modals, giving the passenger full capability to delete/refund bookings via API.

---

## 🛠️ Technology Stack

- **Frontend**: 
  - Standard HTML5 & Semantic Elements
  - Vanilla CSS3 with Custom Variables, Keyframe Animations, Gradients, and Glassmorphism
  - JavaScript (ES6+ Fetch APIs, DOM manipulation)
  - Layout icons powered by FontAwesome
- **Backend**:
  - Node.js & Express.js
  - RESTful Routing (GET, POST, DELETE endpoints)
  - CORS Middleware & Centralized Error Handlers
- **Database**:
  - MongoDB
  - Mongoose ODM (Validations: Name length $\ge 3$, Age $\ge 5$, Future trip dates)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/) server running locally or a remote MongoDB Atlas database string.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shivanshmakwana913-droid/railwayDB.git
   cd railwayDB
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Verify the environment variables**:
   Create a `.env` file in the root directory (it is ignored by git to keep credentials safe):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/railwayDB
   ```

4. **Boot up the server**:
   Start the application in development mode with auto-reloads (via nodemon):
   ```bash
   npm run dev
   ```

5. **Aboard the Portal**:
   Launch the web environment by visiting:
   ```
   http://localhost:5000
   ```

---

## 🔌 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/bookings` | Retrieve paginated bookings (supports `source` and `desitination` query filter params). |
| **GET** | `/api/bookings/stats/overview` | Fetch live reservation stats (total booking count). |
| **POST** | `/api/bookings` | Create a new ticket booking (performs mongoose checks). |
| **DELETE** | `/api/bookings/:id` | Cancel/remove a ticket by its ID. |

---

## 👤 Author

- **Shivansh Makwana** - [GitHub Profile](https://github.com/shivanshmakwana913-droid)
