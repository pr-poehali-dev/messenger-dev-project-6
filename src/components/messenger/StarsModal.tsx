import { useState } from 'react';
import { playStarSound } from '@/lib/sounds';
import Icon from '@/components/ui/icon';

interface StarsModalProps {
  recipientName: string;
  onClose: () => void;
  onSend: (amount: number) => void;
  balance: number;
}

const STAR_PRESETS = [1, 5, 10, 25, 50, 100];

const STAR_REACTIONS = [
  { emoji: '⭐', label: 'Звезда', cost: 1 },
  { emoji: '🌟', label: 'Суперзвезда', cost: 5 },
  { emoji: '💫', label: 'Вспышка', cost: 10 },
  { emoji: '✨', label: 'Магия', cost: 25 },
  { emoji: '🌠', label: 'Метеор', cost: 50 },
  { emoji: '🏆', label: 'Трофей', cost: 100 },
];

export default function StarsModal({ recipientName, onClose, onSend, balance }: StarsModalProps) {
  const [amount, setAmount] = useState(5);
  const [selectedReaction, setSelectedReaction] = useState(1);
  const [sent, setSent] = useState(false);
  const [floatingStars, setFloatingStars] = useState<{ id: number; x: number; y: number }[]>([]);

  const canAfford = amount <= balance;

  const handleSend = () => {
    if (!canAfford) return;
    playStarSound();
    // Spawn floating stars animation
    const stars = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      y: 30 + Math.random() * 40,
    }));
    setFloatingStars(stars);
    setSent(true);
    setTimeout(() => {
      onSend(amount);
    }, 1800);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
        <div className="text-center animate-scale-in">
          <div className="relative inline-block">
            <span className="text-7xl animate-float">⭐</span>
            {floatingStars.map(s => (
              <div key={s.id}
                className="absolute text-xl pointer-events-none animate-fade-in"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  animationDelay: `${s.id * 0.08}s`,
                  transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
                }}>
                ⭐
              </div>
            ))}
          </div>
          <p className="text-2xl font-bold font-golos gradient-text mt-4">+{amount} звёзд!</p>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Отправлено для {recipientName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
      <div className="glass-strong rounded-3xl p-6 w-full max-w-sm animate-scale-in"
        style={{ border: '1px solid hsl(var(--primary) / 0.3)', boxShadow: '0 24px 80px hsl(var(--primary) / 0.3)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <h3 className="text-lg font-bold font-golos text-white">Отправить звёзды</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-secondary/60 transition-colors">
            <Icon name="X" size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </button>
        </div>

        {/* Balance */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl mb-5"
          style={{ background: 'hsl(var(--secondary))' }}>
          <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Ваш баланс</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">⭐</span>
            <span className="text-lg font-bold text-white">{balance}</span>
          </div>
        </div>

        {/* Reaction type */}
        <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'hsl(var(--muted-foreground))' }}>ТИП РЕАКЦИИ</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {STAR_REACTIONS.map(r => (
            <button key={r.cost}
              onClick={() => { setSelectedReaction(r.cost); setAmount(r.cost); }}
              className={`rounded-2xl p-2.5 text-center transition-all hover:scale-105 ${selectedReaction === r.cost ? 'nav-active' : ''}`}
              style={{ background: selectedReaction === r.cost ? undefined : 'hsl(var(--secondary))' }}>
              <div className="text-2xl mb-1">{r.emoji}</div>
              <div className="text-[10px] font-medium text-white">{r.label}</div>
              <div className="text-[10px] flex items-center justify-center gap-0.5 mt-0.5" style={{ color: 'hsl(var(--primary))' }}>
                <span>⭐</span><span>{r.cost}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'hsl(var(--muted-foreground))' }}>КОЛИЧЕСТВО</p>
        <div className="flex gap-2 mb-3">
          {STAR_PRESETS.map(n => (
            <button key={n}
              onClick={() => setAmount(n)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${amount === n ? 'nav-active' : 'hover:bg-secondary/80'}`}
              style={{
                background: amount === n ? undefined : 'hsl(var(--secondary))',
                color: amount === n ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
              }}>
              {n}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">⭐</span>
          <input
            type="number"
            className="input-glass w-full pl-10 pr-4 py-2.5 text-sm"
            value={amount}
            min={1}
            max={balance}
            onChange={e => setAmount(Math.max(1, Math.min(balance, Number(e.target.value))))}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canAfford}
          className="w-full py-3.5 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2"
          style={{
            background: canAfford
              ? 'linear-gradient(135deg, hsl(45 100% 55%), hsl(30 100% 60%))'
              : 'hsl(var(--secondary))',
            opacity: canAfford ? 1 : 0.5,
            boxShadow: canAfford ? '0 0 30px hsl(45 100% 55% / 0.4)' : 'none',
          }}>
          <span className="text-xl">⭐</span>
          {canAfford ? `Отправить ${amount} звёзд для ${recipientName}` : 'Недостаточно звёзд'}
        </button>

        {!canAfford && (
          <p className="text-xs text-center mt-2" style={{ color: 'hsl(var(--destructive))' }}>
            Пополните баланс в Профиле → Звёзды
          </p>
        )}
      </div>
    </div>
  );
}
