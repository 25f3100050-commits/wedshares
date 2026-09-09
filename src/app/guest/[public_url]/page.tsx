'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Wedding = {
  id: string;
  couple_names: string;
  event_name: string;
  event_date: string;
  location: string;
  cover_image_url: string | null;
  privacy_settings: any;
  statistics: any;
};

type Media = {
  id: string;
  file_name: string;
  file_type: string;
  storage_url: string;
  uploader_name: string;
  category: string;
  likes: number;
  uploaded_at: string;
};

type Message = {
  id: string;
  uploader_name: string;
  message_text: string;
  created_at: string;
};

export default function GuestPage() {
  const params = useParams();
  const public_url = params.public_url as string;
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gallery' | 'messages'>('gallery');
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: weddingData, error: weddingError } = await supabase
          .from('weddings')
          .select('*')
          .eq('public_url', public_url)
          .single();

        if (weddingError) throw weddingError;
        setWedding(weddingData);

        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .eq('wedding_id', weddingData.id)
          .eq('status', 'approved')
          .order('uploaded_at', { ascending: false });

        if (mediaError) throw mediaError;
        setMedia(mediaData || []);

        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('*')
          .eq('wedding_id', weddingData.id)
          .order('created_at', { ascending: false });

        if (messageError) throw messageError;
        setMessages(messageData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (public_url) fetchData();
  }, [public_url]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading wedding...</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Wedding not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {wedding.cover_image_url && (
          <img
            src={wedding.cover_image_url}
            alt={wedding.couple_names}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{wedding.couple_names}</h1>
          <p className="text-lg md:text-xl opacity-90">{wedding.event_name}</p>
          <p className="text-sm md:text-base opacity-80 mt-4">
            {new Date(wedding.event_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </section>

      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-4 font-semibold border-b-2 transition ${
              activeTab === 'gallery'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Gallery ({media.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-4 font-semibold border-b-2 transition ${
              activeTab === 'messages'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className="ml-auto py-4 px-6 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            Upload Photos
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'gallery' && (
          <div>
            {media.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl mb-6 block">📸</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">No photos yet</h2>
                <p className="text-gray-600">Be the first to upload a photo!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedImage(item)}
                    className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
                  >
                    {item.file_type === 'image' ? (
                      <img
                        src={item.storage_url}
                        alt={item.file_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <video
                        src={item.storage_url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition opacity-0 group-hover:opacity-100 flex items-center justify-center">
                      <span className="text-white text-3xl">▶</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-6xl mb-6 block">💌</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">No messages yet</h2>
                  <p className="text-gray-600">Be the first to leave a message!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900">{message.uploader_name}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{message.message_text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            {selectedImage.file_type === 'image' ? (
              <img
                src={selectedImage.storage_url}
                alt={selectedImage.file_name}
                className="w-full rounded-lg"
              />
            ) : (
              <video
                src={selectedImage.storage_url}
                controls
                autoPlay
                className="w-full rounded-lg"
              />
            )}
            <p className="text-white text-center mt-4 text-sm">
              Uploaded by {selectedImage.uploader_name}
            </p>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:opacity-70 transition"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
