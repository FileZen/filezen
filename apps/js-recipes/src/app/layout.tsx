import { Navigation } from '@/components/Navigation';
import { ZenClientProvider } from '@filezen/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FileZen JavaScript Recipes',
  description:
    'Collection of FileZen JavaScript recipes and implementation patterns',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ZenClientProvider url={'http://localhost:3000'}>
          <Navigation />
          {children}
        </ZenClientProvider>
      </body>
    </html>
  );
}
