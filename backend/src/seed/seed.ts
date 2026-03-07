import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db';
import { Make } from '../models/Make';
import { CarModel } from '../models/CarModel';
import { User } from '../models/User';
import { DealerProfile } from '../models/DealerProfile';
import { Listing } from '../models/Listing';
import { Favorite } from '../models/Favorite';

async function seed(): Promise<void> {
  try {
    await connectDB();

    // Check if data already exists
    const existingMakes = await Make.countDocuments();
    if (existingMakes > 0) {
      // eslint-disable-next-line no-console
      console.log('Data already exists, clearing and reseeding...');
      await Make.deleteMany({});
      await CarModel.deleteMany({});
      await User.deleteMany({});
      await DealerProfile.deleteMany({});
      await Listing.deleteMany({});
      await Favorite.deleteMany({});
    }

    // Create car makes
    const makesData = [
      { name: 'Toyota', slug: 'toyota' },
      { name: 'Honda', slug: 'honda' },
      { name: 'Mitsubishi', slug: 'mitsubishi' },
      { name: 'Suzuki', slug: 'suzuki' },
      { name: 'Nissan', slug: 'nissan' },
      { name: 'Hyundai', slug: 'hyundai' },
      { name: 'Kia', slug: 'kia' },
      { name: 'Mazda', slug: 'mazda' },
      { name: 'Tata', slug: 'tata' },
      { name: 'BMW', slug: 'bmw' },
      { name: 'Mercedes-Benz', slug: 'mercedes' },
      { name: 'Lexus', slug: 'lexus' }
    ];

    const createdMakes = await Make.insertMany(makesData);
    const makeBySlug = new Map(createdMakes.map((m) => [m.slug, m]));

    // Create car models
    const modelsData = [
      { makeSlug: 'toyota', name: 'Corolla', slug: 'corolla' },
      { makeSlug: 'toyota', name: 'Allion', slug: 'allion' },
      { makeSlug: 'toyota', name: 'Premio', slug: 'premio' },
      { makeSlug: 'toyota', name: 'Axio', slug: 'axio' },
      { makeSlug: 'toyota', name: 'Prius', slug: 'prius' },
      { makeSlug: 'toyota', name: 'Land Cruiser', slug: 'land-cruiser' },
      { makeSlug: 'honda', name: 'Civic', slug: 'civic' },
      { makeSlug: 'honda', name: 'City', slug: 'city' },
      { makeSlug: 'honda', name: 'Fit', slug: 'fit' },
      { makeSlug: 'honda', name: 'Vezel', slug: 'vezel' },
      { makeSlug: 'mitsubishi', name: 'Pajero', slug: 'pajero' },
      { makeSlug: 'mitsubishi', name: 'Outlander', slug: 'outlander' },
      { makeSlug: 'mitsubishi', name: 'Lancer', slug: 'lancer' },
      { makeSlug: 'suzuki', name: 'Swift', slug: 'swift' },
      { makeSlug: 'suzuki', name: 'Dzire', slug: 'dzire' },
      { makeSlug: 'suzuki', name: 'Ertiga', slug: 'ertiga' },
      { makeSlug: 'nissan', name: 'X-Trail', slug: 'x-trail' },
      { makeSlug: 'nissan', name: 'Sunny', slug: 'sunny' },
      { makeSlug: 'hyundai', name: 'Elantra', slug: 'elantra' },
      { makeSlug: 'hyundai', name: 'Tucson', slug: 'tucson' },
      { makeSlug: 'kia', name: 'Sportage', slug: 'sportage' },
      { makeSlug: 'mazda', name: 'CX-5', slug: 'cx-5' },
      { makeSlug: 'bmw', name: '3 Series', slug: '3-series' },
      { makeSlug: 'mercedes', name: 'E-Class', slug: 'e-class' },
      { makeSlug: 'lexus', name: 'RX', slug: 'rx' }
    ];

    const carModels = modelsData
      .map((m) => {
        const make = makeBySlug.get(m.makeSlug);
        if (!make) return null;
        return {
          make: make._id,
          name: m.name,
          slug: m.slug
        };
      })
      .filter(Boolean) as { make: mongoose.Types.ObjectId; name: string; slug: string }[];

    const createdModels = await CarModel.insertMany(carModels);

    // Create test users
    const hashPassword = async (password: string): Promise<string> => {
      return bcrypt.hash(password, 10);
    };

    const usersData = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        passwordHash: await hashPassword('admin123'),
        phone: '01711-000000',
        city: 'Dhaka',
        area: 'Motijheel',
        account_type: 'individual' as const,
        role: 'admin' as const,
        status: 'active' as const
      },
      {
        name: 'Rahim Ahmed',
        email: 'rahim@test.com',
        passwordHash: await hashPassword('user123'),
        phone: '01711-111111',
        city: 'Dhaka',
        area: 'Dhanmondi',
        account_type: 'individual' as const,
        role: 'user' as const,
        status: 'active' as const
      },
      {
        name: 'Nasrin Begum',
        email: 'nasrin@test.com',
        passwordHash: await hashPassword('user123'),
        phone: '01812-222222',
        city: 'Chittagong',
        area: 'Nasirabad',
        account_type: 'individual' as const,
        role: 'user' as const,
        status: 'active' as const
      },
      {
        name: 'Karim Hossain',
        email: 'dealer1@test.com',
        passwordHash: await hashPassword('dealer123'),
        phone: '01911-333333',
        city: 'Dhaka',
        area: 'Mirpur',
        account_type: 'dealer' as const,
        role: 'user' as const,
        status: 'active' as const
      },
      {
        name: 'Mohammed Reza',
        email: 'dealer2@test.com',
        passwordHash: await hashPassword('dealer123'),
        phone: '01611-444444',
        city: 'Sylhet',
        area: 'Ambarkhana',
        account_type: 'dealer' as const,
        role: 'user' as const,
        status: 'active' as const
      }
    ];

    const createdUsers = await User.insertMany(usersData);

    // Create dealer profiles
    const dealerUsers = createdUsers.filter((u) => u.account_type === 'dealer');
    const dealerProfiles = await DealerProfile.insertMany(
      dealerUsers.map((user, idx) => ({
        user: user._id,
        dealerName: `${user.name} Motors`,
        address: `${(idx + 1) * 10} Progati Sarani`,
        logoUrl: 'https://via.placeholder.com/150?text=Dealer+Logo',
        description: `We are a trusted car dealer with years of experience selling quality vehicles. ${user.name} Motors offers a wide selection of cars and exceptional customer service.`,
        city: user.city,
        area: user.area
      }))
    );

    // Create listings
    const individualUsers = createdUsers.filter((u) => u.account_type === 'individual');
    const listingsData: any[] = [];

    // Create listings for individual users
    for (let i = 0; i < individualUsers.length; i++) {
      const user = individualUsers[i];
      const modelIndex = Math.floor(Math.random() * createdModels.length);
      const model = createdModels[modelIndex];
      const makeDoc = createdMakes[Math.floor(Math.random() * createdMakes.length)];

      listingsData.push({
        userId: user._id,
        account_type_snapshot: 'individual' as const,
        makeId: makeDoc._id,
        modelId: model._id,
        year: 2020 + Math.floor(Math.random() * 4),
        price: 500000 + Math.floor(Math.random() * 4500000),
        mileage: Math.floor(Math.random() * 150000),
        fuel: ['petrol', 'diesel', 'hybrid'][Math.floor(Math.random() * 3)] as any,
        transmission: ['manual', 'automatic'][Math.floor(Math.random() * 2)] as any,
        condition: ['used', 'reconditioned'][Math.floor(Math.random() * 2)] as any,
        city: user.city || 'Dhaka',
        area: user.area || 'Dhanmondi',
        description: `Beautiful ${model.name} for sale. Well-maintained, no accidents, first owner. Serious inquiries only.`,
        phoneOverride: user.phone,
        status: 'live' as const,
        photos: [
          {
            url: `https://via.placeholder.com/400x300?text=${makeDoc.name}+${model.name}+1`,
            sortOrder: 0
          }
        ],
        coverPhotoUrl: `https://via.placeholder.com/400x300?text=${makeDoc.name}+${model.name}+Cover`
      });
    }

    // Create listings for dealers
    for (let i = 0; i < dealerUsers.length; i++) {
      for (let j = 0; j < 3; j++) {
        const user = dealerUsers[i];
        const modelIndex = Math.floor(Math.random() * createdModels.length);
        const model = createdModels[modelIndex];
        const makeDoc = createdMakes[Math.floor(Math.random() * createdMakes.length)];

        listingsData.push({
          userId: user._id,
          account_type_snapshot: 'dealer' as const,
          makeId: makeDoc._id,
          modelId: model._id,
          year: 2019 + Math.floor(Math.random() * 5),
          price: 600000 + Math.floor(Math.random() * 5000000),
          mileage: Math.floor(Math.random() * 200000),
          fuel: ['petrol', 'diesel', 'hybrid', 'cng'][Math.floor(Math.random() * 4)] as any,
          transmission: ['manual', 'automatic', 'cvt'][Math.floor(Math.random() * 3)] as any,
          condition: ['used', 'reconditioned', 'new'][Math.floor(Math.random() * 3)] as any,
          city: user.city || 'Dhaka',
          area: user.area || 'Mirpur',
          description: `Excellent condition ${model.name}. Certified pre-owned. Extended warranty available. Financing options available.`,
          phoneOverride: user.phone,
          status: ['live', 'pending'][Math.floor(Math.random() * 2)] as any,
          photos: [
            {
              url: `https://via.placeholder.com/400x300?text=${makeDoc.name}+${model.name}+Dealer+1`,
              sortOrder: 0
            }
          ],
          coverPhotoUrl: `https://via.placeholder.com/400x300?text=${makeDoc.name}+${model.name}+Dealer`
        });
      }
    }

    const createdListings = await Listing.insertMany(listingsData);

    // Create favorites - John likes some listings
    const favoriteListings = createdListings.slice(0, 5);
    const favoritesData = favoriteListings.map((listing) => ({
      userId: individualUsers[0]._id,
      listingId: listing._id
    }));

    await Favorite.insertMany(favoritesData);

    // eslint-disable-next-line no-console
    console.log('✅ Seed completed successfully!');
    // eslint-disable-next-line no-console
    console.log(`📦 Created ${createdMakes.length} car makes`);
    // eslint-disable-next-line no-console
    console.log(`📦 Created ${createdModels.length} car models`);
    // eslint-disable-next-line no-console
    console.log(`👥 Created ${createdUsers.length} users`);
    // eslint-disable-next-line no-console
    console.log(`🏢 Created ${dealerProfiles.length} dealer profiles`);
    // eslint-disable-next-line no-console
    console.log(`🚗 Created ${createdListings.length} listings`);
    // eslint-disable-next-line no-console
    console.log(`❤️  Created ${favoritesData.length} favorites`);
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log('Test credentials:');
    // eslint-disable-next-line no-console
    console.log('  Admin: admin@test.com / admin123');
    // eslint-disable-next-line no-console
    console.log('  User: rahim@test.com / user123');
    // eslint-disable-next-line no-console
    console.log('  Dealer: dealer1@test.com / dealer123');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Seed failed', err);
  } finally {
    await mongoose.disconnect();
  }
}

void seed().finally(() => {
  // Ensure process exits in dev scripts
  // eslint-disable-next-line no-process-exit
  process.exit(0);
});

