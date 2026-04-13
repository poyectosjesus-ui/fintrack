import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden">
      {/* Sidebar for Desktop */}
      <Sidebar />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Navbar user={session.user} />
        
        <main className="flex-1 overflow-y-auto w-full pb-20 md:pb-0">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <MobileBottomNav />
    </div>
  );
}

// Podríamos ponerlo en su propio archivo, pero por simplicidad lo hago aquí o lo pongo en Sidebar
import { MobileBottomNav } from '@/components/layout/Sidebar';
