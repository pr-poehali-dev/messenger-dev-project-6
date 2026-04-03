import { useState, useEffect } from 'react';
import { getAllUsers, banUser, unbanUser, formatBanUntil, RegisteredUser } from '@/lib/userSystem';
import { User } from '@/types/messenger';
import Icon from '@/components/ui/icon';

interface AdminPanelProps {
  currentUser: User;
}

type AdminTab = 'users' | 'bans' | 'logs' | 'stats';

const BAN_LOGS_KEY = 'volna_ban_logs';

interface BanLog {
  id: string;
  action: 'ban' | 'unban';
  targetPhone: string;
  targetName: string;
  reason?: string;
  duration?: string;
  byName: string;
  time: string;
}

function getLogs(): BanLog[] {
  try { return JSON.parse(localStorage.getItem(BAN_LOGS_KEY) || '[]'); } catch { return []; }
}
function addLog(log: BanLog) {
  const logs = getLogs();
  logs.unshift(log);
  localStorage.setItem(BAN_LOGS_KEY, JSON.stringify(logs.slice(0, 200)));
}

function StatusBadge({ user }: { user: RegisteredUser }) {
  if (user.banned) return <span className="text-sm" title="Забанен">🟥</span>;
  if (user.role === 'admin') return <span className="text-sm" title="Администратор">🛡️</span>;
  if (user.role === 'moderator') return <span className="text-sm" title="Модератор">⚔️</span>;
  return <span className="text-sm" title="В сети">🟢</span>;
}

export default function AdminPanel({ currentUser }: AdminPanelProps) {
  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [logs, setLogs] = useState<BanLog[]>([]);
  const [search, setSearch] = useState('');

  // Ban modal state
  const [banTarget, setBanTarget] = useState<RegisteredUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<'month' | 'year' | 'permanent'>('month');
  const [banError, setBanError] = useState('');

  // Manual ban by phone
  const [manualPhone, setManualPhone] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualDuration, setManualDuration] = useState<'month' | 'year' | 'permanent'>('month');
  const [manualResult, setManualResult] = useState('');

  const [stats] = useState({
    total: 0,
    banned: 0,
    online: 0,
    admins: 0,
  });

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    const all = getAllUsers();
    setUsers(all);
    setLogs(getLogs());
  };

  const handleBan = (u: RegisteredUser) => {
    setBanTarget(u);
    setBanReason('');
    setBanDuration('month');
    setBanError('');
  };

  const confirmBan = () => {
    if (!banTarget) return;
    if (!banReason.trim()) { setBanError('Укажите причину блокировки'); return; }
    banUser(banTarget.phone, banReason, banDuration, currentUser.firstName);
    addLog({
      id: Date.now().toString(),
      action: 'ban',
      targetPhone: banTarget.phone,
      targetName: banTarget.firstName || banTarget.phone,
      reason: banReason,
      duration: banDuration === 'month' ? '30 дней' : banDuration === 'year' ? '1 год' : 'навсегда',
      byName: currentUser.firstName,
      time: new Date().toLocaleString('ru'),
    });
    setBanTarget(null);
    refresh();
  };

  const handleUnban = (u: RegisteredUser) => {
    unbanUser(u.phone);
    addLog({
      id: Date.now().toString(),
      action: 'unban',
      targetPhone: u.phone,
      targetName: u.firstName || u.phone,
      byName: currentUser.firstName,
      time: new Date().toLocaleString('ru'),
    });
    refresh();
  };

  const handleManualBan = () => {
    if (!manualPhone.trim()) { setManualResult('❌ Введите номер телефона'); return; }
    if (!manualReason.trim()) { setManualResult('❌ Введите причину'); return; }
    const ok = banUser(manualPhone, manualReason, manualDuration, currentUser.firstName);
    if (!ok) { setManualResult('❌ Пользователь с таким номером не найден'); return; }
    addLog({
      id: Date.now().toString(),
      action: 'ban',
      targetPhone: manualPhone,
      targetName: manualPhone,
      reason: manualReason,
      duration: manualDuration === 'month' ? '30 дней' : manualDuration === 'year' ? '1 год' : 'навсегда',
      byName: currentUser.firstName,
      time: new Date().toLocaleString('ru'),
    });
    setManualResult(`✅ Пользователь ${manualPhone} заблокирован`);
    setManualPhone('');
    setManualReason('');
    refresh();
  };

  const handleManualUnban = () => {
    if (!manualPhone.trim()) { setManualResult('❌ Введите номер телефона'); return; }
    const ok = unbanUser(manualPhone);
    if (!ok) { setManualResult('❌ Пользователь не найден'); return; }
    addLog({
      id: Date.now().toString(),
      action: 'unban',
      targetPhone: manualPhone,
      targetName: manualPhone,
      byName: currentUser.firstName,
      time: new Date().toLocaleString('ru'),
    });
    setManualResult(`✅ Пользователь ${manualPhone} разблокирован`);
    setManualPhone('');
    refresh();
  };

  const filtered = users.filter(u =>
    u.phone.includes(search) ||
    u.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = users.length;
  const bannedCount = users.filter(u => u.banned).length;
  const adminsCount = users.filter(u => u.role === 'admin' || u.role === 'moderator').length;

  const tabs: { id: AdminTab; icon: string; label: string }[] = [
    { id: 'users', icon: 'Users', label: 'Пользователи' },
    { id: 'bans', icon: 'ShieldX', label: 'Бан/Разбан' },
    { id: 'logs', icon: 'ScrollText', label: 'Журнал' },
    { id: 'stats', icon: 'BarChart3', label: 'Статистика' },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 glass border-b" style={{ borderColor: 'hsl(var(--border) / 0.5)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, hsl(0 75% 55%), hsl(30 90% 55%))' }}>
            🛡️
          </div>
          <div>
            <h2 className="text-xl font-bold font-golos text-white">Панель администратора</h2>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Авторизован как: <span style={{ color: 'hsl(var(--primary))' }}>{currentUser.firstName}</span>
            </p>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Пользователей', value: totalUsers, color: 'hsl(var(--accent))' },
            { label: 'Забанено', value: bannedCount, color: 'hsl(var(--destructive))' },
            { label: 'Модераторов', value: adminsCount, color: 'hsl(var(--primary))' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-3 text-center">
              <p className="text-xl font-bold font-golos" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 border-b" style={{ borderColor: 'hsl(var(--border) / 0.5)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-medium transition-all ${tab === t.id ? 'nav-active' : 'hover:bg-secondary/60'}`}
            style={{ color: tab === t.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ===== USERS TAB ===== */}
        {tab === 'users' && (
          <div className="p-4">
            <div className="relative mb-3">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'hsl(var(--muted-foreground))' }} />
              <input className="input-glass w-full pl-8 pr-3 py-2.5 text-sm"
                placeholder="Поиск по номеру или имени..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              {filtered.map(u => (
                <div key={u.phone}
                  className="glass rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ border: u.banned ? '1px solid hsl(var(--destructive) / 0.3)' : '1px solid hsl(var(--border) / 0.3)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: u.banned ? 'hsl(0 60% 40%)' : u.role === 'admin' ? 'linear-gradient(135deg, hsl(30 100% 55%), hsl(0 80% 55%))' : 'linear-gradient(135deg, hsl(260 80% 65%), hsl(195 90% 55%))' }}>
                    {(u.firstName?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge user={u} />
                      <span className="text-sm font-semibold text-white truncate">
                        {u.firstName || '—'} {u.lastName || ''}
                      </span>
                      {u.role === 'admin' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                          style={{ background: 'hsl(0 75% 55% / 0.2)', color: 'hsl(0 75% 65%)' }}>ADMIN</span>
                      )}
                      {u.role === 'moderator' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                          style={{ background: 'hsl(260 80% 65% / 0.2)', color: 'hsl(260 80% 75%)' }}>MOD</span>
                      )}
                    </div>
                    <p className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      +{u.phone}
                    </p>
                    {u.banned && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--destructive))' }}>
                        🚫 {u.banReason} · до {formatBanUntil(u.banUntil)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!u.banned && u.role !== 'admin' && (
                      <button onClick={() => handleBan(u)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors hover:opacity-90"
                        style={{ background: 'hsl(var(--destructive) / 0.2)', color: 'hsl(var(--destructive))' }}>
                        Бан
                      </button>
                    )}
                    {u.banned && (
                      <button onClick={() => handleUnban(u)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors hover:opacity-90"
                        style={{ background: 'hsl(145 80% 50% / 0.2)', color: 'hsl(145 80% 60%)' }}>
                        Разбан
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== BAN/UNBAN TAB ===== */}
        {tab === 'bans' && (
          <div className="p-4 space-y-4">
            <div className="glass rounded-2xl p-5"
              style={{ border: '1px solid hsl(var(--destructive) / 0.3)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🚫</span>
                <h3 className="text-base font-bold text-white">Заблокировать по номеру</h3>
              </div>
              <div className="space-y-2">
                <input className="input-glass w-full px-3 py-2.5 text-sm"
                  placeholder="+7 900 000-00-00 или 79000000000"
                  value={manualPhone} onChange={e => setManualPhone(e.target.value)} />
                <input className="input-glass w-full px-3 py-2.5 text-sm"
                  placeholder="Причина блокировки"
                  value={manualReason} onChange={e => setManualReason(e.target.value)} />
                <div className="flex gap-2">
                  {([
                    { v: 'month', label: '30 дней' },
                    { v: 'year', label: '1 год' },
                    { v: 'permanent', label: 'Навсегда' },
                  ] as { v: 'month' | 'year' | 'permanent'; label: string }[]).map(d => (
                    <button key={d.v} onClick={() => setManualDuration(d.v)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${manualDuration === d.v ? '' : 'hover:bg-secondary/80'}`}
                      style={{
                        background: manualDuration === d.v ? 'hsl(var(--destructive) / 0.3)' : 'hsl(var(--secondary))',
                        color: manualDuration === d.v ? 'hsl(var(--destructive))' : 'hsl(var(--foreground))',
                        border: manualDuration === d.v ? '1px solid hsl(var(--destructive) / 0.5)' : 'none',
                      }}>
                      {d.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleManualBan}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'hsl(var(--destructive))' }}>
                  🚫 Заблокировать
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl p-5"
              style={{ border: '1px solid hsl(145 80% 50% / 0.3)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✅</span>
                <h3 className="text-base font-bold text-white">Разблокировать по номеру</h3>
              </div>
              <div className="space-y-2">
                <input className="input-glass w-full px-3 py-2.5 text-sm"
                  placeholder="+7 900 000-00-00 или 79000000000"
                  value={manualPhone} onChange={e => setManualPhone(e.target.value)} />
                <button onClick={handleManualUnban}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'hsl(145 80% 40%)' }}>
                  ✅ Разблокировать
                </button>
              </div>
            </div>

            {manualResult && (
              <div className="px-4 py-3 rounded-xl animate-fade-in"
                style={{ background: manualResult.startsWith('✅') ? 'hsl(145 80% 50% / 0.15)' : 'hsl(var(--destructive) / 0.15)', border: `1px solid ${manualResult.startsWith('✅') ? 'hsl(145 80% 50% / 0.3)' : 'hsl(var(--destructive) / 0.3)'}` }}>
                <p className="text-sm">{manualResult}</p>
              </div>
            )}

            {/* Список забаненных */}
            <div>
              <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                ЗАБЛОКИРОВАННЫЕ ({users.filter(u => u.banned).length})
              </p>
              {users.filter(u => u.banned).map(u => (
                <div key={u.phone} className="glass rounded-2xl px-4 py-3 mb-2 flex items-center gap-3"
                  style={{ border: '1px solid hsl(var(--destructive) / 0.25)' }}>
                  <span className="text-xl">🟥</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{u.firstName || u.phone}</p>
                    <p className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>{u.banReason}</p>
                    <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      до {formatBanUntil(u.banUntil)} · бан от: {u.bannedBy}
                    </p>
                  </div>
                  <button onClick={() => handleUnban(u)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'hsl(145 80% 50% / 0.2)', color: 'hsl(145 80% 60%)' }}>
                    Разбан
                  </button>
                </div>
              ))}
              {users.filter(u => u.banned).length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Нет заблокированных пользователей
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===== LOGS TAB ===== */}
        {tab === 'logs' && (
          <div className="p-4">
            <p className="text-xs font-semibold mb-3 px-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              ЖУРНАЛ ДЕЙСТВИЙ ({logs.length})
            </p>
            {logs.length === 0 && (
              <div className="text-center py-10">
                <span className="text-4xl">📋</span>
                <p className="text-sm mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Журнал пуст</p>
              </div>
            )}
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="glass rounded-2xl px-4 py-3"
                  style={{ border: `1px solid ${log.action === 'ban' ? 'hsl(var(--destructive) / 0.25)' : 'hsl(145 80% 50% / 0.2)'}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{log.action === 'ban' ? '🚫' : '✅'}</span>
                    <span className="text-sm font-semibold text-white">
                      {log.action === 'ban' ? 'Блокировка' : 'Разблокировка'}
                    </span>
                    <span className="text-[10px] ml-auto" style={{ color: 'hsl(var(--muted-foreground))' }}>{log.time}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Пользователь: <span className="text-white">{log.targetName}</span> ({log.targetPhone})
                  </p>
                  {log.reason && (
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Причина: <span style={{ color: 'hsl(var(--destructive))' }}>{log.reason}</span>
                    </p>
                  )}
                  {log.duration && (
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Срок: {log.duration}
                    </p>
                  )}
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Кем: <span style={{ color: 'hsl(var(--primary))' }}>{log.byName}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== STATS TAB ===== */}
        {tab === 'stats' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '👥', label: 'Всего пользователей', value: totalUsers, color: 'hsl(var(--accent))' },
                { emoji: '🟢', label: 'Активных', value: totalUsers - bannedCount, color: 'hsl(145 80% 50%)' },
                { emoji: '🟥', label: 'Заблокировано', value: bannedCount, color: 'hsl(var(--destructive))' },
                { emoji: '🛡️', label: 'Модераторов/Админов', value: adminsCount, color: 'hsl(var(--primary))' },
                { emoji: '📋', label: 'Записей в журнале', value: logs.length, color: 'hsl(30 90% 60%)' },
              ].map((s, i) => (
                <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className="text-2xl font-bold font-golos" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Команда модераторов */}
            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-semibold mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>КОМАНДА МОДЕРАЦИИ</p>
              {users.filter(u => u.role === 'admin' || u.role === 'moderator').map(u => (
                <div key={u.phone} className="flex items-center gap-3 py-2">
                  <span className="text-lg">{u.role === 'admin' ? '🛡️' : '⚔️'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{u.firstName} {u.lastName || ''}</p>
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>+{u.phone}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg font-bold"
                    style={{ background: u.role === 'admin' ? 'hsl(0 75% 55% / 0.2)' : 'hsl(260 80% 65% / 0.2)', color: u.role === 'admin' ? 'hsl(0 75% 65%)' : 'hsl(260 80% 75%)' }}>
                    {u.role === 'admin' ? 'ADMIN' : 'MOD'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ban confirmation modal */}
      {banTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-strong rounded-3xl p-6 w-full max-w-sm animate-scale-in"
            style={{ border: '1px solid hsl(var(--destructive) / 0.4)' }}>
            <h3 className="text-lg font-bold font-golos text-white mb-1">Заблокировать пользователя</h3>
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {banTarget.firstName} {banTarget.lastName || ''} · +{banTarget.phone}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'hsl(var(--muted-foreground))' }}>Причина блокировки *</label>
                <input className="input-glass w-full px-3 py-2.5 text-sm"
                  placeholder="Нарушение правил, мат, 18+ контент..."
                  value={banReason} onChange={e => setBanReason(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'hsl(var(--muted-foreground))' }}>Срок блокировки</label>
                <div className="flex gap-2">
                  {([
                    { v: 'month', label: '30 дней' },
                    { v: 'year', label: '1 год' },
                    { v: 'permanent', label: 'Навсегда' },
                  ] as { v: 'month' | 'year' | 'permanent'; label: string }[]).map(d => (
                    <button key={d.v} onClick={() => setBanDuration(d.v)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all`}
                      style={{
                        background: banDuration === d.v ? 'hsl(var(--destructive) / 0.3)' : 'hsl(var(--secondary))',
                        color: banDuration === d.v ? 'hsl(var(--destructive))' : 'hsl(var(--foreground))',
                        border: banDuration === d.v ? '1px solid hsl(var(--destructive) / 0.5)' : 'none',
                      }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {banError && <p className="text-xs mt-2" style={{ color: 'hsl(var(--destructive))' }}>{banError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={confirmBan}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'hsl(var(--destructive))' }}>
                🚫 Заблокировать
              </button>
              <button onClick={() => setBanTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
                style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
