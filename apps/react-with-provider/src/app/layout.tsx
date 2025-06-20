import { ZenStorageProvider } from '@filezen/react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FileZen React SDK Example',
  description: 'Example app demonstrating how to use the @filezen/react SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ZenStorageProvider>{children}</ZenStorageProvider>
      </body>
    </html>
  );
}
