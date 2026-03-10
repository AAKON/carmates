'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { UserActionsButton } from './UserActionsButton';

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  account_type: 'individual' | 'dealer';
  role: string;
  status: 'active' | 'blocked';
  createdAt: string;
};

function formatJoined(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function AdminUsersTableClient({ users }: { users: User[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const rows = useMemo(
    () =>
      users.map((user) => ({
        user,
        joinedLabel: formatJoined(user.createdAt)
      })),
    [users]
  );

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="divide-y divide-gray-100">
      {/* Desktop header row for context */}
      <div className="hidden lg:grid grid-cols-[minmax(260px,1.8fr),1.6fr,1.1fr,1.1fr,1.1fr,0.9fr] gap-4 px-8 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div>User</div>
        <div>Contact</div>
        <div>Type</div>
        <div>Status</div>
        <div>Joined</div>
        <div className="text-right">Actions</div>
      </div>

      {rows.map(({ user, joinedLabel }, index) => {
        const isOpen = open.has(user.id);
        const initial = user.name?.charAt(0).toUpperCase() || '?';

        return (
          <div
            key={user.id}
            className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
          >
            {/* Summary row */}
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-start gap-3 lg:grid lg:grid-cols-[minmax(260px,1.8fr),1.6fr,1.1fr,1.1fr,1.1fr,0.9fr] lg:gap-4">
                {/* User / avatar */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggle(user.id)}
                    className="relative mt-0.5"
                    aria-expanded={isOpen}
                    aria-controls={`user-${user.id}`}
                    title={isOpen ? 'Collapse row' : 'Expand row'}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      {initial}
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      {index + 1}
                    </div>
                  </button>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                      ID: {user.id.slice(-8)}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500 lg:hidden">
                      Joined {joinedLabel}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-3 lg:mt-0">
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                      <span className="font-medium truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                          />
                        </svg>
                        <span className="font-medium">{user.phone}</span>
                      </div>
                    )}
                    {user.city && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                        <span className="text-xs">{user.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Type */}
                <div className="mt-3 lg:mt-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${
                      user.account_type === 'dealer'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {user.account_type === 'dealer' ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72"
                        />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    )}
                    {user.account_type === 'dealer' ? 'Dealer' : 'Individual'}
                  </span>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Role: <span className="font-semibold text-gray-800">{user.role}</span>
                  </p>
                </div>

                {/* Status */}
                <div className="mt-3 lg:mt-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    {user.status === 'active' ? 'Active' : 'Blocked'}
                  </span>
                </div>

                {/* Joined */}
                <div className="mt-3 lg:mt-0 hidden lg:block">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                    <span className="text-gray-600 font-medium text-sm">{joinedLabel}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 lg:mt-0 flex justify-end">
                  <UserActionsButton
                    userId={user.id}
                    currentStatus={user.status}
                    userName={user.name}
                  />
                </div>
              </div>

              {/* Mobile expand / collapse controls */}
              <div className="mt-3 flex items-center justify-between gap-3 lg:hidden">
                <button
                  type="button"
                  onClick={() => toggle(user.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {isOpen ? 'Close details' : 'More details'}
                  <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <Link
                  href={`mailto:${user.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  Email user
                </Link>
              </div>
            </div>

            {/* Expanded detail section */}
            {isOpen && (
              <div
                id={`user-${user.id}`}
                className="px-4 sm:px-6 lg:px-8 pb-4"
              >
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="mt-1 font-semibold text-gray-900 break-all">
                        {user.email}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {user.phone || '—'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        City
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {user.city || '—'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Account type
                      </p>
                      <p className="mt-1 font-semibold text-gray-900 capitalize">
                        {user.account_type}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Role
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {user.role}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Joined
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {joinedLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

