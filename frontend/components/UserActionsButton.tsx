'use client';

import { useState } from 'react';

interface UserActionsButtonProps {
  userId: string;
  currentStatus: 'active' | 'blocked';
  userName: string;
}

export function UserActionsButton({ userId, currentStatus, userName }: UserActionsButtonProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const action = status === 'active' ? 'block' : 'unblock';
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        setStatus(status === 'active' ? 'blocked' : 'active');
      } else {
        alert(`Failed to ${action} user`);
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'active') {
    return (
      <button
        onClick={handleToggleStatus}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 hover:border-red-300"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        {loading ? 'Blocking...' : 'Block User'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleStatus}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-green-200 hover:border-green-300"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
      {loading ? 'Unblocking...' : 'Unblock User'}
    </button>
  );
}
