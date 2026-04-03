import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface StickerPickerProps {
  onSelect: (sticker: string) => void;
  onClose: () => void;
}

const STICKER_PACKS = [
  {
    id: 'memes',
    name: 'Мемы',
    icon: '😂',
    stickers: [
      { id: 's1', emoji: '😂', label: 'lol' },
      { id: 's2', emoji: '💀', label: 'dead' },
      { id: 's3', emoji: '🤡', label: 'clown' },
      { id: 's4', emoji: '🗿', label: 'moai' },
      { id: 's5', emoji: '😭', label: 'sob' },
      { id: 's6', emoji: '🥴', label: 'woozy' },
      { id: 's7', emoji: '👀', label: 'eyes' },
      { id: 's8', emoji: '🫠', label: 'melting' },
      { id: 's9', emoji: '🤣', label: 'rofl' },
      { id: 's10', emoji: '😤', label: 'hmph' },
      { id: 's11', emoji: '🫡', label: 'salute' },
      { id: 's12', emoji: '🧢', label: 'cap' },
    ],
  },
  {
    id: 'reactions',
    name: 'Реакции',
    icon: '❤️',
    stickers: [
      { id: 'r1', emoji: '❤️', label: 'love' },
      { id: 'r2', emoji: '🔥', label: 'fire' },
      { id: 'r3', emoji: '👍', label: 'like' },
      { id: 'r4', emoji: '💯', label: '100' },
      { id: 'r5', emoji: '🎉', label: 'party' },
      { id: 'r6', emoji: '😮', label: 'wow' },
      { id: 'r7', emoji: '😡', label: 'angry' },
      { id: 'r8', emoji: '🥰', label: 'heart eyes' },
      { id: 'r9', emoji: '🤯', label: 'mindblown' },
      { id: 'r10', emoji: '💪', label: 'strong' },
      { id: 'r11', emoji: '🙏', label: 'pray' },
      { id: 'r12', emoji: '👏', label: 'clap' },
    ],
  },
  {
    id: 'animals',
    name: 'Животные',
    icon: '🐱',
    stickers: [
      { id: 'a1', emoji: '🐱', label: 'cat' },
      { id: 'a2', emoji: '🐶', label: 'dog' },
      { id: 'a3', emoji: '🐸', label: 'frog' },
      { id: 'a4', emoji: '🦊', label: 'fox' },
      { id: 'a5', emoji: '🐼', label: 'panda' },
      { id: 'a6', emoji: '🦁', label: 'lion' },
      { id: 'a7', emoji: '🐻', label: 'bear' },
      { id: 'a8', emoji: '🐧', label: 'penguin' },
      { id: 'a9', emoji: '🦄', label: 'unicorn' },
      { id: 'a10', emoji: '🦋', label: 'butterfly' },
      { id: 'a11', emoji: '🦖', label: 'dino' },
      { id: 'a12', emoji: '🐙', label: 'octopus' },
    ],
  },
  {
    id: 'text_memes',
    name: 'Текст',
    icon: '💬',
    stickers: [
      { id: 't1', emoji: '😭💀', label: 'dead lol' },
      { id: 't2', emoji: '🤣🔥', label: 'fire lol' },
      { id: 't3', emoji: '💅✨', label: 'slay' },
      { id: 't4', emoji: '🗿🤙', label: 'chill moai' },
      { id: 't5', emoji: '😤💢', label: 'angry' },
      { id: 't6', emoji: '🫶💕', label: 'love' },
      { id: 't7', emoji: '😎🕶️', label: 'cool' },
      { id: 't8', emoji: '🤔💭', label: 'thinking' },
      { id: 't9', emoji: '🎭🎪', label: 'drama' },
      { id: 't10', emoji: '🏆👑', label: 'winner' },
      { id: 't11', emoji: '🚀✨', label: 'launch' },
      { id: 't12', emoji: '💎👑', label: 'rich' },
    ],
  },
];

// Meme text stickers
const MEME_TEXTS = [
  { id: 'm1', text: 'КРИНЖ 😬', bg: '#FF6B6B' },
  { id: 'm2', text: 'ОК БУМЕР', bg: '#4ECDC4' },
  { id: 'm3', text: 'GG EZ 🎮', bg: '#45B7D1' },
  { id: 'm4', text: 'ИМБА 💪', bg: '#96CEB4' },
  { id: 'm5', text: 'НУ И ЧО', bg: '#FFEAA7' },
  { id: 'm6', text: 'ТОПЧИК 🔥', bg: '#DDA0DD' },
  { id: 'm7', text: 'ЛАЙК ❤️', bg: '#F8BBD0' },
  { id: 'm8', text: 'ЦАТС 😎', bg: '#B2EBF2' },
];

export default function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const [activePack, setActivePack] = useState('memes');
  const pack = STICKER_PACKS.find(p => p.id === activePack) || STICKER_PACKS[0];

  return (
    <div className="glass-strong rounded-2xl overflow-hidden animate-fade-in"
      style={{ width: 320, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid hsl(var(--primary) / 0.2)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: 'hsl(var(--border) / 0.5)' }}>
        <span className="text-xs font-semibold text-white">Стикеры и мемы</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary/60 transition-colors">
          <Icon name="X" size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
        </button>
      </div>

      {/* Pack tabs */}
      <div className="flex items-center gap-1 px-2 py-2 border-b overflow-x-auto"
        style={{ borderColor: 'hsl(var(--border) / 0.4)' }}>
        {STICKER_PACKS.map(p => (
          <button key={p.id} onClick={() => setActivePack(p.id)}
            className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all ${activePack === p.id ? 'nav-active scale-110' : 'hover:bg-secondary/60'}`}
            title={p.name}>
            {p.icon}
          </button>
        ))}
        <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: 'hsl(var(--border))' }} />
        <button
          onClick={() => setActivePack('meme_texts')}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${activePack === 'meme_texts' ? 'nav-active scale-110' : 'hover:bg-secondary/60'}`}
          title="Мем-тексты" style={{ color: 'hsl(var(--primary))' }}>
          ABC
        </button>
      </div>

      {/* Stickers grid */}
      <div className="p-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
        {activePack === 'meme_texts' ? (
          <div className="grid grid-cols-4 gap-1.5">
            {MEME_TEXTS.map(m => (
              <button key={m.id}
                onClick={() => onSelect(m.text)}
                className="rounded-xl px-1 py-2 text-[10px] font-bold text-center transition-all hover:scale-105 active:scale-95"
                style={{ background: m.bg + '33', border: `1px solid ${m.bg}55`, color: m.bg }}>
                {m.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1">
            {pack.stickers.map(s => (
              <button key={s.id}
                onClick={() => onSelect(s.emoji)}
                className="w-full aspect-square rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-125 hover:bg-secondary/60 active:scale-95"
                title={s.label}>
                {s.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pack name */}
      <div className="px-3 py-1.5 border-t" style={{ borderColor: 'hsl(var(--border) / 0.4)' }}>
        <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {activePack === 'meme_texts' ? 'Мем-тексты' : pack.name} · {activePack === 'meme_texts' ? MEME_TEXTS.length : pack.stickers.length} стикеров
        </p>
      </div>
    </div>
  );
}
