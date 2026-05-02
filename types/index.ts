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

export type ChatConversation = {
  id:            string;
  name:          string | null;
  isGroup:       boolean;
  lastMessageAt: string;
  users:         ChatUser[];
  messages:      ChatMessage[];
};
