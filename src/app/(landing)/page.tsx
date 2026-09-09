import { Navbar } from '@/components/navbar';
import Link from 'next/link';

const features = [
  {
    icon: '📸',
    title: 'Instant Upload',
    description: 'Guests scan the QR code and upload photos without creating an account',
  },
  {
    icon: '🎯',
    title: 'Organized Gallery',
    description: 'Photos automatically organized by event category - Mehendi, Haldi, Wedding, Reception & more',
  },
  {
    icon: '📱',
    title: 'Mobile First',
    description: 'Beautiful upload experience optimized for phones. Works on slow networks',
  },
  {
    icon: '❤️',
    title: 'Guest Wishes',
    description: 'Guests can leave messages and congratulations for the couple',
  },
  {
    icon: '📥',
    title: 'Download Everything',
    description: 'Download individual photos, videos, or entire event as ZIP',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    description: 'Full control over privacy settings and content moderation',
  },
];

const faqs = [
  {
    q: 'Do guests need to create an account?',
    a: 'No! Guests simply scan the QR code, and they can immediately upload photos. No signup required.',
  },
  {
    q: 'How long are photos stored?',
    a: 'Photos are stored indefinitely. After your wedding, your gallery becomes a beautiful digital memory.',
  },
  {
    q: 'Can I download all my photos?',
    a: 'Yes! Download individual photos, videos, or your entire event as a ZIP file.',
  },
  {
    q: 'Is my wedding private?',
    a: 'Completely. Only people with the unique link or QR code can access your wedding gallery.',
  },
  {
    q: 'Can I moderate uploads?',
    a: 'Yes! You can review and approve all photos before they appear in the gallery.',
  },
  {
    q: 'What file types can guests upload?',
    a: 'Photos (JPG, PNG) and videos (MP4, MOV). We auto-compress large files for fast uploads.',
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-pink-50/30 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Wedding.
            <br />
            <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Every Guest's Perspective.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Collect every candid photo and video from your wedding in one private gallery. No app. No complicated setup. Just scan, upload and celebrate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup" className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 transition text-lg">
              Create Your Wedding
            </Link>
            <Link href="/#how-it-works" className="px-8 py-4 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition text-lg">
              See How It Works
            </Link>
          </div>
          <div className="inline-block">
            <div className="bg-gradient-to-b from-pink-100 to-rose-100 p-12 rounded-2xl">
              <div className="bg-white p-8 rounded-xl">
                <p className="text-sm text-gray-600 mb-4">Scan to see a live demo</p>
                <div className="w-40 h-40 bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-gray-600">QR Code Placeholder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How WedShares Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { step: 1, title: 'Create', desc: 'Set up your wedding event in 2 minutes' },
              { step: 2, title: 'Share QR', desc: 'Get a unique QR code & link' },
              { step: 3, title: 'Guests Upload', desc: 'Guests scan & upload photos instantly' },
              { step: 4, title: 'Live Gallery', desc: 'See photos appear in real-time' },
              { step: 5, title: 'Relive', desc: 'Download & cherish forever' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Gallery Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Beautiful Gallery Experience</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Photos organize themselves. Guests can like, comment, and share their favorite memories.
          </p>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <p className="text-lg font-semibold mb-2">Gallery Preview</p>
                <p className="text-sm">Beautiful masonry layout of wedding photos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="p-8 border border-gray-200 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-8">Perfect for intimate celebrations</p>
              <div className="text-4xl font-bold text-gray-900 mb-8">$0</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  1 event
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  5 GB storage
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  Basic gallery
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  QR code sharing
                </li>
              </ul>
              <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition">
                Get Started Free
              </button>
            </div>

            {/* Premium Plan */}
            <div className="p-8 border-2 border-gradient-to-r from-pink-600 to-rose-600 rounded-xl bg-gradient-to-br from-pink-50 to-white relative">
              <div className="absolute -top-4 right-6 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <p className="text-gray-600 mb-8">For the perfect wedding</p>
              <div className="text-4xl font-bold text-gray-900 mb-2">$49</div>
              <p className="text-gray-600 text-sm mb-8">one-time</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  Unlimited events
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  Unlimited storage
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  Live wall display
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  ZIP download
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  Custom URL
                </li>
              </ul>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:opacity-90 transition">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <details key={i} className="p-6 bg-white rounded-lg border border-gray-200 cursor-pointer group">
                <summary className="font-semibold text-gray-900 flex items-center justify-between">
                  {faq.q}
                  <span className="text-xl group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-600 to-rose-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to capture every moment?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start collecting wedding photos for free. No credit card needed.
          </p>
          <Link href="/auth/signup" className="inline-block px-8 py-4 bg-white text-pink-600 font-semibold rounded-lg hover:bg-gray-100 transition text-lg">
            Create Wedding Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">WedShares</h3>
              <p className="text-sm">Collecting wedding memories, one photo at a time.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/#features" className="hover:text-white transition">Features</a></li>
                <li><a href="/#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-white transition">About</a></li>
                <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
                <li><a href="/privacy" className="hover:text-white transition">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Follow</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2024 WedShares. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
