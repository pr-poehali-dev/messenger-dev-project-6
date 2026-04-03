import { useState, useEffect, useCallback } from 'react';
import { User, Chat, Contact, Channel, AppScreen } from '@/types/messenger';
import { mockChats, mockContacts, mockChannels } from '@/data/mockData';
import AuthScreen from '@/components/messenger/AuthScreen';
import Sidebar from '@/components/messenger/Sidebar';
import ChatsScreen from '@/components/messenger/ChatsScreen';
import ChannelsScreen from '@/components/messenger/ChannelsScreen';
import ContactsScreen from '@/components/messenger/ContactsScreen';
import SearchScreen from '@/components/messenger/SearchScreen';
import ProfileScreen from '@/components/messenger/ProfileScreen';
import AdminPanel from '@/components/messenger/AdminPanel';
import NotificationToast from '@/components/messenger/NotificationToast';
import { checkMessageContent, banUser, findUser } from '@/lib/userSystem';

interface Notification {
  id: string;
  from: string;
  text: string;
  time: string;
}

interface BanNotice {
  show: boolean;
  reason: string;
  duration: string;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<AppScreen>('chats');
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [channels] = useState<Channel[]>(mockChannels);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [starBalance, setStarBalance] = useState(50);
  const [banNotice, setBanNotice] = useState<BanNotice>({ show: false, reason: '', duration: '' });

  useEffect(() => {
    const saved = localStorage.getItem('volna_user');
    if (saved) {
      try {
        const u = JSON.parse(saved) as User;
        const reg = findUser(u.phone);
        if (reg?.banned) {
          localStorage.removeItem('volna_user');
          setLoading(false);
          return;
        }
        setUser(u);
      } catch { /* ignore */ }
    }
    const savedStars = localStorage.getItem('volna_stars');
    if (savedStars) setStarBalance(Number(savedStars));
    setLoading(false);
  }, []);

  // Simulate incoming messages
  useEffect(() => {
    if (!user) return;
    const names = ['Коля', 'Витя', 'Александр', 'Мария'];
    const messages = [
      'Привет! Как дела? 👋',
      'Не забудь про встречу завтра',
      '🔥🔥🔥',
      '😂😂 это жесть',
      'Окей, договорились!',
    ];
    let count = 0;
    const intervals = [10000, 25000, 45000];
    const timers = intervals.map(ms =>
      setTimeout(() => {
        if (count >= 3) return;
        count++;
        const notif: Notification = {
          id: `n_${Date.now()}`,
          from: names[Math.floor(Math.random() * names.length)],
          text: messages[Math.floor(Math.random() * messages.length)],
          time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        };
        setNotifications(prev => [...prev, notif]);
        setChats(prev => prev.map((c, idx) =>
          idx === 0 ? { ...c, unread: c.unread + 1 } : c
        ));
      }, ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [user]);

  const handleAuth = (u: User) => {
    setUser(u);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('volna_user');
    setUser(null);
    setScreen('chats');
  };

  const handleUpdateUser = (u: User) => {
    setUser(u);
    localStorage.setItem('volna_user', JSON.stringify(u));
  };

  // Автобан за мат и 18+
  const handleSendMessage = (chatId: string, text: string) => {
    if (!user) return;
    const { hasMat, hasAdult } = checkMessageContent(text);

    if (hasMat || hasAdult) {
      const reason = hasMat
        ? 'Использование нецензурной лексики в чате'
        : 'Распространение контента 18+ в чате';
      banUser(user.phone, reason, 'month', 'AutoMod 🤖');
      setBanNotice({ show: true, reason, duration: '30 дней' });
      setTimeout(() => {
        localStorage.removeItem('volna_user');
        setUser(null);
        setBanNotice({ show: false, reason: '', duration: '' });
      }, 3500);
      return;
    }

    const now = new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
    setChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      const newMsg = {
        id: `m_${Date.now()}`,
        chatId,
        senderId: 'me',
        text,
        time: now,
        read: false,
        type: 'text' as const,
      };
      return { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTime: now };
    }));
  };

  const handleAddContact = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
  };

  const handleStartChat = (contact: Contact) => {
    const name = `${contact.firstName} ${contact.lastName || ''}`.trim();
    const existing = chats.find(c => c.name === name);
    if (!existing) {
      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        name,
        lastMessage: 'Начните общение',
        lastTime: '',
        unread: 0,
        online: contact.online,
        messages: [],
      };
      setChats(prev => [newChat, ...prev]);
    }
    setScreen('chats');
  };

  const handleDismissNotif = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleOpenChat = (_chat: Chat) => {
    setScreen('chats');
  };

  const handleSpendStars = (amount: number) => {
    setStarBalance(prev => {
      const next = Math.max(0, prev - amount);
      localStorage.setItem('volna_stars', String(next));
      return next;
    });
  };

  const handleBuyStars = (amount: number) => {
    setStarBalance(prev => {
      const next = prev + amount;
      localStorage.setItem('volna_stars', String(next));
      return next;
    });
  };

  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);

  if (loading) {
    return (
      <div className="h-screen mesh-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 neon-glow animate-float"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}>
            <span className="text-2xl">🌊</span>
          </div>
          <div className="flex gap-1 justify-center mt-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'hsl(var(--primary))', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  const renderScreen = () => {
    switch (screen) {
      case 'chats':
        return (
          <ChatsScreen
            chats={chats}
            user={user}
            onSendMessage={handleSendMessage}
            starBalance={starBalance}
            onSpendStars={handleSpendStars}
          />
        );
      case 'channels':
        return <ChannelsScreen channels={channels} />;
      case 'contacts':
        return <ContactsScreen contacts={contacts} onAddContact={handleAddContact} onStartChat={handleStartChat} />;
      case 'search':
        return <SearchScreen chats={chats} contacts={contacts} channels={channels} onOpenChat={handleOpenChat} />;
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onUpdate={handleUpdateUser}
            onLogout={handleLogout}
            starBalance={starBalance}
            onBuyStars={handleBuyStars}
          />
        );
      case 'admin':
        return (user.role === 'admin' || user.role === 'moderator')
          ? <AdminPanel currentUser={user} />
          : null;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden mesh-bg">
      <Sidebar
        currentScreen={screen}
        onNavigate={setScreen}
        user={user}
        totalUnread={totalUnread}
      />
      <main className="flex-1 flex overflow-hidden animate-fade-in" key={screen}>
        {renderScreen()}
      </main>
      <NotificationToast notifications={notifications} onDismiss={handleDismissNotif} />

      {/* AutoBan overlay */}
      {banNotice.show && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)' }}>
          <div className="text-center animate-scale-in max-w-sm mx-4 glass-strong rounded-3xl p-8"
            style={{ border: '1px solid hsl(var(--destructive) / 0.5)' }}>
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold font-golos text-white mb-2">Аккаунт заблокирован</h2>
            <div className="px-4 py-3 rounded-2xl mb-4"
              style={{ background: 'hsl(var(--destructive) / 0.15)', border: '1px solid hsl(var(--destructive) / 0.3)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'hsl(var(--destructive))' }}>Причина:</p>
              <p className="text-sm text-white">{banNotice.reason}</p>
            </div>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Срок: <span className="text-white font-bold">{banNotice.duration}</span>
            </p>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Автоматическая система модерации · AutoMod 🤖
            </p>
            <p className="text-xs mt-3 animate-pulse" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Выход через 3 секунды...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
