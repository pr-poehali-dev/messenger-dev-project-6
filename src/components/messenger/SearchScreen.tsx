import { useState } from 'react';
import { Chat, Contact, Channel } from '@/types/messenger';
import Icon from '@/components/ui/icon';

interface SearchScreenProps {
  chats: Chat[];
  contacts: Contact[];
  channels: Channel[];
  onOpenChat: (chat: Chat) => void;
}

type Tab = 'all' | 'chats' | 'contacts' | 'channels';

export default function SearchScreen({ chats, contacts, channels, onOpenChat }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  const q = query.toLowerCase().trim();

  const matchChats = q ? chats.filter(c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)) : [];
  const matchContacts = q ? contacts.filter(c => `${c.firstName} ${c.lastName || ''}`.toLowerCase().includes(q) || c.phone.includes(q)) : [];
  const matchChannels = q ? channels.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) : [];

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all', label: 'Все', count: matchChats.length + matchContacts.length + matchChannels.length },
    { id: 'chats', label: 'Чаты', count: matchChats.length },
    { id: 'contacts', label: 'Контакты', count: matchContacts.length },
    { id: 'channels', label: 'Каналы', count: matchChannels.length },
  ];

  const avatarColors = [
    'linear-gradient(135deg, hsl(260 80% 65%), hsl(195 90% 55%))',
    'linear-gradient(135deg, hsl(320 85% 65%), hsl(260 80% 65%))',
    'linear-gradient(135deg, hsl(195 90% 55%), hsl(145 80% 50%))',
  ];
  const getColor = (id: string) => avatarColors[id.charCodeAt(0) % avatarColors.length];
  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const hasResults = matchChats.length + matchContacts.length + matchChannels.length > 0;

  return (
    <div className="flex-1 flex flex-col h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-2xl font-bold font-golos text-white mb-4">Поиск</h2>
        <div className="relative mb-4">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'hsl(var(--muted-foreground))' }} />
          <input
            className="input-glass w-full pl-11 pr-10 py-3 text-sm"
            placeholder="Поиск людей, чатов, каналов..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary/60 transition-colors">
              <Icon name="X" size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
            </button>
          )}
        </div>

        {/* Tabs */}
        {q && (
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${tab === t.id ? 'nav-active' : 'hover:bg-secondary/60'}`}
                style={{ color: tab === t.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>
                {t.label} {t.count > 0 && <span className="ml-0.5 opacity-60">{t.count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {!q && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-5xl mb-4 animate-float">🔍</div>
            <h3 className="text-lg font-semibold font-golos gradient-text mb-2">Найдите кого угодно</h3>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Введите имя, номер телефона или название канала
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {['Новые каналы', 'Контакты онлайн', 'Групповые чаты'].map(s => (
                <button key={s} onClick={() => setQuery(s)}
                  className="px-3 py-1.5 rounded-xl text-xs glass transition-colors hover:border-primary/40"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {q && !hasResults && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-4xl mb-3">😶</div>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Ничего не найдено по запросу «{q}»</p>
          </div>
        )}

        {q && hasResults && (
          <div className="space-y-4 animate-fade-in">
            {/* Chats */}
            {(tab === 'all' || tab === 'chats') && matchChats.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'hsl(var(--primary))' }}>ЧАТЫ</p>
                {matchChats.map(chat => (
                  <button key={chat.id} onClick={() => onOpenChat(chat)}
                    className="chat-item w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 text-left">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: getColor(chat.id) }}>
                      {chat.isGroup ? '👥' : getInitials(chat.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white">{chat.name}</p>
                      <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{chat.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Contacts */}
            {(tab === 'all' || tab === 'contacts') && matchContacts.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'hsl(var(--primary))' }}>КОНТАКТЫ</p>
                {matchContacts.map(contact => (
                  <div key={contact.id}
                    className="chat-item flex items-center gap-3 px-3 py-2.5 mb-0.5">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: getColor(contact.id) }}>
                        {getInitials(contact.firstName + ' ' + (contact.lastName || ''))}
                      </div>
                      {contact.online && <div className="online-dot absolute bottom-0 right-0 w-2.5 h-2.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white">{contact.firstName} {contact.lastName || ''}</p>
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{contact.phone}</p>
                    </div>
                    {contact.online && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--neon-green) / 0.15)', color: 'hsl(var(--neon-green))' }}>онлайн</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Channels */}
            {(tab === 'all' || tab === 'channels') && matchChannels.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'hsl(var(--primary))' }}>КАНАЛЫ</p>
                {matchChannels.map(ch => (
                  <div key={ch.id} className="chat-item flex items-center gap-3 px-3 py-2.5 mb-0.5">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: getColor(ch.id) }}>📡</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-sm text-white truncate">{ch.name}</p>
                        {ch.verified && <Icon name="BadgeCheck" size={13} style={{ color: 'hsl(var(--accent))' }} />}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{ch.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
