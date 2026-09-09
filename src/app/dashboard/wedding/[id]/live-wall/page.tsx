'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Wedding = {
  id: string;
  couple_names: string;
  event_name: string;
  cover_image_url: string | null;
};

type Media = {
  id: string;
  storage_url: string;
  file_type: string;
  uploader_name: string;
};

export default function LiveWallPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: weddingData } = await supabase
          .from('weddings')
          .select('id, couple_names, event_name, cover_image_url')
          .eq('id', weddingId)
          .single();

        setWedding(weddingData);

        const { data: mediaData } = await supabase
          .from('media')
          .select('*')
          .eq('wedding_id', weddingId)
          .eq('status', 'approved')
          .order('uploaded_at', { ascending: false });

        setMedia(mediaData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (weddingId) fetchData();
  }, [weddingId]);

  useEffect(() => {
    if (!autoPlay || media.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % media.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, media.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 mx-auto mb-4 animate-spin" />
        </div>
      </div>
    );
  }

  const currentMedia = media[currentIndex];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {media.length === 0 ? (
          <div className="text-center text-white">
            <span className="text-8xl mb-6 block">🎉</span>
            <h1 className="text-4xl font-bold mb-4">Waiting for photos...</h1>
            <p className="text-xl opacity-75">Guests will appear here as they upload</p>
          </div>
        ) : (
          <>
            {/* Current Media */}
            <div className="w-full h-full flex items-center justify-center relative">
              {currentMedia.file_type === 'image' ? (
                <img
                  src={currentMedia.storage_url}
                  alt="Slide"
                  className="max-w-full max-h-full object-contain animate-fade-in"
                />
              ) : (
                <video
                  src={currentMedia.storage_url}
                  autoPlay
                  className="max-w-full max-h-full object-contain"
                />
              )}

              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8 text-white">
                <p className="text-sm opacity-75">Shared by</p>
                <p className="text-2xl font-bold">{currentMedia.uploader_name}</p>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              {media.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setAutoPlay(false);
                  }}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-8 text-center">
        <h1 className="text-4xl font-bold mb-2">{wedding?.couple_names}</h1>
        <p className="text-xl opacity-90">{wedding?.event_name}</p>
      </div>

      {/* Controls */}
      <div className="bg-black border-t border-gray-800 p-6 flex items-center justify-between text-white">
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentIndex(prev => (prev - 1 + media.length) % media.length)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            ← Previous
          </button>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 rounded-lg transition"
          >
            {autoPlay ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => setCurrentIndex(prev => (prev + 1) % media.length)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            Next →
          </button>
        </div>
        <Link href={`/dashboard/wedding/${weddingId}`} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
          Close
        </Link>
      </div>

      {/* CSS for fade animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
