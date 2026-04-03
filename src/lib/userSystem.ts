// ====== USER SYSTEM ======
// Уникальные коды входа для каждого зарегистрированного пользователя
// Каждый номер телефона получает свой уникальный 6-значный код

export interface RegisteredUser {
  phone: string;           // нормализованный номер без +
  code: string;            // уникальный код входа
  firstName: string;
  lastName?: string;
  role: 'admin' | 'moderator' | 'user';
  banned: boolean;
  banReason?: string;
  banUntil?: string;       // ISO date или 'permanent'
  bannedBy?: string;
}

// Список заранее зарегистрированных пользователей (предустановленные)
export const PRESET_USERS: RegisteredUser[] = [
  {
    phone: '79043748313',
    code: '000000',          // Секретный код суперадмина
    firstName: 'Администратор',
    role: 'admin',
    banned: false,
  },
  {
    phone: '79001112233',
    code: '847291',
    firstName: 'Коля',
    lastName: 'Морозов',
    role: 'moderator',
    banned: false,
  },
  {
    phone: '79002223344',
    code: '563018',
    firstName: 'Витя',
    lastName: 'Соколов',
    role: 'moderator',
    banned: false,
  },
  {
    phone: '79003334455',
    code: '719204',
    firstName: 'Олег',
    lastName: 'Беляев',
    role: 'moderator',
    banned: false,
  },
];

const STORAGE_KEY = 'volna_user_registry';

export function getRegistry(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RegisteredUser[];
  } catch { /* ignore */ }
  // Инициализируем с предустановленными пользователями
  localStorage.setItem(STORAGE_KEY, JSON.stringify(PRESET_USERS));
  return [...PRESET_USERS];
}

export function saveRegistry(registry: RegisteredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
}

export function findUser(phone: string): RegisteredUser | undefined {
  const normalized = phone.replace(/\D/g, '');
  const registry = getRegistry();
  return registry.find(u => u.phone.replace(/\D/g, '') === normalized);
}

// Генерация уникального 6-значного кода
function generateUniqueCode(registry: RegisteredUser[]): string {
  const used = new Set(registry.map(u => u.code));
  let code: string;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (used.has(code));
  return code;
}

export function registerOrGetCode(phone: string): { code: string; isNew: boolean; banned: boolean; banReason?: string } {
  const normalized = phone.replace(/\D/g, '');
  const registry = getRegistry();
  const existing = registry.find(u => u.phone.replace(/\D/g, '') === normalized);

  if (existing) {
    if (existing.banned) {
      return { code: existing.code, isNew: false, banned: true, banReason: existing.banReason };
    }
    return { code: existing.code, isNew: false, banned: false };
  }

  // Новый пользователь — генерируем уникальный код
  const newUser: RegisteredUser = {
    phone: normalized,
    code: generateUniqueCode(registry),
    firstName: '',
    role: 'user',
    banned: false,
  };
  registry.push(newUser);
  saveRegistry(registry);
  return { code: newUser.code, isNew: true, banned: false };
}

export function banUser(phone: string, reason: string, duration: 'month' | 'year' | 'permanent', bannedBy: string): boolean {
  const normalized = phone.replace(/\D/g, '');
  const registry = getRegistry();
  const idx = registry.findIndex(u => u.phone.replace(/\D/g, '') === normalized);
  if (idx === -1) return false;

  const until = duration === 'permanent'
    ? 'permanent'
    : duration === 'year'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  registry[idx].banned = true;
  registry[idx].banReason = reason;
  registry[idx].banUntil = until;
  registry[idx].bannedBy = bannedBy;
  saveRegistry(registry);
  return true;
}

export function unbanUser(phone: string): boolean {
  const normalized = phone.replace(/\D/g, '');
  const registry = getRegistry();
  const idx = registry.findIndex(u => u.phone.replace(/\D/g, '') === normalized);
  if (idx === -1) return false;

  registry[idx].banned = false;
  delete registry[idx].banReason;
  delete registry[idx].banUntil;
  delete registry[idx].bannedBy;
  saveRegistry(registry);
  return true;
}

export function isAdmin(phone: string): boolean {
  const user = findUser(phone);
  return user?.role === 'admin';
}

export function isModerator(phone: string): boolean {
  const user = findUser(phone);
  return user?.role === 'admin' || user?.role === 'moderator';
}

export function getAllUsers(): RegisteredUser[] {
  return getRegistry();
}

export function formatBanUntil(until?: string): string {
  if (!until) return '';
  if (until === 'permanent') return 'навсегда';
  const d = new Date(until);
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ====== МАТ-ФИЛЬТР ======
const MAT_WORDS = [
  'блять', 'блин', 'хуй', 'хуя', 'хуе', 'пизд', 'ебать', 'ебал', 'ёбан',
  'сука', 'суки', 'мудак', 'мудил', 'пиздец', 'залупа', 'долбоёб', 'долбоеб',
  'шлюх', 'шлюха', 'ёб', 'еб твою', 'нахуй', 'нахер', 'ёбт', 'ёбаный',
  'ёб твою', 'бля', 'пиздить', 'уёбок', 'уебок',
];

const ADULT_WORDS = [
  'порно', 'секс', 'член', 'влагалищ', 'анал', 'минет', 'куни',
  '18+', 'xxx', 'эрот',
];

export function checkMessageContent(text: string): { hasMat: boolean; hasAdult: boolean } {
  const lower = text.toLowerCase();
  const hasMat = MAT_WORDS.some(w => lower.includes(w));
  const hasAdult = ADULT_WORDS.some(w => lower.includes(w));
  return { hasMat, hasAdult };
}
