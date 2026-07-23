# Echo AI — Frontend

A premium, dark-themed React frontend for the Echo AI chat app, built with Vite, React Router, and Socket.IO client.

## Stack

- React 19 + Vite
- React Router v6
- Socket.IO client
- Axios (cookie-based auth, `withCredentials: true`)
- `react-markdown` + `remark-gfm` for message rendering
- Plain CSS Modules — no Tailwind

## Getting started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and expects the backend at `http://localhost:3000` (see `src/services/axios.js` and `src/context/SocketContext.jsx` if that ever changes).

## Project structure

```
src/
  assets/
  components/        # Button, Input, Modal, Avatar, Loader, Toast, Sidebar,
                      # ChatMessage, ChatInput, Navbar, ProtectedRoute
  context/            # AuthContext, SocketContext, ChatContext, ToastContext
  hooks/              # useAutosizeTextarea, useClickOutside, barrel exports
  pages/              # LandingPage, LoginPage, RegisterPage, DashboardPage
  services/           # axios instance, auth.service, chat.service
  styles/             # global tokens (index.css), shared AuthPage styles
  utils/              # formatDate, cx (classnames)
```

## Backend contract this frontend was built against

- `POST /api/auth/register` — `{ fullName: { firstName, lastName }, email, password }`
- `POST /api/auth/login` — `{ email, password }`, sets an HttpOnly `token` cookie
- `POST /api/chats` — `{ title }`, returns the created chat
- Socket.IO, cookie-authenticated:
  - emit `ai-message` → `{ chat, content }`
  - listen `ai-response` → `{ chat, content }` or `{ error }`

### A note on chat history

The backend currently exposes no endpoint to **list** a user's chats or **fetch** a chat's past messages — only chat creation and the live socket exchange. So the sidebar's "Recent chats" list and each chat's message history are cached in the browser's `localStorage`, scoped per logged-in user id. They'll survive refreshes on the same browser, but not a login from a new device until the backend adds `GET /api/chats` and `GET /api/chats/:id/messages` (or similar) — at which point swap the loading logic in `ChatContext.jsx` for real fetches.

## Design system

Dark indigo/violet base (`#07070d` background) with an indigo-to-purple brand gradient, glassmorphism surfaces (blurred translucent panels), and an "echo rings" motif — concentric ripples — used in the logo, loaders, and hero background, echoing the product name.

Typography: **Space Grotesk** for display/headings, **Inter** for body text, **JetBrains Mono** for code.
