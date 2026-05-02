export type MockConversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  isOnline: boolean;
  unread: number;
  initials: string;
  gradient: string;
};

export type MockMessage = {
  id: string;
  body: string;
  senderId: "me" | "other";
  time: string;
};

export const mockConversations: MockConversation[] = [
  { id: "1", name: "Ayesha Khan",  lastMessage: "See you soon!",         time: "2m",  isOnline: true,  unread: 3, initials: "AK", gradient: "from-[#00F2FF] to-[#7000FF]" },
  { id: "2", name: "Reza Moradi",  lastMessage: "Can we reschedule?",    time: "15m", isOnline: false, unread: 0, initials: "RM", gradient: "from-[#FF2D78] to-[#7000FF]" },
  { id: "3", name: "Sofia Reyes",  lastMessage: "The build is passing ✓", time: "1h",  isOnline: true,  unread: 1, initials: "SR", gradient: "from-[#7000FF] to-[#00F2FF]" },
  { id: "4", name: "Dev Team",     lastMessage: "PR reviewed — merge?",  time: "3h",  isOnline: false, unread: 7, initials: "DT", gradient: "from-[#00F2FF] to-[#FF2D78]" },
  { id: "5", name: "Kai Nakamura", lastMessage: "On my way",             time: "5h",  isOnline: true,  unread: 0, initials: "KN", gradient: "from-[#FF2D78] to-[#00F2FF]" },
  { id: "6", name: "Lena Müller",  lastMessage: "Sent you the files",    time: "1d",  isOnline: false, unread: 0, initials: "LM", gradient: "from-[#7000FF] to-[#FF2D78]" },
];

export const mockMessages: MockMessage[] = [
  { id: "1",  body: "Hey! Have you finished the new dashboard?",    senderId: "other", time: "10:21 AM" },
  { id: "2",  body: "Almost done — just wiring up Pusher now.",     senderId: "me",    time: "10:22 AM" },
  { id: "3",  body: "Looks amazing from the screenshot 🔥",         senderId: "other", time: "10:23 AM" },
  { id: "4",  body: "Thanks! The glassmorphism came out really well.", senderId: "me",  time: "10:24 AM" },
  { id: "5",  body: "Can you share the live preview link?",         senderId: "other", time: "10:25 AM" },
  { id: "6",  body: "localhost:3000 — I'll deploy it this evening.", senderId: "me",   time: "10:26 AM" },
  { id: "7",  body: "Perfect. See you at standup 👾",               senderId: "other", time: "10:27 AM" },
  { id: "8",  body: "See you soon!",                                senderId: "me",    time: "10:28 AM" },
];
