import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WedShares - Wedding Photo Sharing Platform',
  description: 'Collect every candid photo and video from your wedding in one private gallery. No app. No complicated setup.',
  keywords: 'wedding, photo sharing, gallery, memories, event',
  openGraph: {
    title: 'WedShares - Your Wedding. Every Guest\'s Perspective.',
    description: 'The easiest way to collect and share wedding photos. Scan, upload, celebrate.',
    type: 'website',
    images: [{
      url: 'https://wedshares.vercel.app/og-image.png',
      width: 1200,
      height: 630,
    }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="white" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
