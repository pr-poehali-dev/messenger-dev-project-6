import { useState } from 'react';
import { User } from '@/types/messenger';
import Icon from '@/components/ui/icon';

interface ProfileScreenProps {
  user: User;
  onUpdate: (user: User) => void;
  onLogout: () => void;
  starBalance: number;
  onBuyStars: (amount: number) => void;
}

export default function ProfileScreen({ user, onUpdate, onLogout, starBalance, onBuyStars }: ProfileScreenProps) {
  const [editing, setEditing] = useState(false);
  const [showBuyStars, setShowBuyStars] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');

  const initials = (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase();

  const handleSave = () => {
    const updated = { ...user, firstName, lastName: lastName || undefined, username: username || undefined, bio: bio || undefined };
    onUpdate(updated);
    setEditing(false);
  };

  const settings = [
    { icon: 'Bell', label: 'Уведомления', desc: 'Настройка звуков и оповещений', color: 'hsl(260 80% 65%)' },
    { icon: 'Shield', label: 'Конфиденциальность', desc: 'Кто видит ваш номер и статус', color: 'hsl(195 90% 55%)' },
    { icon: 'Palette', label: 'Оформление', desc: 'Темы и цвета интерфейса', color: 'hsl(320 85% 65%)' },
    { icon: 'HardDrive', label: 'Данные и хранилище', desc: 'Кэш, медиафайлы, загрузки', color: 'hsl(145 80% 50%)' },
    { icon: 'HelpCircle', label: 'Помощь', desc: 'FAQ и обратная связь', color: 'hsl(30 90% 60%)' },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto" style={{ background: 'hsl(var(--background))' }}>
      {/* Hero header */}
      <div className="relative overflow-hidden px-6 pt-8 pb-6"
        style={{ background: 'linear-gradient(160deg, hsl(260 80% 65% / 0.15), hsl(195 90% 55% / 0.08), transparent)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-[50px]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent)' }} />

        <div className="relative flex items-end gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-bold text-white neon-glow"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-pink)))' }}>
              {initials}
            </div>
            <div className="online-dot absolute bottom-1 right-1 w-3 h-3" />
          </div>
          <div className="pb-2 flex-1">
            <h2 className="text-2xl font-bold font-golos text-white">
              {user.firstName} {user.lastName || ''}
            </h2>
            {user.username && (
              <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--accent))' }}>@{user.username}</p>
            )}
            <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{user.phone}</p>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="p-2.5 rounded-xl transition-all hover:scale-105 mb-2"
            style={{ background: 'hsl(var(--secondary))' }}>
            <Icon name={editing ? 'X' : 'Pencil'} size={18} style={{ color: 'hsl(var(--primary))' }} />
          </button>
        </div>

        {user.bio && !editing && (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>{user.bio}</p>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <div className="px-6 pb-4 animate-fade-in">
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-1">Редактировать профиль</h3>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'hsl(var(--muted-foreground))' }}>Имя *</label>
              <input className="input-glass w-full px-3 py-2.5 text-sm"
                value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'hsl(var(--muted-foreground))' }}>Фамилия</label>
              <input className="input-glass w-full px-3 py-2.5 text-sm"
                placeholder="Необязательно" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'hsl(var(--muted-foreground))' }}>Имя пользователя</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>@</span>
                <input className="input-glass w-full pl-7 pr-3 py-2.5 text-sm"
                  value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'hsl(var(--muted-foreground))' }}>О себе</label>
              <textarea className="input-glass w-full px-3 py-2.5 text-sm resize-none"
                rows={3} placeholder="Несколько слов о себе..."
                value={bio} onChange={e => setBio(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-gradient">
                Сохранить
              </button>
              <button onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
                style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stars block */}
      <div className="px-6 pb-4">
        <div className="glass rounded-2xl p-4 animate-fade-in"
          style={{ border: '1px solid hsl(45 100% 55% / 0.3)', background: 'linear-gradient(135deg, hsl(45 100% 55% / 0.08), hsl(30 100% 60% / 0.05))' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'hsl(45 100% 55% / 0.2)' }}>⭐</div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Звёзды Volna</p>
                <p className="text-2xl font-bold font-golos" style={{ color: 'hsl(45 100% 65%)' }}>{starBalance}</p>
              </div>
            </div>
            <button onClick={() => setShowBuyStars(v => !v)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, hsl(45 100% 55%), hsl(30 100% 60%))', boxShadow: '0 0 20px hsl(45 100% 55% / 0.3)' }}>
              + Пополнить
            </button>
          </div>
          {showBuyStars && (
            <div className="mt-3 pt-3 border-t animate-fade-in" style={{ borderColor: 'hsl(45 100% 55% / 0.2)' }}>
              <p className="text-xs mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Выберите пакет звёзд:</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { stars: 50, label: '⭐ 50', price: '99₽' },
                  { stars: 150, label: '⭐ 150', price: '249₽' },
                  { stars: 500, label: '⭐ 500', price: '699₽' },
                ].map(pkg => (
                  <button key={pkg.stars}
                    onClick={() => { onBuyStars(pkg.stars); setShowBuyStars(false); }}
                    className="rounded-xl p-2.5 text-center transition-all hover:scale-105"
                    style={{ background: 'hsl(45 100% 55% / 0.15)', border: '1px solid hsl(45 100% 55% / 0.3)' }}>
                    <div className="text-sm font-bold text-white">{pkg.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'hsl(45 100% 65%)' }}>{pkg.price}</div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] mt-2 text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Демо-режим: звёзды добавляются бесплатно
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Сообщений', value: '1,234' },
            { label: 'Контактов', value: '48' },
            { label: 'Каналов', value: '12' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-3 text-center animate-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
              <p className="text-xl font-bold font-golos gradient-text">{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-6 pb-4 flex-1">
        <p className="text-xs font-semibold mb-3 px-1" style={{ color: 'hsl(var(--muted-foreground))' }}>НАСТРОЙКИ</p>
        <div className="space-y-1">
          {settings.map((item, i) => (
            <button key={i}
              className="chat-item w-full flex items-center gap-3 px-4 py-3.5 text-left animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}22` }}>
                <Icon name={item.icon} size={18} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white">{item.label}</p>
                <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{item.desc}</p>
              </div>
              <Icon name="ChevronRight" size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-6 pb-8">
        <button onClick={onLogout}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: 'hsl(var(--destructive) / 0.15)', color: 'hsl(var(--destructive))', border: '1px solid hsl(var(--destructive) / 0.3)' }}>
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}