import { useState, useRef, useEffect } from 'react';
import { Chat, User } from '@/types/messenger';
import Icon from '@/components/ui/icon';
import StickerPicker from './StickerPicker';
import StarsModal from './StarsModal';
import CallScreen from './CallScreen';
import { playMessageSound } from '@/lib/sounds';

interface ChatViewProps {
  chat: Chat | null;
  user: User;
  onBack?: () => void;
  onSendMessage: (chatId: string, text: string) => void;
  starBalance: number;
  onSpendStars: (amount: number) => void;
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

export default function ChatView({ chat, user, onBack, onSendMessage, starBalance, onSpendStars }: ChatViewProps) {
  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [messageReactions, setMessageReactions] = useState<Record<string, string[]>>({});
  const [showReactionFor, setShowReactionFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Close sticker picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (stickerRef.current && !stickerRef.current.contains(e.target as Node)) {
        setShowStickers(false);
      }
    };
    if (showStickers) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStickers]);

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

  const handleSend = (msg?: string) => {
    const content = msg ?? text.trim();
    if (!content) return;
    onSendMessage(chat.id, content);
    playMessageSound();
    setText('');
    setShowStickers(false);
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setMessageReactions(prev => {
      const cur = prev[msgId] || [];
      const already = cur.includes(emoji);
      return {
        ...prev,
        [msgId]: already ? cur.filter(e => e !== emoji) : [...cur, emoji],
      };
    });
    setShowReactionFor(null);
  };

  const quickReactions = ['❤️', '😂', '👍', '🔥', '😮', '💯'];

  return (
    <>
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
            {/* Stars button */}
            <button onClick={() => setShowStars(true)}
              className="p-2 rounded-xl hover:bg-secondary/60 transition-colors flex items-center gap-1"
              title="Отправить звёзды">
              <span className="text-base leading-none">⭐</span>
            </button>
            {/* Call button */}
            <button onClick={() => setShowCall(true)}
              className="p-2 rounded-xl hover:bg-secondary/60 transition-colors">
              <Icon name="Phone" size={18} style={{ color: 'hsl(var(--accent))' }} />
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
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
          onClick={() => setShowReactionFor(null)}>
          {chat.messages.map((msg, i) => {
            const isMe = msg.senderId === 'me';
            const reactions = messageReactions[msg.id] || [];
            const isSticker = msg.text.match(/^[\u{1F300}-\u{1F9FF}]+$/u) || msg.text.length <= 4 && /\p{Emoji}/u.test(msg.text);

            return (
              <div key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className={`relative group max-w-[70%]`}>
                  {/* Message bubble */}
                  <div
                    className={isSticker ? 'px-2 py-1' : `px-4 py-2.5 text-sm ${isMe ? 'bubble-out' : 'bubble-in'}`}
                    onClick={e => { e.stopPropagation(); setShowReactionFor(showReactionFor === msg.id ? null : msg.id); }}>
                    {isSticker ? (
                      <span className="text-5xl leading-none select-none">{msg.text}</span>
                    ) : (
                      <>
                        <p className="leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] opacity-60">{msg.time}</span>
                          {isMe && (
                            <Icon name={msg.read ? 'CheckCheck' : 'Check'} size={12}
                              style={{ color: msg.read ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.5)' }} />
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Quick reaction picker on tap */}
                  {showReactionFor === msg.id && (
                    <div className={`absolute ${isMe ? 'right-0' : 'left-0'} -top-10 z-20 animate-scale-in`}>
                      <div className="glass-strong rounded-full px-2 py-1.5 flex items-center gap-1"
                        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                        {quickReactions.map(emoji => (
                          <button key={emoji}
                            onClick={e => { e.stopPropagation(); handleReaction(msg.id, emoji); }}
                            className="text-xl transition-all hover:scale-125 w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary/60">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reactions display */}
                {reactions.length > 0 && (
                  <div className={`flex gap-1 mt-1 flex-wrap ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {reactions.map(emoji => (
                      <button key={emoji}
                        onClick={() => handleReaction(msg.id, emoji)}
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs transition-all hover:scale-105"
                        style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>
                        <span>{emoji}</span>
                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>1</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 glass border-t" style={{ borderColor: 'hsl(var(--border) / 0.5)' }}>
          <div className="flex items-end gap-2">
            {/* Sticker button */}
            <div className="relative flex-shrink-0" ref={stickerRef}>
              <button
                onClick={() => setShowStickers(v => !v)}
                className={`p-2.5 rounded-xl transition-all ${showStickers ? 'nav-active' : 'hover:bg-secondary/60'}`}>
                <span className="text-xl leading-none">😊</span>
              </button>
              {showStickers && (
                <div className="absolute bottom-12 left-0 z-30">
                  <StickerPicker
                    onSelect={s => handleSend(s)}
                    onClose={() => setShowStickers(false)}
                  />
                </div>
              )}
            </div>

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
              onClick={() => handleSend()}>
              <Icon name="Send" size={18} style={{ color: text.trim() ? 'white' : 'hsl(var(--muted-foreground))' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Stars modal */}
      {showStars && (
        <StarsModal
          recipientName={chat.name}
          balance={starBalance}
          onClose={() => setShowStars(false)}
          onSend={amount => { onSpendStars(amount); setShowStars(false); }}
        />
      )}

      {/* Call screen */}
      {showCall && (
        <CallScreen chat={chat} onEnd={() => setShowCall(false)} />
      )}
    </>
  );
}
