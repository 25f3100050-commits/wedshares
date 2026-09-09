'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';
import Link from 'next/link';

type Wedding = {
  id: string;
  couple_names: string;
  event_name: string;
  public_url: string;
};

export default function QRCodePage() {
  const params = useParams();
  const weddingId = params.id as string;
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWedding = async () => {
      try {
        const { data, error } = await supabase
          .from('weddings')
          .select('id, couple_names, event_name, public_url')
          .eq('id', weddingId)
          .single();

        if (error) throw error;
        setWedding(data);

        // Generate QR code
        const uploadUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/guest/${data.public_url}/upload`;
        const qr = await QRCode.toDataURL(uploadUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 1,
          color: {
            dark: '#ec4899',
            light: '#fff',
          },
        });
        setQrDataUrl(qr);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (weddingId) fetchWedding();
  }, [weddingId]);

  if (loading || !wedding) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 mx-auto mb-4 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/dashboard/wedding/${weddingId}`} className="inline-flex items-center text-pink-600 hover:text-rose-600 transition mb-8">
        <span className="mr-2">←</span> Back
      </Link>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Share Your Wedding</h1>
        <p className="text-gray-600 text-center mb-12">Guests scan this QR code to upload photos and videos</p>

        {/* QR Code Display */}
        <div className="flex flex-col items-center gap-12 mb-12">
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-12 rounded-2xl border-2 border-pink-200">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
            )}
          </div>

          {/* Event Info Card */}
          <div className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl p-8 text-center">
            <p className="text-sm opacity-90 mb-2">Celebrating</p>
            <h2 className="text-3xl font-bold mb-2">{wedding.couple_names}</h2>
            <p className="text-lg opacity-90">{wedding.event_name}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = qrDataUrl;
              link.download = `${wedding.couple_names}-qr.png`;
              link.click();
            }}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            📥 Download PNG
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            🖨️ Print Card
          </button>
          <button
            onClick={() => {
              const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/guest/${wedding.public_url}/upload`;
              navigator.clipboard.writeText(url);
              alert('Link copied!');
            }}
            className="px-6 py-3 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            🔗 Copy Link
          </button>
        </div>

        {/* Print Preview */}
        <div className="hidden print:block">
          <div className="flex flex-col items-center justify-center gap-8 p-8">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="w-80 h-80" />
            )}
            <h1 className="text-4xl font-bold text-center">Share Your Memories</h1>
            <p className="text-2xl text-center">Scan → Upload → Relive</p>
            <p className="text-xl text-center text-gray-600">{wedding.couple_names}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
