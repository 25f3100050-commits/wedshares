'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Wedding = {
  id: string;
  couple_names: string;
  event_name: string;
};

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const public_url = params.public_url as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [guestName, setGuestName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchWedding = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('weddings')
          .select('id, couple_names, event_name')
          .eq('public_url', public_url)
          .single();

        if (fetchError) throw fetchError;
        setWedding(data);
      } catch (err: any) {
        setError('Wedding not found');
      } finally {
        setLoading(false);
      }
    };

    if (public_url) fetchWedding();
  }, [public_url]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    setError('');
  };

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wedding || !guestName || selectedFiles.length === 0) {
      setError('Please fill all fields and select files');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const sessionId = Math.random().toString(36).substring(2, 11);
      let uploadedCount = 0;

      for (const file of selectedFiles) {
        // Validate file
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
          console.warn(`Skipping invalid file type: ${file.name}`);
          continue;
        }

        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
          console.warn(`Skipping oversized file: ${file.name}`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `media/${wedding.id}/${fileName}`;
        const isImage = file.type.startsWith('image');
        const isVideo = file.type.startsWith('video');

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('wedding-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('wedding-media')
          .getPublicUrl(filePath);

        // Save metadata
        const { error: dbError } = await supabase.from('media').insert([
          {
            wedding_id: wedding.id,
            uploader_session_id: sessionId,
            uploader_name: guestName,
            file_name: file.name,
            file_type: isImage ? 'image' : 'video',
            file_size: file.size,
            mime_type: file.type,
            storage_path: filePath,
            storage_url: urlData.publicUrl,
            category: 'General',
            status: 'approved',
          },
        ]);

        if (dbError) throw dbError;

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / selectedFiles.length) * 100));
      }

      setSuccess(`Successfully uploaded ${uploadedCount} file(s)!`);
      setGuestName('');
      setSelectedFiles([]);
      setUploadProgress(0);

      setTimeout(() => {
        router.push(`/guest/${public_url}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Link href={`/guest/${public_url}`} className="inline-block text-pink-600 hover:text-rose-600 transition mb-4">
            ← Back to Gallery
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Memories</h1>
          <p className="text-gray-600">Upload photos and videos from {wedding?.couple_names}'s {wedding?.event_name}</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-start gap-3">
              <span className="text-lg">✓</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-8">
            {/* Your Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                placeholder="What should we call you?"
              />
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Upload Photos & Videos *</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDragDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-pink-500 rounded-xl p-12 text-center cursor-pointer transition bg-gray-50 hover:bg-gray-100"
              >
                <div className="mb-4">
                  <span className="text-5xl">📸</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">Click or drag files here</p>
                <p className="text-sm text-gray-600">Upload JPG, PNG, MP4 up to 100MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Selected Files ({selectedFiles.length})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{file.type.startsWith('image') ? '🖼️' : '🎬'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-600 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && uploadProgress > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Uploading...</span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-600 to-rose-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition text-lg"
            >
              {uploading ? `Uploading... ${uploadProgress}%` : '🎉 Upload Now'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
