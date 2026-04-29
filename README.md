# InternTrack Pro 🚀

A production-ready Internship Management System built with the MERN stack (MongoDB, Express, React, Node.js) and Next.js.

![Dashboard Preview](https://via.placeholder.com/1000x500?text=InternTrack+Pro+Dashboard)

## 🌟 Features
- **Clean Dashboard:** Visualize applications, success rates, and upcoming follow-ups.
- **Kanban Board:** Drag and drop applications through different stages (Applied, Interview, Offer, Rejected).
- **Authentication:** Secure JWT-based authentication with password hashing.
- **Role-Based Access Control:** Differentiate between standard students and administrators.
- **Advanced Security:** Rate limiting, NoSQL injection prevention, and secure HTTP headers.
- **Responsive UI:** Dark-mode tailored, modern glassmorphism design.

## 🛠 Tech Stack
- **Frontend:** Next.js 14, React 18, Tailwind CSS, Zustand (State Management), Recharts.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose ODM).
- **Security:** Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, Bcryptjs, JWT.

## 📁 Project Structure (Clean Architecture)
```text
interntrack-pro/
├── backend/
│   ├── controllers/      # Business logic handlers
│   ├── middleware/       # Custom auth, error, and validation middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express route definitions
│   ├── utils/            # Helper classes (AppError)
│   └── server.js         # Entry point & security setup
├── frontend/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   ├── lib/              # API clients and Zustand store
```

## 🚀 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/interntrack-pro.git
cd interntrack-pro
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB URI and JWT Secret in the .env file
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open in Browser
Visit `http://localhost:3000` to see the application running.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user profile (Protected)

### Applications (Protected)
- `GET /api/applications` - Get all applications (supports `?status=`, `?search=`, `?page=`)
- `POST /api/applications` - Add new application
- `PUT /api/applications/:id` - Update application details
- `DELETE /api/applications/:id` - Delete an application
- `PATCH /api/applications/:id/status` - Quick status update (for Kanban)

### Analytics (Protected)
- `GET /api/stats` - Retrieve dashboard charts and success metrics

## 🛡️ Security Measures
- **Helmet:** Sets 14 various HTTP headers to secure the Express app.
- **Mongo-Sanitize:** Prevents NoSQL injection attacks.
- **Rate-Limiter:** Limits repeated requests to public APIs.
- **JWT:** Stateless secure authentication.
- **Global Error Handling:** Prevents stack traces from leaking in production mode.

---
*Built as a showcase of modern full-stack engineering best practices.*
