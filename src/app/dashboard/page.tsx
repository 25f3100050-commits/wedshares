'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Wedding = {
  id: string;
  couple_names: string;
  event_name: string;
  event_date: string;
  location: string;
  cover_image_url: string | null;
  public_url: string;
  statistics: any;
};

export default function DashboardPage() {
  const router = useRouter();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!authData.user) {
          router.push('/auth/login');
          return;
        }
        setUser(authData.user);

        // Get user's weddings
        const { data, error } = await supabase
          .from('weddings')
          .select('*')
          .eq('owner_id', authData.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWeddings(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">WedShares</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">My Weddings</h2>
          <Link
            href="/dashboard/create"
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            + Create Wedding
          </Link>
        </div>

        {weddings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">No weddings yet. Create your first one!</p>
            <Link
              href="/dashboard/create"
              className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Create Your First Wedding
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddings.map((wedding) => (
              <div key={wedding.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                {wedding.cover_image_url && (
                  <img
                    src={wedding.cover_image_url}
                    alt={wedding.couple_names}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{wedding.couple_names}</h3>
                  <p className="text-gray-600 mb-1">{wedding.event_name}</p>
                  <p className="text-gray-600 mb-4">{wedding.event_date} • {wedding.location}</p>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-gray-600">Photos</p>
                      <p className="text-xl font-bold text-blue-600">{wedding.statistics?.total_photos || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <p className="text-gray-600">Videos</p>
                      <p className="text-xl font-bold text-purple-600">{wedding.statistics?.total_videos || 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/wedding/${wedding.id}`}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 transition"
                    >
                      View
                    </Link>
                    <a
                      href={`/guest/${wedding.public_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition"
                    >
                      Share
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
