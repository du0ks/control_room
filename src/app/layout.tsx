import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ClientLayout } from './client-layout';

export const metadata: Metadata = {
  title: 'Cockpit',
  description: 'Matrix-inspired planning dashboard — command your day, week, month, and quarter.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cockpit',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0d0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
