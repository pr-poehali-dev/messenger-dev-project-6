import { useState, useEffect } from 'react';
import { Channel } from '@/types/messenger';
import Icon from '@/components/ui/icon';

interface ChannelsScreenProps {
  channels: Channel[];
}

function formatSubs(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

const channelColors = [
  'linear-gradient(135deg, hsl(260 80% 65%), hsl(195 90% 55%))',
  'linear-gradient(135deg, hsl(320 85% 65%), hsl(260 80% 65%))',
  'linear-gradient(135deg, hsl(30 90% 60%), hsl(320 85% 65%))',
  'linear-gradient(135deg, hsl(145 80% 50%), hsl(195 90% 55%))',
];
function getColor(id: string) {
  return channelColors[id.charCodeAt(0) % channelColors.length];
}
function getEmoji(id: string) {
  const emojis = ['📡', '🎨', '📈', '🎵', '🌍', '💡'];
  return emojis[id.charCodeAt(0) % emojis.length];
}

export default function ChannelsScreen({ channels }: ChannelsScreenProps) {
  const [selected, setSelected] = useState<Channel | null>(null);
  const [search, setSearch] = useState('');
  // Локальный счётчик подписчиков — накручиваем каждые 2 минуты +100
  const [subsBoost, setSubsBoost] = useState<Record<string, number>>({});
  const [growAnim, setGrowAnim] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setSubsBoost(prev => {
        const next: Record<string, number> = { ...prev };
        channels.forEach(ch => {
          next[ch.id] = (next[ch.id] || 0) + 100;
        });
        return next;
      });
      // Анимация роста для т��кущего выбранного канала
      if (selected) {
        setGrowAnim(selected.id);
        setTimeout(() => setGrowAnim(null), 1500);
      }
    }, 2 * 60 * 1000); // каждые 2 минуты
    return () => clearInterval(t);
  }, [channels, selected]);

  const getSubs = (ch: Channel) => ch.subscribers + (subsBoost[ch.id] || 0);

  const filtered = channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (selected) {
    return (
      <div className="flex-1 flex flex-col h-screen animate-slide-right" style={{ background: 'hsl(var(--background))' }}>
        {/* Header */}
        <div className="glass border-b" style={{ borderColor: 'hsl(var(--border) / 0.5)' }}>
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-secondary/60 transition-colors">
              <Icon name="ArrowLeft" size={20} style={{ color: 'hsl(var(--muted-foreground))' }} />
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ background: getColor(selected.id) }}>
              {getEmoji(selected.id)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-white">{selected.name}</h3>
                {selected.verified && <Icon name="BadgeCheck" size={14} style={{ color: 'hsl(var(--accent))' }} />}
              </div>
              <p className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {formatSubs(getSubs(selected))} подписчиков
                {growAnim === selected.id && (
                  <span className="text-[10px] font-bold animate-fade-in" style={{ color: 'hsl(145 80% 55%)' }}>+100 🚀</span>
                )}
              </p>
            </div>
          </div>
          {/* Channel info banner */}
          <div className="px-4 pb-3">
            <p className="text-xs px-3 py-2 rounded-xl" style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--muted-foreground))' }}>
              {selected.description}
            </p>
          </div>
        </div>

        {/* Posts */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {selected.messages.map((msg, i) => (
            <div key={msg.id} className="glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                  style={{ background: getColor(selected.id) }}>
                  {getEmoji(selected.id)}
                </div>
                <span className="text-xs font-semibold text-white">{selected.name}</span>
                {selected.verified && <Icon name="BadgeCheck" size={11} style={{ color: 'hsl(var(--accent))' }} />}
                <span className="text-xs ml-auto" style={{ color: 'hsl(var(--muted-foreground))' }}>{msg.time}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>{msg.text}</p>
              <div className="flex items-center gap-4 mt-3 pt-2" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                <button className="flex items-center gap-1.5 text-xs transition-colors hover:text-primary"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <Icon name="Heart" size={13} /> 1.2K
                </button>
                <button className="flex items-center gap-1.5 text-xs transition-colors hover:text-primary"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <Icon name="MessageCircle" size={13} /> 48
                </button>
                <button className="flex items-center gap-1.5 text-xs transition-colors hover:text-primary"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <Icon name="Share2" size={13} /> Поделиться
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-golos text-white">Каналы</h2>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}>
            <Icon name="Plus" size={18} className="text-white" />
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'hsl(var(--muted-foreground))' }} />
          <input className="input-glass w-full pl-9 pr-4 py-2.5 text-sm"
            placeholder="Поиск каналов..."
            value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.map((ch, i) => (
          <button key={ch.id} onClick={() => setSelected(ch)}
            className="chat-item w-full flex items-center gap-3 px-4 py-3.5 text-left glass rounded-2xl animate-fade-in"
            style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: getColor(ch.id) }}>
              {getEmoji(ch.id)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-semibold text-sm text-white truncate">{ch.name}</span>
                {ch.verified && <Icon name="BadgeCheck" size={13} style={{ color: 'hsl(var(--accent))' }} />}
              </div>
              <p className="text-xs truncate mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {ch.lastPost}
              </p>
              <span className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {formatSubs(getSubs(ch))} подписчиков
              </span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{ch.lastTime}</span>
              {ch.unread > 0 && <span className="notif-badge">{ch.unread}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}