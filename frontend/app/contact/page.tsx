import Link from 'next/link';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const metadata = {
  title: 'Contact carMates',
  description: 'Get in touch with the carMates team for support, feedback, or partnership enquiries.'
};

export default function ContactPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-3xl border border-purple-100/80 bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-500 px-6 py-10 sm:px-10 sm:py-12 text-white shadow-lg shadow-purple-200/70"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(88, 28, 135, 0.9), rgba(124, 58, 237, 0.85)), url(\"/images/carbg.jpg\")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            We&apos;re here to help
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              Contact the carMates team
            </h1>
            <p className="text-sm sm:text-base text-purple-100/95 max-w-xl">
              Questions about listings, dealers, or your account? Reach out to us and
              we&apos;ll get back within one business day.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1.1fr)]">
        {/* Contact details + form */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-purple-100/80 shadow-md shadow-purple-100/60 p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Send us a message
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Fill in the form below and our support team will respond as soon as
              possible. For urgent queries, use the phone number on the right.
            </p>

            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="text-xs font-medium text-gray-700 uppercase tracking-wide"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium text-gray-700 uppercase tracking-wide"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="subject"
                  className="text-xs font-medium text-gray-700 uppercase tracking-wide"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none"
                  placeholder="Buying, selling, or account question"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="message"
                  className="text-xs font-medium text-gray-700 uppercase tracking-wide"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none resize-none"
                  placeholder="Tell us how we can help…"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-all"
              >
                Send message
              </button>
              <p className="text-[11px] text-gray-500">
                By submitting, you agree to us contacting you about your enquiry.
              </p>
            </form>
          </div>

          <div className="rounded-2xl bg-white/90 border border-purple-100/80 shadow-sm p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Other ways to reach us
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-purple-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">carMates HQ</p>
                  <p className="text-gray-600">
                    Dhaka, Bangladesh
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-purple-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">hello@carmates.com.bd</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-purple-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">+880 (123) 456-7890</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-purple-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Support hours</p>
                  <p className="text-gray-600">
                    Saturday – Thursday, 10:00 – 18:00 (BST)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-purple-100/80 shadow-md bg-white/70 backdrop-blur-sm">
          <div className="h-72 sm:h-[360px] lg:h-full w-full">
            <iframe
              title="carMates Dhaka map"
              src="https://maps.google.com/maps?q=Dhaka%2C%20Bangladesh&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

