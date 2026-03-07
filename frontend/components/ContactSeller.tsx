'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Copy as CopyIcon } from 'lucide-react';

interface ContactSellerProps {
  phone: string | null;
}

function normalizeForWhatsApp(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function ContactSeller({ phone }: ContactSellerProps) {
  const [copied, setCopied] = useState(false);

  const disabled = !phone;

  const handleCopy = async () => {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Seller phone
        </p>
        {phone ? (
          <p className="mt-1 font-mono text-sm md:text-base text-gray-900">
            {phone}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            Phone number is not available for this listing.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={disabled}
          className="flex items-center justify-center gap-2 rounded-xl border-gray-200 bg-white hover:bg-primary hover:text-white transition-colors"
        >
          <a href={phone ? `tel:${phone}` : undefined} aria-disabled={disabled}>
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={disabled}
          className="flex items-center justify-center gap-2 rounded-xl border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white transition-colors"
        >
          <a
            href={
              phone ? `https://wa.me/${normalizeForWhatsApp(phone)}` : undefined
            }
            target="_blank"
            rel="noreferrer"
            aria-disabled={disabled}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </Button>
        <Button
          type="button"
          onClick={handleCopy}
          disabled={disabled}
          variant="outline"
          size="sm"
          className="col-span-2 flex items-center justify-center gap-2 rounded-xl border-dashed border-gray-300 bg-gray-50 hover:border-gray-500 hover:bg-gray-100 transition-colors"
        >
          <CopyIcon className="w-4 h-4" />
          <span>{copied ? 'Phone copied' : 'Copy phone'}</span>
        </Button>
      </div>
    </div>
  );
}

