'use client';

import { useEffect, useState } from 'react';

export function DashboardTimestamp() {
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    setTimestamp(new Date().toLocaleString());
  }, []);

  if (!timestamp) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-purple-200 h-5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-purple-200">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Last updated: {timestamp}</span>
    </div>
  );
}
