import { useState, useRef, useEffect } from 'react';
import { Chat, Message, User } from '@/types/messenger';
import Icon from '@/components/ui/icon';

interface ChatViewProps {
  chat: Chat | null;
  user: User;
  onBack?: () => void;
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
  const idx = id.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

export default function ChatView({ chat, user, onBack, onSendMessage }: ChatViewProps) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center"
        style={{ background: 'hsl(var(--background))' }}>
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-float">💬</div>
          <h3 className="text-xl font-semibold font-golos gradient-text mb-2">Выберите чат</h3>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Начните общение или выберите существующий чат
          </p>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(chat.id, text.trim());
    setText('');
  };

  return (
    <div className="flex-1 flex flex-col h-screen" style={{ background: 'hsl(var(--background))' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 glass border-b"
        style={{ borderColor: 'hsl(var(--border) / 0.5)' }}>
        {onBack && (
          <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-secondary/60 transition-colors mr-1">
            <Icon name="ArrowLeft" size={20} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </button>
        )}
        <div className="relative">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: getColor(chat.id) }}>
            {chat.isGroup ? '👥' : getInitials(chat.name)}
          </div>
          {chat.online && <div className="online-dot absolute bottom-0 right-0" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate text-white">{chat.name}</h3>
          <p className="text-xs" style={{ color: chat.online ? 'hsl(var(--neon-green))' : 'hsl(var(--muted-foreground))' }}>
            {chat.online ? 'онлайн' : 'был(а) давно'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl hover:bg-secondary/60 transition-colors">
            <Icon name="Phone" size={18} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </button>
          <button className="p-2 rounded-xl hover:bg-secondary/60 transition-colors">
            <Icon name="Video" size={18} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </button>
          <button className="p-2 rounded-xl hover:bg-secondary/60 transition-colors">
            <Icon name="MoreVertical" size={18} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {chat.messages.map((msg, i) => {
          const isMe = msg.senderId === 'me';
          return (
            <div key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${i * 0.04}s` }}>
              <div className={`max-w-[70%] px-4 py-2.5 text-sm ${isMe ? 'bubble-out' : 'bubble-in'}`}>
                <p className="leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] opacity-60">{msg.time}</span>
                  {isMe && (
                    <Icon name={msg.read ? 'CheckCheck' : 'Check'} size={12}
                      style={{ color: msg.read ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.5)' }} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 glass border-t" style={{ borderColor: 'hsl(var(--border) / 0.5)' }}>
        <div className="flex items-end gap-2">
          <button className="p-2.5 rounded-xl hover:bg-secondary/60 transition-colors flex-shrink-0">
            <Icon name="Paperclip" size={20} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </button>
          <div className="flex-1 relative">
            <textarea
              className="input-glass w-full px-4 py-2.5 text-sm resize-none min-h-[42px] max-h-[120px] leading-relaxed"
              placeholder="Написать сообщение..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />
          </div>
          <button className="p-2.5 rounded-xl flex-shrink-0 transition-all hover:scale-105"
            style={{
              background: text.trim()
                ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
                : 'hsl(var(--secondary))',
              boxShadow: text.trim() ? '0 0 20px hsl(var(--primary) / 0.4)' : 'none'
            }}
            onClick={handleSend}>
            <Icon name="Send" size={18} style={{ color: text.trim() ? 'white' : 'hsl(var(--muted-foreground))' }} />
          </button>
        </div>
      </div>
    </div>
  );
}