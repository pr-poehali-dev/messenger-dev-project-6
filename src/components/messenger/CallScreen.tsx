import { useState, useEffect, useRef } from 'react';
import { Chat } from '@/types/messenger';
import Icon from '@/components/ui/icon';
import { startRingtone, stopRingtone, playConnectSound } from '@/lib/sounds';

interface CallScreenProps {
  chat: Chat;
  onEnd: () => void;
}

type CallState = 'incoming' | 'connecting' | 'active' | 'ended';

const BOT_PHRASES_FEMALE = [
  'Привет! Как ты?',
  'Слышу тебя хорошо!',
  'Да, конечно, я слушаю.',
  'Отличная идея! Расскажи подробнее.',
  'Понятно, я тебя слышу.',
  'Хорошо, договорились!',
  'Буду ждать твоего звонка.',
  'Спасибо, что позвонил!',
  'Всё хорошо с моей стороны!',
  'Конечно, без проблем.',
];

const BOT_PHRASES_MALE = [
  'Привет, брат! Как дела?',
  'Слышу тебя отлично!',
  'Да, я тут, говори.',
  'Интересно, продолжай.',
  'Понял тебя.',
  'Отлично, договорились!',
  'Окей, пока!',
  'Спасибо за звонок.',
  'Всё норм, не переживай.',
  'Хорошо, сделаем.',
];

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

// Detect gender by name heuristic
function isFemale(name: string) {
  const fem = ['а', 'я', 'ия', 'ья', 'ня', 'ла', 'ра'];
  const lower = name.toLowerCase();
  return fem.some(e => lower.endsWith(e));
}

export default function CallScreen({ chat, onEnd }: CallScreenProps) {
  const [callState, setCallState] = useState<CallState>('incoming');
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [botText, setBotText] = useState('');
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [callLog, setCallLog] = useState<{ role: 'bot' | 'you'; text: string }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isFem = isFemale(chat.name.split(' ')[0]);
  const phrases = isFem ? BOT_PHRASES_FEMALE : BOT_PHRASES_MALE;

  // Start ringtone on mount
  useEffect(() => {
    startRingtone();
    return () => { stopRingtone(); window.speechSynthesis?.cancel(); };
  }, []);

  // Timer
  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [callState]);

  // Bot speaks periodically
  useEffect(() => {
    if (callState !== 'active') return;
    const say = () => {
      const text = phrases[Math.floor(Math.random() * phrases.length)];
      setBotText(text);
      setIsBotSpeaking(true);
      setCallLog(prev => [...prev, { role: 'bot', text }]);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'ru-RU';
        utt.rate = 0.95;
        utt.pitch = isFem ? 1.4 : 0.8;
        utt.volume = speakerOn ? 1 : 0;
        // Try to pick matching voice
        const voices = window.speechSynthesis.getVoices();
        const ruVoices = voices.filter(v => v.lang.startsWith('ru'));
        if (ruVoices.length > 0) {
          const pick = isFem
            ? ruVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('женщ') || v.name.includes('Milena') || v.name.includes('Katya'))
            : ruVoices.find(v => v.name.toLowerCase().includes('male') || v.name.includes('Pavel') || v.name.includes('Yuri'));
          utt.voice = pick || ruVoices[0];
        }
        utt.onend = () => { setIsBotSpeaking(false); setBotText(''); };
        synthRef.current = utt;
        window.speechSynthesis.speak(utt);
      } else {
        setTimeout(() => { setIsBotSpeaking(false); setBotText(''); }, 2000);
      }
    };
    // First response after 1.5s
    const first = setTimeout(say, 1500);
    // Then every 12-18s
    const subsequent = setInterval(say, 12000 + Math.random() * 6000);
    return () => { clearTimeout(first); clearInterval(subsequent); };
  }, [callState]);

  const handleAccept = () => {
    stopRingtone();
    setCallState('connecting');
    playConnectSound();
    setTimeout(() => {
      setCallState('active');
      setCallLog([{ role: 'bot', text: '📞 Соединение установлено' }]);
    }, 1200);
  };

  const handleDecline = () => {
    stopRingtone();
    window.speechSynthesis?.cancel();
    setCallState('ended');
    setTimeout(onEnd, 800);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const stateLabel: Record<CallState, string> = {
    incoming: 'Входящий звонок...',
    connecting: 'Соединение...',
    active: formatDuration(duration),
    ended: 'Звонок завершён',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent)' }} />
      </div>

      <div className="relative w-full max-w-sm mx-4 animate-scale-in">
        {/* Avatar + name */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {/* Pulse rings */}
            {(callState === 'incoming' || callState === 'active') && (
              <>
                <div className="absolute inset-[-12px] rounded-full opacity-30 animate-ping"
                  style={{ background: 'hsl(var(--primary) / 0.3)', animationDuration: '1.5s' }} />
                <div className="absolute inset-[-24px] rounded-full opacity-15 animate-ping"
                  style={{ background: 'hsl(var(--primary) / 0.2)', animationDuration: '1.5s', animationDelay: '0.4s' }} />
              </>
            )}
            <div className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white relative z-10"
              style={{ background: getColor(chat.id), boxShadow: '0 0 40px hsl(var(--primary) / 0.4)' }}>
              {chat.isGroup ? '👥' : getInitials(chat.name)}
            </div>
            {/* Speaking wave */}
            {isBotSpeaking && (
              <div className="absolute -bottom-1 -right-1 z-20 flex items-center gap-0.5 bg-green-500 rounded-full px-1.5 py-0.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-0.5 rounded-full bg-white animate-pulse"
                    style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold font-golos text-white mt-4">{chat.name}</h2>
          <p className="text-sm mt-1" style={{ color: callState === 'active' ? 'hsl(var(--neon-green))' : 'hsl(var(--muted-foreground))' }}>
            {stateLabel[callState]}
          </p>
          {callState === 'active' && (
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {isFem ? '👩 Голос: женский' : '👨 Голос: мужской'} · AI-бот
            </p>
          )}
        </div>

        {/* Bot speech bubble */}
        {isBotSpeaking && botText && (
          <div className="mb-6 mx-4 animate-fade-in">
            <div className="glass rounded-2xl px-4 py-3" style={{ border: '1px solid hsl(var(--neon-green) / 0.3)' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 2, 1].map((h, i) => (
                    <div key={i} className="w-1 rounded-full bg-green-400 animate-pulse"
                      style={{ height: `${h * 5}px`, animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: 'hsl(var(--neon-green))' }}>говорит...</span>
              </div>
              <p className="text-sm text-white">{botText}</p>
            </div>
          </div>
        )}

        {/* Call log mini */}
        {callState === 'active' && callLog.length > 0 && !isBotSpeaking && (
          <div className="mb-5 mx-4 max-h-24 overflow-y-auto">
            {callLog.slice(-3).map((entry, i) => (
              <p key={i} className="text-xs mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {entry.role === 'bot' ? `🤖 ${entry.text}` : `🎤 ${entry.text}`}
              </p>
            ))}
          </div>
        )}

        {/* Incoming call buttons */}
        {callState === 'incoming' && (
          <div className="flex justify-center gap-16">
            <div className="text-center">
              <button onClick={handleDecline}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ background: 'hsl(0 75% 55%)' }}>
                <Icon name="PhoneOff" size={26} className="text-white" />
              </button>
              <p className="text-xs mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Отклонить</p>
            </div>
            <div className="text-center">
              <button onClick={handleAccept}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 animate-pulse-ring"
                style={{ background: 'hsl(145 80% 45%)' }}>
                <Icon name="Phone" size={26} className="text-white" />
              </button>
              <p className="text-xs mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Принять</p>
            </div>
          </div>
        )}

        {/* Active call controls */}
        {callState === 'active' && (
          <div className="space-y-4">
            <div className="flex justify-center gap-5">
              {[
                { icon: muted ? 'MicOff' : 'Mic', label: muted ? 'Включить' : 'Выкл. микр.', action: () => setMuted(v => !v), active: muted },
                { icon: speakerOn ? 'Volume2' : 'VolumeX', label: 'Громкость', action: () => setSpeakerOn(v => !v), active: !speakerOn },
                { icon: 'MessageCircle', label: 'Сообщение', action: () => {}, active: false },
              ].map(btn => (
                <div key={btn.icon} className="text-center">
                  <button onClick={btn.action}
                    className="w-13 h-13 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: btn.active ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--secondary))' }}>
                    <Icon name={btn.icon} size={20}
                      style={{ color: btn.active ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }} />
                  </button>
                  <p className="text-[10px] mt-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{btn.label}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <div className="text-center">
                <button onClick={handleDecline}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  style={{ background: 'hsl(0 75% 55%)' }}>
                  <Icon name="PhoneOff" size={26} className="text-white" />
                </button>
                <p className="text-xs mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Завершить</p>
              </div>
            </div>
          </div>
        )}

        {callState === 'connecting' && (
          <div className="flex justify-center">
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce"
                  style={{ background: 'hsl(var(--primary))', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
