import React, { useState } from 'react';
import { Mail, Phone, MapPin, ChevronDown, ChevronUp, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
    <div className="text-center space-y-3">
      <span className="text-xs font-bold text-[#7444FF] uppercase tracking-wider">The Story of LUMORA</span>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#14152D]">
        Discover more. Love every find.
      </h1>
      <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
        LUMORA was founded with a single mission: to craft a vibrant, joyous, and reliable online shopping experience for Indian consumers looking for distinctive lifestyle, sound, fashion, and home finds.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
      <div className="p-6 rounded-3xl bg-white border border-[#E8E3FA] shadow-sm space-y-2">
        <h3 className="font-display font-bold text-base text-[#14152D]">Curated Distinctiveness</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          We reject mass-produced generic clutter. Every piece in our catalog is carefully sourced for craftsmanship, durability, and visual delight.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-[#E8E3FA] shadow-sm space-y-2">
        <h3 className="font-display font-bold text-base text-[#14152D]">Honest Architecture</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Authoritative server calculations in Indian Paise guarantee that prices, stock levels, and coupons are never manipulated or fabricated.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-[#E8E3FA] shadow-sm space-y-2">
        <h3 className="font-display font-bold text-base text-[#14152D]">Buttery-Smooth Motion</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Built with 60 FPS motion design, intuitive drawers, responsive layouts, and cross-device optimization across Windows desktop and Android.
        </p>
      </div>
    </div>
  </div>
);

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you! Your message has been received. Our team will reply within 24 hours.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#7444FF] uppercase tracking-wider">Get in Touch</span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#14152D]">
          We'd Love to Hear From You
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Have an inquiry regarding an order, partnership, or product detail? Reach out below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-display font-bold text-lg text-[#14152D]">Direct Support</h2>
          <div className="space-y-4 text-xs text-gray-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#7444FF] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#14152D]">LUMORA Retail HQ</p>
                <p>100 Feet Road, Indiranagar</p>
                <p>Bengaluru, Karnataka 560038, India</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#FF6B67] shrink-0" />
              <div>
                <p className="font-bold text-[#14152D]">Email Inquiries</p>
                <p>support@lumora.store</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#25CBB8] shrink-0" />
              <div>
                <p className="font-bold text-[#14152D]">Telephone Helpline</p>
                <p>+91 80000 12345 (Mon - Sat, 9am - 7pm IST)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-lg text-[#14152D]">Send Us a Message</h2>
          <input
            type="text"
            required
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
          />
          <input
            type="email"
            required
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
          />
          <textarea
            rows={4}
            required
            placeholder="How can we assist you today?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
          />
          <Button type="submit" variant="primary" size="md" className="w-full">
            Submit Message
          </Button>
        </form>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does LUMORA prevent overselling during high-traffic sales?',
      a: 'We use atomic conditional database updates (MongoDB findOneAndUpdate with stock >= requested). Even if hundreds of customers attempt to purchase the last unit simultaneously, exactly one order captures it, and subsequent requests safely receive an out-of-stock notification with zero negative inventory.',
    },
    {
      q: 'What shipping options are available and how much does it cost?',
      a: 'We offer Standard Delivery (3-5 business days) which is completely FREE on all orders over ₹999 (₹70 otherwise), and Express Priority Delivery (1-2 business days) for ₹150.',
    },
    {
      q: 'How do discount coupons work?',
      a: 'Promotional coupons such as WELCOME10, LUMORA20, or FESTIVE500 are authoritatively validated on the backend. Minimum order requirements, expiry dates, and maximum savings caps are verified in real time.',
    },
    {
      q: 'What happens if I cancel an eligible order?',
      a: 'When an order is cancelled prior to shipment, the items are automatically restocked into inventory in real time, and payment status transitions to REFUNDED.',
    },
    {
      q: 'Can I browse and place orders as a guest?',
      a: 'Yes! Guest shopping and checkout are fully supported with guest session tracking. When you eventually choose to register or log in, any items in your guest bag automatically merge into your account.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#7444FF] uppercase tracking-wider">Help & Answers</span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#14152D]">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#E8E3FA] bg-white overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-4 sm:p-5 flex justify-between items-center text-left text-sm font-semibold text-[#14152D] hover:bg-[#F0EBFF]/30 transition-colors"
            >
              <span>{faq.q}</span>
              {openIdx === idx ? (
                <ChevronUp className="w-4 h-4 text-[#7444FF] shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              )}
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-6">
    <h1 className="font-display font-extrabold text-3xl text-[#14152D]">Shipping & Delivery Policy</h1>
    <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 space-y-4 text-xs text-gray-600 leading-relaxed shadow-sm">
      <p>
        LUMORA delivers to all serviceable PIN codes across India via authorized courier partners including BlueDart, Delhivery, and DTDC.
      </p>
      <h3 className="font-bold text-sm text-[#14152D]">Dispatch Timelines</h3>
      <p>
        Orders placed before 2:00 PM IST are processed for dispatch on the same business day. All orders receive a real database-tracked tracking reference.
      </p>
      <h3 className="font-bold text-sm text-[#14152D]">Shipping Fees</h3>
      <p>
        Standard Delivery is completely FREE on all orders of ₹999 or higher. For orders below ₹999, a nominal shipping charge of ₹70 is applied. Express Priority is available for ₹150.
      </p>
    </div>
  </div>
);

export const ReturnPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-6">
    <h1 className="font-display font-extrabold text-3xl text-[#14152D]">Returns & Refund Policy</h1>
    <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 space-y-4 text-xs text-gray-600 leading-relaxed shadow-sm">
      <p>
        We offer a 7-day hassle-free return policy on all eligible lifestyle, audio, apparel, and decor products.
      </p>
      <h3 className="font-bold text-sm text-[#14152D]">Eligibility Criteria</h3>
      <p>
        Items must be in original condition with tags and packaging intact. Electronic devices must include original charging cables and documentation.
      </p>
      <h3 className="font-bold text-sm text-[#14152D]">Refund Processing</h3>
      <p>
        Upon receipt and inspection, approved refunds are credited back to the original source method (UPI, Card, or NetBanking) within 3-5 banking days.
      </p>
    </div>
  </div>
);

export const PrivacyPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-6">
    <h1 className="font-display font-extrabold text-3xl text-[#14152D]">Privacy Policy</h1>
    <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 space-y-4 text-xs text-gray-600 leading-relaxed shadow-sm">
      <p>
        LUMORA respects your privacy. We store passwords with industry-standard bcrypt hashing and protect sessions using secure HttpOnly cookies.
      </p>
      <h3 className="font-bold text-sm text-[#14152D]">Data Usage</h3>
      <p>
        Your email and address are used exclusively for order fulfillment, tracking status notifications, and customer service communication. We never sell customer records to third parties.
      </p>
    </div>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-6">
    <h1 className="font-display font-extrabold text-3xl text-[#14152D]">Terms & Conditions</h1>
    <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 space-y-4 text-xs text-gray-600 leading-relaxed shadow-sm">
      <p>
        By accessing the LUMORA e-commerce platform, you agree to comply with our store policies, authentic inventory reservations, and terms of service.
      </p>
      <h3 className="font-bold text-sm text-[#14152D]">Authoritative Pricing</h3>
      <p>
        All orders are executed based on server-calculated totals in Indian Rupees (Paise). Any discrepancy caused by browser-side alteration is overridden by authoritative server validation.
      </p>
    </div>
  </div>
);
