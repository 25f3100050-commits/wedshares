'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';
import Link from 'next/link';

type Wedding = {
  id: string;
  couple_names: string;
};

type Media = {
  id: string;
  file_name: string;
  storage_url: string;
  storage_path: string;
  category: string;
};

export default function DownloadPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: weddingData } = await supabase
          .from('weddings')
          .select('id, couple_names')
          .eq('id', weddingId)
          .single();

        setWedding(weddingData);

        const { data: mediaData } = await supabase
          .from('media')
          .select('*')
          .eq('wedding_id', weddingId)
          .eq('status', 'approved');

        setMedia(mediaData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (weddingId) fetchData();
  }, [weddingId]);

  const handleDownload = async (type: 'all' | 'category' | 'individual', mediaId?: string) => {
    setDownloading(true);
    try {
      if (type === 'individual' && mediaId) {
        const item = media.find(m => m.id === mediaId);
        if (!item) return;

        const response = await fetch(item.storage_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = item.file_name;
        link.click();
      } else {
        const zip = new JSZip();
        const filtered = selectedCategory === 'all'
          ? media
          : media.filter(m => m.category === selectedCategory);

        for (const item of filtered) {
          const response = await fetch(item.storage_url);
          const blob = await response.blob();
          zip.file(`${item.category}/${item.file_name}`, blob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${wedding?.couple_names}-${new Date().toISOString().split('T')[0]}.zip`;
        link.click();
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 mx-auto mb-4 animate-spin" />
        </div>
      </main>
    );
  }

  const categories = Array.from(new Set(media.map(m => m.category)));

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/dashboard/wedding/${weddingId}`} className="inline-flex items-center text-pink-600 hover:text-rose-600 transition mb-8">
        <span className="mr-2">←</span> Back
      </Link>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Download Your Memories</h1>
        <p className="text-gray-600 mb-8">Select how you'd like to download your wedding photos and videos</p>

        {/* Download Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Download All */}
          <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">📦 Download All</h3>
            <p className="text-gray-600 mb-4">Get everything as a single ZIP file</p>
            <p className="text-sm text-gray-500 mb-4">{media.length} files</p>
            <button
              onClick={() => handleDownload('all')}
              disabled={downloading || media.length === 0}
              className="w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {downloading ? 'Downloading...' : 'Download ZIP'}
            </button>
          </div>

          {/* Download by Category */}
          {categories.length > 1 && (
            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-900 mb-3">📂 By Category</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={() => handleDownload('category')}
                disabled={downloading}
                className="w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {downloading ? 'Downloading...' : 'Download'}
              </button>
            </div>
          )}
        </div>

        {/* Individual Files */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Or download individual files</h2>
          {media.length === 0 ? (
            <p className="text-gray-600">No approved media to download</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {media.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.file_name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <button
                    onClick={() => handleDownload('individual', item.id)}
                    disabled={downloading}
                    className="ml-4 px-4 py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
                  >
                    ⬇️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
