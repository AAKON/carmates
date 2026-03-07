import { User } from '../models/User';
import { Listing } from '../models/Listing';
import { Favorite } from '../models/Favorite';

export interface DailyCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface AdminDashboardData {
  usersTotal: number;
  dealersTotal: number;
  listingsByStatus: Record<string, number>;
  favoritesTotal: number;
  // Chart data
  listingsPerDay: DailyCount[];
  usersPerDay: DailyCount[];
  listingsByFuel: { fuel: string; count: number }[];
  listingsByCondition: { condition: string; count: number }[];
  topCities: { city: string; count: number }[];
  recentPending: {
    _id: string;
    year: number;
    price: number;
    city: string;
    makeId: { name: string } | null;
    modelId: { name: string } | null;
    createdAt: string;
    coverPhotoUrl: string;
  }[];
}

export async function getAdminDashboardCounts(): Promise<AdminDashboardData> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    usersTotal,
    dealersTotal,
    listingsAgg,
    favoritesTotal,
    listingsPerDayAgg,
    usersPerDayAgg,
    fuelAgg,
    conditionAgg,
    cityAgg,
    recentPending
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ account_type: 'dealer' }),
    Listing.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Favorite.countDocuments({}),
    // Listings created per day (last 7 days)
    Listing.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    // Users registered per day (last 7 days)
    User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    // Listings by fuel type
    Listing.aggregate([
      { $group: { _id: '$fuel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    // Listings by condition
    Listing.aggregate([
      { $group: { _id: '$condition', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    // Top 5 cities by listing count
    Listing.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    // Recent pending listings (last 5)
    Listing.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('makeId', 'name')
      .populate('modelId', 'name')
      .select('year price city makeId modelId createdAt coverPhotoUrl')
      .lean()
  ]);

  const listingsByStatus: Record<string, number> = {
    draft: 0,
    pending: 0,
    live: 0,
    paused: 0,
    sold: 0,
    rejected: 0
  };

  for (const row of listingsAgg) {
    listingsByStatus[row._id as string] = row.count as number;
  }

  // Fill in all 7 days for chart (even days with 0)
  const listingsPerDay: DailyCount[] = [];
  const usersPerDay: DailyCount[] = [];
  const listingsMap = new Map(listingsPerDayAgg.map((r: any) => [r._id, r.count]));
  const usersMap = new Map(usersPerDayAgg.map((r: any) => [r._id, r.count]));

  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    listingsPerDay.push({ date: key, count: (listingsMap.get(key) as number) || 0 });
    usersPerDay.push({ date: key, count: (usersMap.get(key) as number) || 0 });
  }

  return {
    usersTotal,
    dealersTotal,
    listingsByStatus,
    favoritesTotal,
    listingsPerDay,
    usersPerDay,
    listingsByFuel: fuelAgg.map((r: any) => ({ fuel: r._id, count: r.count })),
    listingsByCondition: conditionAgg.map((r: any) => ({ condition: r._id, count: r.count })),
    topCities: cityAgg.map((r: any) => ({ city: r._id, count: r.count })),
    recentPending: recentPending as any[]
  };
}
