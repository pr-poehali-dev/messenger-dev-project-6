import { AppScreen, User } from '@/types/messenger';
import Icon from '@/components/ui/icon';

interface SidebarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  user: User;
  totalUnread: number;
}

const navItems = [
  { id: 'chats' as AppScreen, icon: 'MessageCircle', label: 'Чаты' },
  { id: 'channels' as AppScreen, icon: 'Radio', label: 'Каналы' },
  { id: 'contacts' as AppScreen, icon: 'Users', label: 'Контакты' },
  { id: 'search' as AppScreen, icon: 'Search', label: 'Поиск' },
  { id: 'profile' as AppScreen, icon: 'User', label: 'Профиль' },
];

function getRoleIcon(role?: string, banned?: boolean) {
  if (banned) return '🟥';
  if (role === 'admin') return '🛡️';
  if (role === 'moderator') return '⚔️';
  return null;
}

export default function Sidebar({ currentScreen, onNavigate, user, totalUnread }: SidebarProps) {
  const initials = (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase();
  const isAdmin = user.role === 'admin';
  const isMod = user.role === 'admin' || user.role === 'moderator';
  const roleIcon = getRoleIcon(user.role);

  return (
    <aside className="w-[72px] h-screen flex flex-col items-center py-4 gap-2 glass border-r"
      style={{ borderColor: 'hsl(var(--border) / 0.5)' }}>

      {/* Logo */}
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 cursor-pointer neon-glow"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
        onClick={() => onNavigate('chats')}>
        <span className="text-xl">🌊</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1 w-full px-2">
        {navItems.map(item => {
          const isActive = currentScreen === item.id;
          const showBadge = item.id === 'chats' && totalUnread > 0;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative w-full flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all duration-200 group ${isActive ? 'nav-active' : 'hover:bg-secondary/60'}`}
              title={item.label}
            >
              <div className="relative">
                <Icon
                  name={item.icon}
                  size={22}
                  className={`transition-colors ${isActive ? '' : 'opacity-60 group-hover:opacity-90'}`}
                  style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}
                />
                {showBadge && (
                  <span className="notif-badge absolute -top-1.5 -right-1.5">{totalUnread > 9 ? '9+' : totalUnread}</span>
                )}
              </div>
              <span className={`text-[9px] font-medium transition-colors leading-none ${isActive ? '' : 'opacity-50 group-hover:opacity-80'}`}
                style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Admin panel button — only for admins/mods */}
        {isMod && (
          <button
            onClick={() => onNavigate('admin')}
            className={`relative w-full flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all duration-200 group mt-1 ${currentScreen === 'admin' ? '' : 'hover:bg-secondary/60'}`}
            style={{
              background: currentScreen === 'admin'
                ? 'linear-gradient(135deg, hsl(0 75% 55% / 0.25), hsl(30 90% 55% / 0.15))'
                : undefined,
              border: currentScreen === 'admin' ? '1px solid hsl(0 75% 55% / 0.35)' : undefined,
            }}
            title="Панель администратора"
          >
            <span className="text-lg leading-none">🛡️</span>
            <span className="text-[9px] font-medium leading-none"
              style={{ color: currentScreen === 'admin' ? 'hsl(0 75% 65%)' : 'hsl(var(--foreground))', opacity: currentScreen === 'admin' ? 1 : 0.6 }}>
              Админ
            </span>
          </button>
        )}
      </nav>

      {/* User avatar with role badge */}
      <div className="relative cursor-pointer" onClick={() => onNavigate('profile')} title={user.firstName}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white transition-transform hover:scale-105"
          style={{
            background: isAdmin
              ? 'linear-gradient(135deg, hsl(0 75% 55%), hsl(30 90% 55%))'
              : isMod
                ? 'linear-gradient(135deg, hsl(260 80% 65%), hsl(195 90% 55%))'
                : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-pink)))'
          }}>
          {initials}
        </div>
        {roleIcon && (
          <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">{roleIcon}</span>
        )}
      </div>
    </aside>
  );
}
