export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  online: boolean;
  lastSeen?: string;
  role?: 'admin' | 'moderator' | 'user';
  banned?: boolean;
  banReason?: string;
  banUntil?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  time: string;
  read: boolean;
  type: 'text' | 'image';
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  isGroup?: boolean;
  members?: string[];
  messages: Message[];
}

export interface Contact {
  id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  avatar?: string;
  online: boolean;
  lastSeen?: string;
  role?: 'admin' | 'moderator' | 'user';
  banned?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  subscribers: number;
  lastPost: string;
  lastTime: string;
  unread: number;
  verified?: boolean;
  messages: Message[];
  ownerId?: string;
}

export type AppScreen = 'auth' | 'chats' | 'channels' | 'contacts' | 'search' | 'profile' | 'admin';
