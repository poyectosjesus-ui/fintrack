import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { NativeLayout } from '@/components/native/NativeLayout';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <NativeLayout user={session.user}>
      {children}
    </NativeLayout>
  );
}
