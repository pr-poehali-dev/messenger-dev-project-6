import { Chat, Contact, Channel } from '@/types/messenger';

export const mockChats: Chat[] = [
  {
    id: 'c1',
    name: 'Александр Смирнов',
    lastMessage: 'Окей, договорились! Увидимся в 18:00',
    lastTime: '14:32',
    unread: 2,
    online: true,
    messages: [
      { id: 'm1', chatId: 'c1', senderId: 'c1', text: 'Привет! Как дела?', time: '14:20', read: true, type: 'text' },
      { id: 'm2', chatId: 'c1', senderId: 'me', text: 'Отлично! Встретимся сегодня?', time: '14:25', read: true, type: 'text' },
      { id: 'm3', chatId: 'c1', senderId: 'c1', text: 'Окей, договорились! Увидимся в 18:00', time: '14:32', read: false, type: 'text' },
    ]
  },
  {
    id: 'c2',
    name: 'Мария Иванова',
    lastMessage: 'Отправила файлы на почту',
    lastTime: '13:15',
    unread: 0,
    online: false,
    lastSeen: 'был(а) час назад',
    messages: [
      { id: 'm4', chatId: 'c2', senderId: 'c2', text: 'Добрый день! Вот документы', time: '13:10', read: true, type: 'text' },
      { id: 'm5', chatId: 'c2', senderId: 'c2', text: 'Отправила файлы на почту', time: '13:15', read: true, type: 'text' },
    ]
  },
  {
    id: 'c3',
    name: 'Команда проекта',
    lastMessage: 'Денис: Деплой прошёл успешно 🚀',
    lastTime: '12:05',
    unread: 5,
    online: false,
    isGroup: true,
    messages: [
      { id: 'm6', chatId: 'c3', senderId: 'denis', text: 'Деплой прошёл успешно 🚀', time: '12:05', read: false, type: 'text' },
      { id: 'm7', chatId: 'c3', senderId: 'me', text: 'Отлично! Всем спасибо', time: '11:50', read: true, type: 'text' },
    ]
  },
  {
    id: 'c4',
    name: 'Дмитрий Козлов',
    lastMessage: 'Спасибо за помощь!',
    lastTime: 'вчера',
    unread: 0,
    online: true,
    messages: [
      { id: 'm8', chatId: 'c4', senderId: 'c4', text: 'Спасибо за помощь!', time: '19:30', read: true, type: 'text' },
    ]
  },
  {
    id: 'c5',
    name: 'Анна Петрова',
    lastMessage: 'Хорошо, посмотрю позже',
    lastTime: 'вчера',
    unread: 1,
    online: false,
    messages: [
      { id: 'm9', chatId: 'c5', senderId: 'c5', text: 'Хорошо, посмотрю позже', time: '17:45', read: false, type: 'text' },
    ]
  },
];

export const mockContacts: Contact[] = [
  { id: 'ct1', phone: '+7 900 123-45-67', firstName: 'Александр', lastName: 'Смирнов', online: true },
  { id: 'ct2', phone: '+7 912 234-56-78', firstName: 'Мария', lastName: 'Иванова', online: false, lastSeen: 'час назад' },
  { id: 'ct3', phone: '+7 925 345-67-89', firstName: 'Дмитрий', lastName: 'Козлов', online: true },
  { id: 'ct4', phone: '+7 930 456-78-90', firstName: 'Анна', lastName: 'Петрова', online: false, lastSeen: 'вчера' },
  { id: 'ct5', phone: '+7 945 567-89-01', firstName: 'Иван', lastName: 'Сидоров', online: false, lastSeen: '3 дня назад' },
  { id: 'ct6', phone: '+7 960 678-90-12', firstName: 'Елена', lastName: 'Новикова', online: true },
];

export const mockChannels: Channel[] = [
  {
    id: 'ch1',
    name: 'Технологии будущего',
    description: 'Новости AI, IT и технологий',
    subscribers: 128400,
    lastPost: 'OpenAI выпустила новую версию — детали внутри 🔥',
    lastTime: '10 мин',
    unread: 3,
    verified: true,
    messages: [
      { id: 'cm1', chatId: 'ch1', senderId: 'ch1', text: 'OpenAI выпустила новую версию — детали внутри 🔥', time: '10:00', read: false, type: 'text' },
      { id: 'cm2', chatId: 'ch1', senderId: 'ch1', text: 'Обзор лучших инструментов разработки 2025 года', time: 'вчера', read: true, type: 'text' },
    ]
  },
  {
    id: 'ch2',
    name: 'Дизайн и Творчество',
    description: 'Вдохновение для дизайнеров',
    subscribers: 54200,
    lastPost: 'Тренды UI/UX 2025: что нужно знать каждому',
    lastTime: '2 ч',
    unread: 1,
    verified: false,
    messages: [
      { id: 'cm3', chatId: 'ch2', senderId: 'ch2', text: 'Тренды UI/UX 2025: что нужно знать каждому', time: '2 ч', read: false, type: 'text' },
    ]
  },
  {
    id: 'ch3',
    name: 'Криптовалюты Live',
    description: 'Актуальные курсы и анализ',
    subscribers: 89700,
    lastPost: 'BTC пробил отметку $95,000 📈',
    lastTime: '5 мин',
    unread: 8,
    verified: true,
    messages: [
      { id: 'cm4', chatId: 'ch3', senderId: 'ch3', text: 'BTC пробил отметку $95,000 📈', time: '5 мин', read: false, type: 'text' },
    ]
  },
];
