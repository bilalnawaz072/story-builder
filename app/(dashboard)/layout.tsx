import { SidebarWrap } from '@/components/dashboard/sidebar-wrap';
import { UserButton } from "@/components/auth/user-button";
import { redirect } from "next/navigation";
import { auth } from '../auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-shrink-0 border-r bg-background flex flex-col">
        <div className="flex-grow">
          <SidebarWrap />
        </div>
        <div className="p-4 border-t">
          <UserButton />
        </div>
      </aside>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}