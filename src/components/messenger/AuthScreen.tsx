import { useState } from 'react';
import { User } from '@/types/messenger';
import Icon from '@/components/ui/icon';
import { registerOrGetCode, findUser, getRegistry, saveRegistry } from '@/lib/userSystem';

interface AuthScreenProps {
  onAuth: (user: User) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [step, setStep] = useState<'phone' | 'code' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length === 0) return '';
    let result = '+7';
    if (digits.length > 1) result += ' ' + digits.slice(1, 4);
    if (digits.length > 4) result += ' ' + digits.slice(4, 7);
    if (digits.length > 7) result += '-' + digits.slice(7, 9);
    if (digits.length > 9) result += '-' + digits.slice(9, 11);
    return result;
  };

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setPhone(formatPhone(digits.startsWith('7') ? digits : '7' + digits));
  };

  const handleSendCode = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 11) { setError('Введите корректный номер телефона'); return; }
    setError('');

    const result = registerOrGetCode(phone);
    if (result.banned) {
      setError(`🚫 Аккаунт заблокирован. Причина: ${result.banReason || 'нарушение правил'}`);
      return;
    }

    setExpectedCode(result.code);
    setIsNewUser(result.isNew);
    setStep('code');

    // Если есть сохранённое имя — предзаполняем
    const saved = findUser(phone);
    if (saved?.firstName) setFirstName(saved.firstName);
    if (saved?.lastName) setLastName(saved.lastName || '');
  };

  const handleVerifyCode = () => {
    if (code.length < 4) { setError('Введите код'); return; }
    if (code !== expectedCode) {
      setError('Неверный код. Проверьте и попробуйте снова.');
      return;
    }
    setError('');

    // Если уже зарегистрирован и есть имя — сразу входим
    const saved = findUser(phone);
    if (saved?.firstName && !isNewUser) {
      const userData: User = {
        id: `user_${phone.replace(/\D/g, '')}`,
        phone,
        firstName: saved.firstName,
        lastName: saved.lastName,
        online: true,
        role: saved.role,
      };
      localStorage.setItem('volna_user', JSON.stringify(userData));
      onAuth(userData);
      return;
    }

    setStep('profile');
  };

  const handleCreateProfile = () => {
    if (!firstName.trim()) { setError('Введите имя'); return; }
    setError('');

    const phoneDigits = phone.replace(/\D/g, '');
    const saved = findUser(phone);
    const role = saved?.role || 'user';

    const newUser: User = {
      id: `user_${phoneDigits}`,
      phone,
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      username: username.trim() || undefined,
      online: true,
      role,
    };

    // Обновляем имя в реестре
    const registry = getRegistry();
    const idx = registry.findIndex((u: { phone: string }) => u.phone.replace(/\D/g, '') === phoneDigits);
    if (idx !== -1) {
      registry[idx].firstName = firstName.trim();
      registry[idx].lastName = lastName.trim() || undefined;
      saveRegistry(registry);
    }

    localStorage.setItem('volna_user', JSON.stringify(newUser));
    onAuth(newUser);
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[80px]"
        style={{ background: 'radial-gradient(circle, hsl(260 80% 65%), transparent)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[80px]"
        style={{ background: 'radial-gradient(circle, hsl(195 90% 55%), transparent)' }} />

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 neon-glow animate-float"
            style={{ background: 'linear-gradient(135deg, hsl(260 80% 65%), hsl(195 90% 55%))' }}>
            <span className="text-3xl">🌊</span>
          </div>
          <h1 className="text-3xl font-bold font-golos gradient-text">Volna</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Мессенджер нового поколения
          </p>
        </div>

        <div className="glass-strong rounded-3xl p-6">
          {step === 'phone' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold font-golos mb-1 text-white">Войти или зарегистрироваться</h2>
              <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Введите номер телефона для входа
              </p>
              <div className="mb-4">
                <label className="text-xs font-medium mb-2 block" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Номер телефона
                </label>
                <input
                  className="input-glass w-full px-4 py-3 text-base"
                  type="tel"
                  placeholder="+7 900 000-00-00"
                  value={phone}
                  onChange={handlePhone}
                  onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                  autoFocus
                />
              </div>
              {error && (
                <div className="px-3 py-2 rounded-xl mb-3" style={{ background: 'hsl(var(--destructive) / 0.15)', border: '1px solid hsl(var(--destructive) / 0.3)' }}>
                  <p className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>
                </div>
              )}
              <button onClick={handleSendCode} className="btn-gradient w-full py-3 rounded-xl font-semibold text-base">
                Получить код
              </button>
            </div>
          )}

          {step === 'code' && (
            <div className="animate-fade-in">
              <button onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                className="flex items-center gap-1 text-sm mb-4 transition-colors hover:text-white"
                style={{ color: 'hsl(var(--muted-foreground))' }}>
                <Icon name="ArrowLeft" size={16} /> Назад
              </button>
              <h2 className="text-xl font-semibold font-golos mb-1 text-white">Код подтверждения</h2>
              <p className="text-sm mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Введите код для <span className="text-white font-medium">{phone}</span>
              </p>
              {/* Подсказка с кодом */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
                style={{ background: 'hsl(var(--primary) / 0.12)', border: '1px solid hsl(var(--primary) / 0.3)' }}>
                <span className="text-base">🔐</span>
                <div>
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {isNewUser ? 'Ваш персональный код (сохраните его):' : 'Ваш код входа:'}
                  </p>
                  <p className="text-lg font-bold tracking-widest text-white">{expectedCode}</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium mb-2 block" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Введите код
                </label>
                <input
                  className="input-glass w-full px-4 py-3 text-2xl text-center tracking-[0.5em] font-bold"
                  type="text"
                  placeholder="• • • • • •"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
                  autoFocus
                />
              </div>
              {error && <p className="text-xs mb-3" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>}
              <button onClick={handleVerifyCode} className="btn-gradient w-full py-3 rounded-xl font-semibold text-base">
                Подтвердить
              </button>
            </div>
          )}

          {step === 'profile' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold font-golos mb-1 text-white">Ваш профиль</h2>
              <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Как вас зовут? (можно изменить позже)
              </p>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer neon-glow transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, hsl(260 80% 65%), hsl(195 90% 55%))' }}>
                  <span className="text-3xl">{firstName ? firstName[0].toUpperCase() : '+'}</span>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'hsl(var(--muted-foreground))' }}>Имя *</label>
                  <input className="input-glass w-full px-4 py-3" placeholder="Иван"
                    value={firstName} onChange={e => setFirstName(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'hsl(var(--muted-foreground))' }}>Фамилия (необязательно)</label>
                  <input className="input-glass w-full px-4 py-3" placeholder="Петров"
                    value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'hsl(var(--muted-foreground))' }}>Имя пользователя (необязательно)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>@</span>
                    <input className="input-glass w-full pl-8 pr-4 py-3" placeholder="username"
                      value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
                  </div>
                </div>
              </div>
              {error && <p className="text-xs mb-3" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>}
              <button onClick={handleCreateProfile} className="btn-gradient w-full py-3 rounded-xl font-semibold text-base">
                Готово
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {(['phone', 'code', 'profile'] as const).map((s, i) => (
            <div key={i} className="h-1 rounded-full transition-all duration-300"
              style={{
                width: step === s ? '24px' : '8px',
                background: step === s
                  ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))'
                  : 'hsl(var(--border))'
              }} />
          ))}
        </div>
      </div>
    </div>
  );
}