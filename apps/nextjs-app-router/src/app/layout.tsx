import { ZenClientProvider } from '@filezen/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FileZen App Router Example',
  description: 'Example of file uploads using Next.js App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ZenClientProvider>{children}</ZenClientProvider>
      </body>
    </html>
  );
}
