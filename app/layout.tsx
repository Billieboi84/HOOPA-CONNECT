import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';
import { Providers } from '@/app/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display'
});

export const metadata: Metadata = {
  title: 'Hoopa Connect',
  description: 'Hoopa Connect connects the people of the Hoopa Valley with local news, jobs, marketplace listings, and trusted community resources.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
