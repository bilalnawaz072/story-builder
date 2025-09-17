'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function StoryNav({ storyId }: { storyId: string }) {
  const pathname = usePathname();
  const basePath = `/stories/${storyId}`;

  const navItems = [
    { name: 'Canvas', href: basePath },
    { name: 'Characters', href: `${basePath}/characters` },
    // NEW ITEM
    { name: 'Assets', href: `${basePath}/assets` },
    { name: 'Documents', href: `${basePath}/documents` },
    { name: 'Analytics', href: `${basePath}/analytics` },

  ];

  return (
    <nav className="mt-4 -mb-px flex space-x-2">
    {navItems.map((item) => (
      <Button key={item.name} asChild variant="ghost" className={cn(
          'hover:bg-accent hover:text-accent-foreground',
          pathname === item.href 
            ? 'border-b-2 border-primary rounded-none text-primary' 
            : 'border-b-2 border-transparent'
      )}>
          <Link href={item.href}>{item.name}</Link>
      </Button>
    ))}
  </nav>
  );
}