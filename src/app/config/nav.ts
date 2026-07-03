import { MessageSquare, Activity, BookOpen, BarChart, History, Settings } from 'lucide-react';

// labelKey resolves through the i18n dictionary (see i18n/translations.ts).
export const NAV_ITEMS = [
  { icon: MessageSquare, labelKey: 'nav.chat',         path: '/' },
  { icon: Activity,      labelKey: 'nav.chatAnalyzer', path: '/chat-analyzer' },
  { icon: BookOpen,      labelKey: 'nav.library',      path: '/library' },
  { icon: BarChart,      labelKey: 'nav.reports',      path: '/reports' },
  { icon: History,       labelKey: 'nav.history',      path: '/history' },
  { icon: Settings,      labelKey: 'nav.settings',     path: '/settings' },
];

export const CHAT_LABEL = 'Research Chat';
