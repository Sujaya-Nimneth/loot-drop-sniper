import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Loot Drop Sniper — Shoot the Crates',
  description:
    'A fast-paced mobile-first web game. Snipe falling loot crates mid-air, dodge lag spikes, and chase the combo multiplier. How high can you score?',
  keywords: ['game', 'sniper', 'loot', 'mobile', 'web game', 'arcade'],
  authors: [{ name: 'Loot Drop Sniper' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#020617',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-200 font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}
