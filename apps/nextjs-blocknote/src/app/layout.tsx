import { ZenClientProvider } from '@filezen/react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FileZen BlockNote Editor',
  description: 'Rich text editor with FileZen image upload integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ZenClientProvider>
          {children}
        </ZenClientProvider>
      </body>
    </html>
  );
} 