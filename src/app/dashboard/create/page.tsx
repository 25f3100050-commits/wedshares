'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function generateRandomString(length: number = 8): string {
  return Math.random().toString(36).substring(2, length + 2);
}

export default function CreateWeddingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    couple_names: '',
    event_name: '',
    event_date: '',
    location: '',
    description: '',
    theme: 'elegant',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Not authenticated');

      const public_url = generateRandomString(12);

      // Upload cover image if provided
      let cover_image_url = null;
      if (coverPreview && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `covers/${authData.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('wedding-covers')
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('wedding-covers')
          .getPublicUrl(filePath);
        cover_image_url = data.publicUrl;
      }

      // Create wedding
      const { error: createError } = await supabase.from('weddings').insert([
        {
          owner_id: authData.user.id,
          couple_names: formData.couple_names,
          event_name: formData.event_name,
          event_date: formData.event_date,
          location: formData.location,
          description: formData.description,
          theme: formData.theme,
          public_url,
          cover_image_url,
          privacy_settings: {
            is_public: false,
            require_approval: false,
            allow_guests: true,
            allow_comments: true,
          },
        },
      ]);

      if (createError) throw createError;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create wedding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/dashboard" className="inline-flex items-center text-pink-600 hover:text-rose-600 transition mb-8">
        <span className="mr-2">←</span> Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Wedding</h1>
        <p className="text-gray-600 mb-8">Set up your wedding event and start collecting memories from guests</p>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">Cover Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-500 transition flex items-center justify-center overflow-hidden group"
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white font-semibold">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <span className="text-4xl mb-2 block">📸</span>
                  <p className="text-gray-600 font-medium">Upload a beautiful cover photo</p>
                  <p className="text-sm text-gray-500">Click to select image</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Couple Names */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Couple Names *</label>
            <input
              type="text"
              name="couple_names"
              value={formData.couple_names}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
              placeholder="e.g., Debraj & Priya"
            />
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name *</label>
            <input
              type="text"
              name="event_name"
              value={formData.event_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
              placeholder="e.g., Wedding 2024"
            />
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date *</label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                placeholder="e.g., Delhi, India"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 hover:bg-white transition resize-none"
              placeholder="Share details about your wedding..."
            />
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
            <select
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
            >
              <option value="elegant">Elegant</option>
              <option value="modern">Modern</option>
              <option value="traditional">Traditional</option>
              <option value="colorful">Colorful</option>
              <option value="minimalist">Minimalist</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition text-lg"
          >
            {loading ? 'Creating wedding...' : '✨ Create Wedding'}
          </button>
        </form>
      </div>
    </main>
  );
}
