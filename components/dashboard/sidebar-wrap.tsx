'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarWrap() {
  const pathname = usePathname();
  const navItems = [
    { href: '/stories', label: 'Stories', icon: BookMarked },
    // ... add other future navigation items here
  ];

  return (
    <nav className="p-4">
      {navItems.map((item) => (
        <Link href={item.href} key={item.href}>
           <div
            className={cn(
              'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
              pathname.startsWith(item.href) ? 'bg-accent' : 'transparent'
            )}
           >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
}