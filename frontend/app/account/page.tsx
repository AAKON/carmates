import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApiFetch } from '../../lib/serverApi';
import { AccountClient } from '../../components/AccountClient';

interface AccountProfileResponse {
  data: {
    user: {
      name: string;
      email: string;
      account_type: string;
      status: string;
      phone?: string;
      city?: string;
      area?: string;
    };
    dealerProfile?: {
      dealerName: string;
      address?: string;
      city?: string;
      area?: string;
      description?: string;
    } | null;
  };
}

export default async function AccountPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    redirect('/login');
  }

  const res = await serverApiFetch<AccountProfileResponse>(
    '/account/profile',
    { auth: true }
  );

  const { user, dealerProfile = null } = res.data;

  return <AccountClient user={user} dealerProfile={dealerProfile} />;
}

