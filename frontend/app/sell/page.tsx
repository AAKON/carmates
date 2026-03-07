import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SellClient } from '../../components/SellClient';

export default function SellPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    redirect('/login');
  }

  return <SellClient />;
}

