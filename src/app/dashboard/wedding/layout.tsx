import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Management - WedShares',
};

export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
