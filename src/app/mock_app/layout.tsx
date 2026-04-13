import { NativeLayout } from '@/components/native/NativeLayout';

export default function MockAppRootLayout({ children }: { children: React.ReactNode }) {
  return <NativeLayout>{children}</NativeLayout>;
}
