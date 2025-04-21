import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import Providers from './providers';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'RentaX',
  description: 'RentaX is a rental web application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>{children}</Providers>
        <Toaster closeButton />
      </body>
    </html>
  );
}
