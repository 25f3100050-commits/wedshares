'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Wedding = {
  id: string;
  couple_names: string;
  event_name: string;
  event_date: string;
  location: string;
  description: string;
  cover_image_url: string | null;
  public_url: string;
  privacy_settings: any;
  statistics: any;
  created_at: string;
  owner_id: string;
};

type Media = {
  id: string;
  file_name: string;
  file_type: string;
  storage_url: string;
  uploader_name: string;
  category: string;
  status: string;
  likes: number;
  uploaded_at: string;
};

type Message = {
  id: string;
  uploader_name: string;
  message_text: string;
  created_at: string;
};

export default function WeddingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const weddingId = params.id as string;
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'messages' | 'settings'>('overview');
  const [isOwner, setIsOwner] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return;

        // Fetch wedding
        const { data: weddingData, error: weddingError } = await supabase
          .from('weddings')
          .select('*')
          .eq('id', weddingId)
          .single();

        if (weddingError) throw weddingError;
        
        setWedding(weddingData);
        setEditData(weddingData);
        setIsOwner(weddingData.owner_id === authData.user.id);

        // Fetch media
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .eq('wedding_id', weddingId)
          .order('uploaded_at', { ascending: false });

        if (mediaError) throw mediaError;
        setMedia(mediaData || []);

        // Fetch messages
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('*')
          .eq('wedding_id', weddingId)
          .order('created_at', { ascending: false });

        if (messageError) throw messageError;
        setMessages(messageData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (weddingId) fetchData();
  }, [weddingId]);

  const handleMediaStatusChange = async (mediaId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('media')
        .update({ status: newStatus })
        .eq('id', mediaId);

      if (error) throw error;

      setMedia(prev =>
        prev.map(m => m.id === mediaId ? { ...m, status: newStatus } : m)
      );
    } catch (error) {
      console.error('Error updating media status:', error);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      setMedia(prev => prev.filter(m => m.id !== mediaId));
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 mx-auto mb-4 animate-spin" />
        </div>
      </main>
    );
  }

  if (!wedding || !isOwner) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-600">Wedding not found or access denied</p>
      </main>
    );
  }

  const pendingCount = media.filter(m => m.status === 'pending').length;
  const approvedCount = media.filter(m => m.status === 'approved').length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-pink-600 hover:text-rose-600 transition mb-6">
          <span className="mr-2">←</span> Back to Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{wedding.couple_names}</h1>
            <p className="text-gray-600">{wedding.event_name} • {wedding.location}</p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Total Photos</p>
          <p className="text-3xl font-bold text-pink-600 mt-2">{approvedCount}</p>
          {pendingCount > 0 && (
            <p className="text-xs text-orange-600 mt-1">{pendingCount} pending</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Videos</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{wedding.statistics?.total_videos || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Guests</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{wedding.statistics?.total_guests || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Messages</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{messages.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200 flex gap-8">
        {['overview', 'gallery', 'messages', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`py-4 font-semibold border-b-2 transition capitalize ${
              activeTab === tab
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {editMode ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Wedding Details</h2>
              {/* Edit form would go here */}
              <p className="text-gray-600">Edit functionality coming soon</p>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Wedding Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Event Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(wedding.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{wedding.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-lg font-semibold text-gray-900">{wedding.description || 'No description'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Guest Link</p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/guest/${wedding.public_url}`}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/guest/${wedding.public_url}`;
                        navigator.clipboard.writeText(url);
                        alert('Link copied!');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-8">
          {pendingCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-semibold text-yellow-900 mb-4">Moderation Queue ({pendingCount} pending)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {media.filter(m => m.status === 'pending').map(item => (
                  <div key={item.id} className="relative group">
                    {item.file_type === 'image' ? (
                      <img src={item.storage_url} alt="pending" className="w-full h-32 object-cover rounded-lg" />
                    ) : (
                      <video src={item.storage_url} className="w-full h-32 object-cover rounded-lg" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleMediaStatusChange(item.id, 'approved')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleMediaStatusChange(item.id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Approved Media ({approvedCount})</h3>
            {media.filter(m => m.status === 'approved').length === 0 ? (
              <p className="text-gray-600">No approved media yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {media.filter(m => m.status === 'approved').map(item => (
                  <div key={item.id} className="relative group">
                    {item.file_type === 'image' ? (
                      <img src={item.storage_url} alt="media" className="w-full h-40 object-cover rounded-lg" />
                    ) : (
                      <video src={item.storage_url} className="w-full h-40 object-cover rounded-lg" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div>
          {messages.length === 0 ? (
            <p className="text-center text-gray-600 py-12">No messages yet</p>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <div key={message.id} className="bg-white p-6 rounded-xl border border-gray-200 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{message.uploader_name}</h4>
                    <p className="text-gray-700 mb-2">{message.message_text}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={wedding.privacy_settings?.is_public}
                  className="w-5 h-5"
                />
                <span className="text-gray-900 font-medium">Make wedding public</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={wedding.privacy_settings?.require_approval}
                  className="w-5 h-5"
                />
                <span className="text-gray-900 font-medium">Require approval for uploads</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={wedding.privacy_settings?.allow_comments}
                  className="w-5 h-5"
                />
                <span className="text-gray-900 font-medium">Allow guest comments</span>
              </label>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Danger Zone</h3>
            <button className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
              Delete Wedding
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
