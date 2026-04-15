# 🛡️ NoteVault
**Your Personal Second Brain for Coding & Interview Preparation.**

NoteVault is a high-performance, full-stack web application designed for developers to organize their technical knowledge. It goes beyond simple note-taking by providing specialized structures for Data Structures & Algorithms (DSA) problems, topic-wise Q&A, and interview revision—all wrapped in a clean, modern, and distraction-free UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-61DAFB?logo=react)
![Node](https://img.shields.io/badge/backend-Node.js-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248?logo=mongodb)
![Tailwind](https://img.shields.io/badge/styling-TailwindCSS-06B6D4?logo=tailwind-css)

---

## ✨ Key Features

### 🧠 Specialized Note Types
- **DSA Problem Tracker:** Specialized fields for Problem Pattern (Sliding Window, Two Pointers, etc.), Platform (LeetCode, GFG), Difficulty, Time/Space Complexity, and multi-language code snippets.
- **Topic-wise Q&A:** Perfect for conceptual theory, interview questions, and quick revisions.
- **Rich Content:** Support for Markdown rendering and syntax highlighting for multiple programming languages.

### 🛠️ Advanced Organization
- **Smart Filters:** Filter by Difficulty (Easy/Med/Hard), Platform, Category, or Favorites.
- **Global Search:** Instant search across titles, tags, and problem statements.
- **Dashboard:** At-a-glance view of total notes, recent activity, and key preparation metrics.

### 🔐 Security & UX
- **Secure Auth:** JWT-based authentication with protected routes.
- **Responsive Design:** Premium, card-based layout that works beautifully on Desktop, Tablet, and Mobile.
- **User Experience:** Toast notifications, delete confirmations, loading skeletons, and smooth transitions.

---

## 🚀 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Framer Motion (animations), Lucide React (icons).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (via Mongoose).
- **Authentication:** JWT (JSON Web Tokens) & BcryptJS.
- **Editor:** Markdown Support with Prism.js / React-Syntax-Highlighter.

---

## 📁 Project Structure

```text
NoteVault/
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components (Cards, Forms, Navbar)
│   │   ├── pages/         # Dashboard, Login, Note Detail, Editor
│   │   ├── context/       # Auth and Note State management
│   │   ├── hooks/         # Custom API hooks
│   │   └── utils/         # Markdown & Formatting helpers
├── server/                # Node.js Backend
│   ├── models/            # Mongoose Schemas (User, Note)
│   ├── routes/            # API Endpoints (Auth, Notes)
│   ├── controllers/       # Logic for API routes
│   ├── middleware/        # Auth guards and Error handling
│   └── config/            # Database connection
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/suraj2424/note-vault.git
cd note-vault
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend:
```bash
npm run dev
```

---

## 📝 API Endpoints

### Auth
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate & get token

### Notes
- `GET /api/notes` - Fetch all notes for the logged-in user (with query params for search/filter)
- `POST /api/notes` - Create a new structured note
- `GET /api/notes/:id` - Get details of a single note
- `PUT /api/notes/:id` - Update an existing note
- `DELETE /api/notes/:id` - Remove a note

---

## 📸 Screenshots
*(Add your screenshots here: Dashboard, DSA Note Form, and Note Detail View)*

---

## 💡 Future Enhancements
- [ ] **Auto-Save:** Draft system to prevent data loss during long entries.
- [ ] **Flashcards:** Space-repetition mode for Q&A notes.
- [ ] **LeetCode Sync:** Automatically fetch problem descriptions via URL.
- [ ] **Export to PDF:** Share your notes or save them offline.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## ✍️ Author
**Suraj Suryawanshi** - [GitHub](https://github.com/suraj2424) | [LinkedIn](https://linkedin.com/in/yourusername)