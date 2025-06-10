import type { Metadata } from 'next';
import './globals.css';
import { FileZenProvider } from '@filezen/react';

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
        <FileZenProvider
          apiKey={process.env.NEXT_PUBLIC_FILEZEN_API_KEY}
          apiUrl={process.env.NEXT_PUBLIC_FILEZEN_API_URL}
          authorization={process.env.NEXT_PUBLIC_FILEZEN_AUTHORIZATION}
        >
          {children}
        </FileZenProvider>
      </body>
    </html>
  );
} 