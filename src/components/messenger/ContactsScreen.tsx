import { useState } from 'react';
import { Contact } from '@/types/messenger';
import Icon from '@/components/ui/icon';

interface ContactsScreenProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onStartChat: (contact: Contact) => void;
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
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function ContactsScreen({ contacts, onAddContact, onStartChat }: ContactsScreenProps) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');

  const filtered = contacts.filter(c =>
    `${c.firstName} ${c.lastName || ''}`.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  // Group by first letter
  const grouped: Record<string, Contact[]> = {};
  filtered.forEach(c => {
    const letter = c.firstName[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(c);
  });

  const handleAdd = () => {
    if (!newPhone.trim() || !newName.trim()) {
      setAddError('Введите номер и имя');
      return;
    }
    const digits = newPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      setAddError('Введите корректный номер');
      return;
    }
    const contact: Contact = {
      id: 'new_' + Date.now(),
      phone: newPhone,
      firstName: newName.trim(),
      online: false,
    };
    onAddContact(contact);
    setShowAdd(false);
    setNewPhone('');
    setNewName('');
    setAddError('');
  };

  return (
    <div className="flex-1 flex flex-col h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-golos text-white">Контакты</h2>
          <button onClick={() => setShowAdd(!showAdd)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}>
            <Icon name={showAdd ? 'X' : 'UserPlus'} size={17} className="text-white" />
          </button>
        </div>

        {/* Add contact form */}
        {showAdd && (
          <div className="glass rounded-2xl p-4 mb-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-white mb-3">Добавить контакт</h3>
            <div className="space-y-2 mb-3">
              <input className="input-glass w-full px-3 py-2.5 text-sm"
                placeholder="+7 900 000-00-00"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)} />
              <input className="input-glass w-full px-3 py-2.5 text-sm"
                placeholder="Имя контакта"
                value={newName}
                onChange={e => setNewName(e.target.value)} />
            </div>
            {addError && <p className="text-xs mb-2" style={{ color: 'hsl(var(--destructive))' }}>{addError}</p>}
            <div className="flex gap-2">
              <button onClick={handleAdd}
                className="flex-1 py-2 rounded-xl text-sm font-semibold btn-gradient">
                Добавить
              </button>
              <button onClick={() => { setShowAdd(false); setAddError(''); }}
                className="flex-1 py-2 rounded-xl text-sm transition-colors"
                style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}>
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'hsl(var(--muted-foreground))' }} />
          <input className="input-glass w-full pl-9 pr-4 py-2.5 text-sm"
            placeholder="Поиск по имени или номеру..."
            value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Contacts list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="text-xs mb-3 px-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Всего: {contacts.length} контактов
        </p>
        {Object.keys(grouped).sort().map(letter => (
          <div key={letter} className="mb-4">
            <div className="px-2 py-1 mb-1">
              <span className="text-xs font-bold" style={{ color: 'hsl(var(--primary))' }}>{letter}</span>
            </div>
            {grouped[letter].map((contact, i) => (
              <div key={contact.id}
                className="flex items-center gap-3 px-3 py-3 rounded-2xl mb-0.5 group transition-all hover:bg-secondary/60 animate-fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: getColor(contact.id) }}>
                    {getInitials(contact.firstName + ' ' + (contact.lastName || ''))}
                  </div>
                  {contact.online && <div className="online-dot absolute bottom-0 right-0" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">
                    {contact.firstName} {contact.lastName || ''}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {contact.online ? '🟢 онлайн' : contact.lastSeen ? `был(а) ${contact.lastSeen}` : contact.phone}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onStartChat(contact)}
                    className="p-2 rounded-xl transition-colors hover:bg-primary/20">
                    <Icon name="MessageCircle" size={16} style={{ color: 'hsl(var(--primary))' }} />
                  </button>
                  <button className="p-2 rounded-xl transition-colors hover:bg-primary/20">
                    <Icon name="Phone" size={16} style={{ color: 'hsl(var(--primary))' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {search ? 'Контакты не найдены' : 'Добавьте первый контакт'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
