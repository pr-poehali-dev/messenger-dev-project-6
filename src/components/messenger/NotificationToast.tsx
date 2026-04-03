import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { playNotificationSound } from '@/lib/sounds';

interface Notification {
  id: string;
  from: string;
  text: string;
  time: string;
}

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map(notif => (
        <NotifItem key={notif.id} notif={notif} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function NotifItem({ notif, onDismiss }: { notif: Notification; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Play sound on mount
    playNotificationSound();
    setTimeout(() => setVisible(true), 10);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(notif.id), 300);
    }, 5000);
    return () => clearTimeout(t);
  }, [notif.id, onDismiss]);

  return (
    <div
      className="pointer-events-auto"
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
      <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[290px] max-w-[350px]"
        style={{ border: '1px solid hsl(var(--primary) / 0.35)', boxShadow: '0 8px 32px hsl(var(--primary) / 0.25)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 neon-glow"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}>
          <Icon name="MessageCircle" size={17} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-white truncate">{notif.from}</p>
            <span className="text-[10px] flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }}>{notif.time}</span>
          </div>
          <p className="text-xs truncate mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{notif.text}</p>
        </div>
        <button onClick={() => onDismiss(notif.id)} className="p-1 rounded-lg hover:bg-secondary/60 transition-colors flex-shrink-0">
          <Icon name="X" size={12} style={{ color: 'hsl(var(--muted-foreground))' }} />
        </button>
      </div>
    </div>
  );
}
