import { useState, useRef, useEffect } from 'react';
import { Chat, User } from '@/types/messenger';
import ChatView from './ChatView';
import Icon from '@/components/ui/icon';

interface ChatsScreenProps {
  chats: Chat[];
  user: User;
  onSendMessage: (chatId: string, text: string) => void;
  onCreateChat?: (chat: Chat) => void;
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

type CreateMode = 'chat' | 'group' | 'channel' | null;

export default function ChatsScreen({ chats: initialChats, user, onSendMessage, onCreateChat }: ChatsScreenProps) {
  const [chats, setChats] = useState(initialChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [search, setSearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const filtered = chats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = (mode: CreateMode) => {
    setCreateMode(mode);
    setShowMenu(false);
    setFormName('');
    setFormPhone('');
    setFormDesc('');
    setFormError('');
  };

  const handleCreate = () => {
    if (!formName.trim()) { setFormError('Введите название'); return; }
    if (createMode === 'chat' && !formPhone.trim()) { setFormError('Введите номер телефона'); return; }

    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      name: formName.trim(),
      lastMessage: createMode === 'channel' ? 'Канал создан' : createMode === 'group' ? 'Группа создана' : 'Начните общение',
      lastTime: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
      online: false,
      isGroup: createMode === 'group' || createMode === 'channel',
      messages: [],
    };

    const updated = [newChat, ...chats];
    setChats(updated);
    setSelectedChat(newChat);
    onCreateChat?.(newChat);
    setCreateMode(null);
  };

  const createLabels: Record<NonNullable<CreateMode>, { title: string; icon: string; color: string; desc: string }> = {
    chat: { title: 'Новый чат', icon: 'MessageCircle', color: 'hsl(260 80% 65%)', desc: 'Личная переписка по номеру телефона' },
    group: { title: 'Новая группа', icon: 'Users', color: 'hsl(195 90% 55%)', desc: 'Общий чат для нескольких участников' },
    channel: { title: 'Новый канал', icon: 'Radio', color: 'hsl(320 85% 65%)', desc: 'Публичная трансляция для подписчиков' },
  };

  return (
    <div className="flex flex-1 h-screen overflow-hidden">
      {/* List panel */}
      <div className="w-80 flex flex-col h-full border-r" style={{ borderColor: 'hsl(var(--border) / 0.5)', background: 'hsl(var(--card) / 0.5)' }}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-golos text-white">Чаты</h2>
            {/* Plus button with dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(v => !v)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}>
                <Icon name={showMenu ? 'X' : 'Plus'} size={18} className="text-white" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-11 z-50 glass-strong rounded-2xl py-2 w-52 animate-scale-in"
                  style={{ boxShadow: '0 16px 48px hsl(var(--primary) / 0.25)', border: '1px solid hsl(var(--primary) / 0.2)' }}>
                  {([ 'chat', 'group', 'channel'] as CreateMode[]).map(mode => {
                    if (!mode) return null;
                    const item = createLabels[mode];
                    return (
                      <button key={mode} onClick={() => openCreate(mode)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${item.color}22` }}>
                          <Icon name={item.icon} size={15} style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <p className="text-[10px] leading-tight" style={{ color: 'hsl(var(--muted-foreground))' }}>{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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

        {/* Create form */}
        {createMode && (
          <div className="mx-3 mb-3 animate-fade-in">
            <div className="glass rounded-2xl p-4"
              style={{ border: `1px solid ${createLabels[createMode].color}33` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${createLabels[createMode].color}22` }}>
                  <Icon name={createLabels[createMode].icon} size={14} style={{ color: createLabels[createMode].color }} />
                </div>
                <span className="text-sm font-semibold text-white">{createLabels[createMode].title}</span>
                <button onClick={() => setCreateMode(null)} className="ml-auto p-1 rounded-lg hover:bg-secondary/60">
                  <Icon name="X" size={13} style={{ color: 'hsl(var(--muted-foreground))' }} />
                </button>
              </div>

              <div className="space-y-2">
                {createMode === 'chat' ? (
                  <>
                    <input className="input-glass w-full px-3 py-2 text-sm"
                      placeholder="Имя контакта"
                      value={formName}
                      onChange={e => setFormName(e.target.value)} />
                    <input className="input-glass w-full px-3 py-2 text-sm"
                      placeholder="+7 900 000-00-00"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)} />
                  </>
                ) : (
                  <>
                    <input className="input-glass w-full px-3 py-2 text-sm"
                      placeholder={createMode === 'group' ? 'Название группы' : 'Название канала'}
                      value={formName}
                      onChange={e => setFormName(e.target.value)} />
                    <input className="input-glass w-full px-3 py-2 text-sm"
                      placeholder="Описание (необязательно)"
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)} />
                  </>
                )}
              </div>

              {formError && <p className="text-xs mt-2" style={{ color: 'hsl(var(--destructive))' }}>{formError}</p>}

              <button onClick={handleCreate}
                className="w-full mt-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${createLabels[createMode].color}, hsl(var(--primary)))` }}>
                Создать
              </button>
            </div>
          </div>
        )}

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
