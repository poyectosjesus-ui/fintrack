import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
export default async function MainAppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <AppLayout user={session.user}>
      {children}
    </AppLayout>
  );
}
