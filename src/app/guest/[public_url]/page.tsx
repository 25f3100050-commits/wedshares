'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Wedding = {
  id: string;
  couple_names: string;
  event_name: string;
  event_date: string;
  location: string;
  description: string;
  cover_image_url: string | null;
  privacy_settings: any;
  statistics: any;
};

type Media = {
  id: string;
  file_name: string;
  file_type: string;
  storage_url: string;
  thumbnail_url: string | null;
  category: string;
  uploader_name: string;
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
  const [uploading, setUploading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch wedding
        const { data: weddingData, error: weddingError } = await supabase
          .from('weddings')
          .select('*')
          .eq('public_url', public_url)
          .single();

        if (weddingError) throw weddingError;
        setWedding(weddingData);

        // Fetch media
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .eq('wedding_id', weddingData.id)
          .eq('status', 'approved')
          .order('uploaded_at', { ascending: false });

        if (mediaError) throw mediaError;
        setMedia(mediaData || []);

        // Fetch messages
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

    fetchData();
  }, [public_url]);

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wedding || !guestName || !guestMessage) return;

    setUploading(true);
    try {
      const { error } = await supabase.from('messages').insert([
        {
          wedding_id: wedding.id,
          uploader_session_id: Math.random().toString(),
          uploader_name: guestName,
          message_text: guestMessage,
        },
      ]);

      if (error) throw error;

      setGuestMessage('');
      // Refresh messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('wedding_id', wedding.id)
        .order('created_at', { ascending: false });
      setMessages(data || []);
    } catch (error) {
      console.error('Error posting message:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Wedding not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {wedding.cover_image_url && (
            <img
              src={wedding.cover_image_url}
              alt={wedding.couple_names}
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{wedding.couple_names}</h1>
          <p className="text-gray-600">{wedding.event_name}</p>
          <p className="text-gray-600">{wedding.event_date} • {wedding.location}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600 text-sm">Photos</p>
            <p className="text-3xl font-bold text-blue-600">{wedding.statistics?.total_photos || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600 text-sm">Videos</p>
            <p className="text-3xl font-bold text-purple-600">{wedding.statistics?.total_videos || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600 text-sm">Messages</p>
            <p className="text-3xl font-bold text-green-600">{messages.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600 text-sm">Storage</p>
            <p className="text-3xl font-bold text-orange-600">{wedding.statistics?.storage_used_mb || 0}MB</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-4 font-semibold ${
                activeTab === 'gallery'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gallery ({media.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 font-semibold ${
                activeTab === 'messages'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Messages ({messages.length})
            </button>
          </div>
        </div>

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            {media.length === 0 ? (
              <p className="text-center text-gray-600 py-12">No photos or videos yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="relative h-48 bg-gray-200">
                      {item.file_type === 'image' ? (
                        <img src={item.storage_url} alt={item.file_name} className="w-full h-full object-cover" />
                      ) : (
                        <video src={item.storage_url} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-2">{item.uploader_name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            {/* Message Form */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Message</h3>
              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Write your wishes and congratulations..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {uploading ? 'Posting...' : 'Post Message'}
                </button>
              </form>
            </div>

            {/* Messages List */}
            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-600 py-12">No messages yet. Be the first to leave a message!</p>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{message.uploader_name}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.message_text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
