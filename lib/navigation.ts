import { BriefcaseBusiness, Home, LayoutGrid, Search, Users2 } from 'lucide-react';

export const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/marketplace', label: 'Marketplace', icon: LayoutGrid },
  { href: '/directory', label: 'Directory', icon: Search },
  { href: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { href: '/profile', label: 'Profile', icon: Users2 }
] as const;
