# Echo AI Frontend

A modern, responsive frontend for **Echo AI**, an AI-powered chat application built with **React**, **Vite**, and **Socket.IO**. It features secure authentication, real-time AI conversations, Markdown rendering, and a sleek glassmorphism-inspired dark UI.

---

## ✨ Features

- 🔐 User Authentication (Register & Login)
- 🤖 Real-time AI chat using Socket.IO
- 💬 Markdown support with GitHub Flavored Markdown (GFM)
- 📱 Fully responsive design
- 🎨 Modern glassmorphism UI with dark theme
- ⚡ Fast development with Vite
- 🍪 Cookie-based authentication
- 💾 Local storage support for chat history
- 🔒 Protected routes
- 🔔 Toast notifications
- 📝 Auto-resizing chat input

---

## 🛠️ Tech Stack

- **React 19**
- **Vite**
- **React Router DOM**
- **Socket.IO Client**
- **Axios**
- **React Markdown**
- **Remark GFM**
- **CSS Modules**

---

## 📂 Project Structure

```
src/
│
├── assets/                # Images, icons and static assets
│
├── components/            # Reusable UI Components
│   ├── Avatar
│   ├── Button
│   ├── ChatInput
│   ├── ChatMessage
│   ├── Loader
│   ├── Modal
│   ├── Navbar
│   ├── ProtectedRoute
│   ├── Sidebar
│   └── Toast
│
├── context/               # React Context Providers
│   ├── AuthContext
│   ├── ChatContext
│   ├── SocketContext
│   └── ToastContext
│
├── hooks/                 # Custom React Hooks
│
├── pages/                 # Application Pages
│   ├── LandingPage
│   ├── LoginPage
│   ├── RegisterPage
│   └── DashboardPage
│
├── services/              # API & Socket services
│
├── styles/                # Global Styles
│
├── utils/                 # Utility Functions
│
└── main.jsx
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ANANYA-160805/EchoAI.git
```

### 2. Navigate to the frontend

```bash
cd EchoAI/frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start development server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## 🔗 Backend

This frontend communicates with the Echo AI backend running at:

```
https://echoai-ua1s.onrender.com
```

Make sure the backend server is running before starting the frontend.

Backend API endpoints used:

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/chats` | Create a new chat |

### Socket Events

#### Client → Server

```
ai-message
```

```json
{
  "chat": "chatId",
  "content": "Hello AI"
}
```

#### Server → Client

```
ai-response
```

```json
{
  "chat": "chatId",
  "content": "AI Response"
}
```

---

## 💾 Chat History

Currently, the backend does not provide endpoints to fetch previous chats or messages.

To improve user experience, the frontend stores:

- Recent chats
- Chat messages

inside **localStorage**, scoped to the logged-in user.

Once backend endpoints such as:

```
GET /api/chats
GET /api/chats/:id/messages
```

are available, the local storage implementation can be replaced with API-based persistence.

---

## 🎨 Design

Echo AI follows a premium dark design language featuring:

- Dark Indigo Background
- Purple & Indigo Gradient Branding
- Glassmorphism UI
- Echo Ripple Logo
- Responsive Layout
- Smooth Animations

### Typography

- **Space Grotesk** — Headings
- **Inter** — Body Text
- **JetBrains Mono** — Code Blocks

---

## 📦 Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Preview the production build locally.

---

## 📸 Screenshots

Add screenshots of your application here.

```
Landing Page

Login

Register

Dashboard

Chat Interface
```

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add feature"
```

4. Push to your branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Ananya Sinha**

- GitHub: https://github.com/ANANYA-160805
- LinkedIn: https://www.linkedin.com/in/ananya-sinha/