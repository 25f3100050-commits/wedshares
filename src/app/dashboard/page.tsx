'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Wedding = {
  id: string;
  couple_names: string;
  event_name: string;
  event_date: string;
  location: string;
  cover_image_url: string | null;
  public_url: string;
  statistics: any;
  created_at: string;
};

export default function DashboardPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeddings = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return;

        const { data, error } = await supabase
          .from('weddings')
          .select('*')
          .eq('owner_id', authData.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWeddings(data || []);
      } catch (error) {
        console.error('Error fetching weddings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeddings();
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 mx-auto mb-4 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Weddings</h1>
          <p className="text-gray-600">Create, manage, and share your wedding events</p>
        </div>
        <Link
          href="/dashboard/create"
          className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          + Create Wedding
        </Link>
      </div>

      {/* Wedding Cards Grid */}
      {weddings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">💒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No weddings yet</h2>
          <p className="text-gray-600 mb-8">Create your first wedding to start collecting memories</p>
          <Link
            href="/dashboard/create"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            Create Your First Wedding
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((wedding) => (
            <div key={wedding.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all">
              {/* Cover Image */}
              <div className="aspect-video bg-gradient-to-br from-pink-100 to-rose-100 overflow-hidden">
                {wedding.cover_image_url ? (
                  <img
                    src={wedding.cover_image_url}
                    alt={wedding.couple_names}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">💒</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{wedding.couple_names}</h3>
                <p className="text-gray-600 mb-1 font-medium">{wedding.event_name}</p>
                <p className="text-sm text-gray-500 mb-6">
                  {new Date(wedding.event_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6 py-4 border-y border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-600">{wedding.statistics?.total_photos || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Photos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{wedding.statistics?.total_videos || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Videos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{wedding.statistics?.total_guests || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Guests</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/wedding/${wedding.id}`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-center font-semibold rounded-lg hover:opacity-90 transition text-sm"
                  >
                    Manage
                  </Link>
                  <a
                    href={`/guest/${wedding.public_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-900 text-center font-semibold rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
