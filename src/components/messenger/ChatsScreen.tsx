import { useState } from 'react';
import { Chat, User } from '@/types/messenger';
import ChatView from './ChatView';
import Icon from '@/components/ui/icon';

interface ChatsScreenProps {
  chats: Chat[];
  user: User;
  onSendMessage: (chatId: string, text: string) => void;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = [
  'linear-gradient(135deg, hsl(260 80% 65%), hsl(195 90% 55%))',
  'linear-gradient(135deg, hsl(320 85% 65%), hsl(260 80% 65%))',
  'linear-gradient(135deg, hsl(195 90% 55%), hsl(145 80% 50%))',
  'linear-gradient(135deg, hsl(30 90% 60%), hsl(320 85% 65%))',
];
function getColor(id: string) {
  return avatarColors[id.charCodeAt(0) % avatarColors.length];
}

export default function ChatsScreen({ chats, user, onSendMessage }: ChatsScreenProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [search, setSearch] = useState('');

  const filtered = chats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 h-screen overflow-hidden">
      {/* List panel */}
      <div className="w-80 flex flex-col h-full border-r" style={{ borderColor: 'hsl(var(--border) / 0.5)', background: 'hsl(var(--card) / 0.5)' }}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-golos text-white">Чаты</h2>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}>
              <Icon name="Plus" size={18} className="text-white" />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'hsl(var(--muted-foreground))' }} />
            <input
              className="input-glass w-full pl-9 pr-4 py-2.5 text-sm"
              placeholder="Поиск чатов..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Чаты не найдены</p>
            </div>
          )}
          {filtered.map((chat, i) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`chat-item w-full flex items-center gap-3 px-3 py-3 mb-0.5 text-left animate-fade-in ${selectedChat?.id === chat.id ? 'nav-active' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: getColor(chat.id) }}>
                  {chat.isGroup ? '👥' : getInitials(chat.name)}
                </div>
                {chat.online && <div className="online-dot absolute bottom-0 right-0" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-sm truncate text-white">{chat.name}</span>
                  <span className="text-[11px] flex-shrink-0 ml-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {chat.lastTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs truncate flex-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {chat.lastMessage}
                  </span>
                  {chat.unread > 0 && (
                    <span className="notif-badge ml-2 flex-shrink-0">{chat.unread}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat view */}
      <ChatView
        chat={selectedChat}
        user={user}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}
