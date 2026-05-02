<div align="center">

# ⚡ NexChat Neon

### A futuristic, cyberpunk-themed real-time chat application

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Pusher](https://img.shields.io/badge/Pusher-Channels-300D4F?style=for-the-badge&logo=pusher)](https://pusher.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

*Real-time messaging with a neon-lit, glassmorphism aesthetic*

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **Dual Authentication** | Google OAuth + Email/Password with OTP 2-Factor verification |
| ⚡ **Real-time Messaging** | Instant message delivery via Pusher Channels — no polling |
| 🟢 **Live Presence** | Online / Offline status via Pusher Presence Channels, synced across every UI panel simultaneously |
| ✍️ **Typing Indicators** | Live "X is typing…" shown in the chat header and message list |
| 🖼️ **Image & File Sharing** | Upload photos and PDFs — stored on Cloudinary, streamed via URL (respects Pusher's 10 KB event limit) |
| 🔒 **End-to-End Encrypted UI** | Messages marked with encryption badge in the chat window |
| 🎨 **Cyberpunk UI** | Glassmorphism panels, neon-cyan glow, hexagonal avatars, Orbitron font, animated circuit-board background |
| 📱 **Fully Responsive** | Mobile slide-in drawer, adaptive 3-column layout (sidebar / chat / contact panel) |
| 🚀 **Optimistic Updates** | Messages appear instantly with "sending…" status, confirmed to "sent" after DB write |

---

## 🛠️ Tech Stack

```
Frontend    Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion
Auth        NextAuth.js v4 · PrismaAdapter · Google OAuth · bcryptjs · Nodemailer OTP
Database    MongoDB Atlas · Prisma ORM
Real-time   Pusher Channels (Messages) · Pusher Presence (Online Status)
Storage     Cloudinary (Images & PDFs)
UI          Lucide React · react-hot-toast · Orbitron / Rajdhani fonts
```

---

## 📁 Project Structure

```
NexChat-Neon/
├── app/
│   ├── (auth)/              # Login, Register, Verify OTP, Forgot/Reset Password
│   ├── (main)/              # Conversations layout + chat pages
│   └── api/                 # REST API routes (auth, users, conversations, messages, upload, typing)
├── components/
│   ├── chat/                # ChatWindow, ChatInput, MessageBubble, ContactPanel
│   ├── cyber/               # CyberBackground, CyberCard, NeonInput, CyberButton
│   ├── layout/              # ConversationList (sidebar)
│   └── ui/                  # HexAvatar
├── context/
│   └── PresenceContext.tsx  # Shared Pusher Presence state (syncs sidebar + header)
├── lib/                     # prisma, authOptions, pusher, cloudinary, email, otp
├── prisma/
│   └── schema.prisma        # User, Account, Conversation, Message models
└── types/                   # Shared TypeScript types
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)
- A [Pusher](https://pusher.com/) account with one app (enable **Presence Channels** in App Settings)
- A [Cloudinary](https://cloudinary.com/) account
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for SMTP
- A [Google Cloud](https://console.cloud.google.com/) project with OAuth 2.0 credentials

---

### 1. Clone the repository

```bash
git clone https://github.com/Shafiqdeveloper786/NexChat-Neon.git
cd NexChat-Neon
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and replace every `YOUR_*` placeholder:

```env
DATABASE_URL="mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.xxxxx.mongodb.net/nexchat?appName=Cluster0"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET_MIN_32_CHARS"

GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

PUSHER_APP_ID="YOUR_PUSHER_APP_ID"
PUSHER_APP_KEY="YOUR_PUSHER_APP_KEY"
PUSHER_APP_SECRET="YOUR_PUSHER_APP_SECRET"
PUSHER_APP_CLUSTER="YOUR_PUSHER_CLUSTER"

NEXT_PUBLIC_PUSHER_APP_KEY="YOUR_PUSHER_APP_KEY"
NEXT_PUBLIC_PUSHER_APP_CLUSTER="YOUR_PUSHER_CLUSTER"

CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
CLOUDINARY_API_KEY="YOUR_CLOUDINARY_API_KEY"
CLOUDINARY_API_SECRET="YOUR_CLOUDINARY_API_SECRET"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="YOUR_GMAIL_APP_PASSWORD"
SMTP_FROM="NexChat Neon <your-gmail@gmail.com>"
```

> **Tip — generate `NEXTAUTH_SECRET`:**
> ```bash
> openssl rand -base64 32
> ```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Pusher Configuration

In your Pusher dashboard → **App Settings**, enable:

- ✅ **Client Events** — required for typing indicators
- ✅ **Presence Channels** — required for online/offline status

Set the **Auth Endpoint** in your app to `/api/pusher/auth`.

---

## 🔐 Auth Flows

```
Register   →  OTP email  →  Verify OTP  →  Auto sign-in  →  /conversations
Login      →  OTP email  →  Verify OTP  →  Auto sign-in  →  /conversations
Google     →  One click  →  /conversations
Forgot PW  →  OTP email  →  Verify OTP  →  Reset password page
```

---

## 📸 Screenshots

> _Add screenshots of your app here after deployment._

---

## 🌐 Deployment

This project is ready to deploy on **Vercel**:

1. Push to GitHub (see below)
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from your `.env` file in the Vercel dashboard
4. Set `NEXTAUTH_URL` to your production domain
5. Deploy

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)

---

<div align="center">
Built with ⚡ by <a href="https://github.com/Shafiqdeveloper786">Shafiqdeveloper786</a>
</div>
