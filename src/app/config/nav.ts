import { MessageSquare, Activity, BookOpen, BarChart, History, Settings, BookPlus, FileEdit } from 'lucide-react';

export type Role = 'student' | 'lecturer';

export interface NavItem {
  icon: any;
  labelKey: string;
  path: string;
  roles?: Role[];
}

// labelKey resolves through the i18n dictionary (see i18n/translations.ts).
export const NAV_ITEMS: NavItem[] = [
  { icon: MessageSquare, labelKey: 'nav.chat',         path: '/' },
  { icon: Activity,      labelKey: 'nav.chatAnalyzer', path: '/chat-analyzer' },
  { icon: BookOpen,      labelKey: 'nav.library',      path: '/library' },
  { icon: BarChart,      labelKey: 'nav.reports',      path: '/reports' },
  { icon: BookPlus,      labelKey: 'nav.registerCourses', path: '/register-courses', roles: ['student'] },
  { icon: FileEdit,      labelKey: 'nav.manageCourses', path: '/manage-courses', roles: ['lecturer'] },
  { icon: History,       labelKey: 'nav.history',      path: '/history' },
  { icon: Settings,      labelKey: 'nav.settings',     path: '/settings' },
];

export const CHAT_LABEL = 'Research Chat';
