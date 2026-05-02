import { Conversation, Message, User } from "@prisma/client";

/* ── Prisma full types (server-side) ───────────────────────────────────── */
export type FullMessageType = Message & {
  sender: User;
  seen:   User[];
};

export type FullConversationType = Conversation & {
  users:    User[];
  messages: FullMessageType[];
};

/* ── Lightweight client-safe types ─────────────────────────────────────── */
export type ChatUser = {
  id:       string;
  name:     string | null;
  email:    string;
  image:    string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
};

export type ChatMessage = {
  id:        string;
  body:      string | null;
  image:     string | null;
  fileUrl:   string | null;
  fileType:  string | null;
  createdAt: string;
  sender:    ChatUser;
};

/* Last-message shape returned inside the conversation list */
export type ChatLastMessage = {
  body:      string | null;
  image:     string | null;
  fileType:  string | null;
  createdAt: string;
  sender:    { id: string; name: string | null };
};

export type ChatConversation = {
  id:            string;
  name:          string | null;
  isGroup:       boolean;
  lastMessageAt: string;
  users:         ChatUser[];
  messages:      ChatMessage[];
  /* Notification fields — populated by GET /api/conversations */
  unreadCount:   number;
  lastMessage:   ChatLastMessage | null;
};

/* Pusher private-channel notification payload */
export type MessageNotification = {
  conversationId: string;
  message:        ChatLastMessage & { senderId: string };
};
