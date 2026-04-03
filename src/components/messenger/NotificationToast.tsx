import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

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

function NotifItem({ notif, onDismiss }: { notif: { id: string; from: string; text: string; time: string }; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(notif.id), 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [notif.id, onDismiss]);

  return (
    <div
      className="pointer-events-auto"
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
      <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[340px]"
        style={{ border: '1px solid hsl(var(--primary) / 0.3)', boxShadow: '0 8px 32px hsl(var(--primary) / 0.2)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 neon-glow"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}>
          <Icon name="MessageCircle" size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{notif.from}</p>
          <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{notif.text}</p>
        </div>
        <button onClick={() => onDismiss(notif.id)} className="p-1 rounded-lg hover:bg-secondary/60 transition-colors flex-shrink-0">
          <Icon name="X" size={12} style={{ color: 'hsl(var(--muted-foreground))' }} />
        </button>
      </div>
    </div>
  );
}
