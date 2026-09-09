'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };
    checkUser();
  }, []);

  const isAuthPage = pathname?.includes('/auth');
  const isGuestPage = pathname?.includes('/guest');

  if (isAuthPage || isGuestPage) return null;

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          WedShares
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 transition">
            How it works
          </Link>
          <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition">
            Features
          </Link>
          <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse" />
          ) : user ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition">
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition">
                Sign in
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:opacity-90 transition">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
