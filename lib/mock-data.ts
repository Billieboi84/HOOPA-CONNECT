export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  body: string;
  image: string;
  category: string;
  likes: number;
  comments: number;
};

export type DirectoryItem = {
  id: string;
  name: string;
  kind: string;
  phone: string;
  address: string;
  website: string;
  maps: string;
  description: string;
  category: string;
};

export type JobItem = {
  id: string;
  title: string;
  employer: string;
  type: string;
  location: string;
  summary: string;
  category: string;
  salary: string;
  closingDate: string;
  link: string;
};

export type MarketplaceItem = {
  id: string;
  title: string;
  seller: string;
  category: string;
  price: string;
  image: string;
  location: string;
  summary: string;
};

export const newsItems: NewsItem[] = [
  {
    id: 'news-health-fair',
    title: 'Community Health Fair Returns This Weekend',
    summary: 'Free screenings, food, and family activities at the community center.',
    body: 'Residents are invited to attend for health screenings, vaccination information, food, and family-friendly activities.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    category: 'Event',
    likes: 24,
    comments: 7
  },
  {
    id: 'news-youth-art',
    title: 'Tribal Youth Art Showcase Opens Thursday',
    summary: 'A new exhibit highlights local artists and youth voices with live music.',
    body: 'The showcase will feature student artwork, local music, and cultural demonstrations from community partners.',
    image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
    category: 'Culture',
    likes: 18,
    comments: 3
  },
  {
    id: 'news-roadwork',
    title: 'Roadwork Notice for Main Street Access',
    summary: 'Temporary delays are expected near the downtown corridor during the next two weeks.',
    body: 'Please allow extra travel time and watch for signage while crews complete resurfacing and utility work.',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80',
    category: 'Notice',
    likes: 9,
    comments: 1
  }
];

export const directoryItems: DirectoryItem[] = [
  {
    id: 'dir-hoopa-tribe',
    name: 'Hoopa Valley Tribe',
    kind: 'Tribal Entity',
    phone: '(530) 625-4000',
    address: 'P.O. Box 1258, Hoopa, CA',
    website: 'https://www.hoopa-nsn.gov',
    maps: 'https://maps.google.com/?q=Hoopa+California',
    description: 'Tribal government services and community operations.',
    category: 'Government'
  },
  {
    id: 'dir-yurok',
    name: 'Yurok Tribe',
    kind: 'Tribal Entity',
    phone: '(707) 482-1350',
    address: 'P.O. Box 1027, Klamath, CA',
    website: 'https://www.yuroktribe.org',
    maps: 'https://maps.google.com/?q=Yurok+Tribe+Klamath',
    description: 'Regional services, programs, and tribal office contacts.',
    category: 'Government'
  },
  {
    id: 'dir-pharmacy',
    name: 'Hoopa Valley Pharmacy',
    kind: 'Business',
    phone: '(530) 625-1000',
    address: 'Main Street, Hoopa, CA',
    website: 'https://maps.google.com/?q=Hoopa+Valley+Pharmacy',
    maps: 'https://maps.google.com/?q=Hoopa+Valley+Pharmacy',
    description: 'Local pharmacy and prescription support.',
    category: 'Health'
  }
];

export const jobItems: JobItem[] = [
  {
    id: 'job-community-services',
    title: 'Community Services Assistant',
    employer: 'Hoopa Valley Tribe',
    type: 'Full-time',
    location: 'Hoopa, CA',
    summary: 'Support community outreach and program coordination.',
    category: 'Administration',
    salary: '$18-$22/hr',
    closingDate: 'Open until filled',
    link: 'https://www.hoopa-nsn.gov'
  },
  {
    id: 'job-public-works',
    title: 'Public Works Technician',
    employer: 'Yurok Tribe',
    type: 'Seasonal',
    location: 'Klamath, CA',
    summary: 'Assist with maintenance and field operations.',
    category: 'Public Works',
    salary: '$20-$24/hr',
    closingDate: '2026-08-15',
    link: 'https://www.yuroktribe.org'
  }
];

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: 'market-basket',
    title: 'Handwoven basket set',
    seller: 'Local artisan',
    category: 'Handmade',
    price: '$120',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    location: 'Hoopa, CA',
    summary: 'Traditional basket pair with natural tones and tight weave detail.'
  },
  {
    id: 'market-elkhorn',
    title: 'Elk horn display piece',
    seller: 'Community seller',
    category: 'Collectibles',
    price: '$220',
    image: 'https://images.unsplash.com/photo-1526312426976-593c4c0f0f1e?auto=format&fit=crop&w=1200&q=80',
    location: 'Hoopa, CA',
    summary: 'Decorative display piece for home or collection use.'
  },
  {
    id: 'market-tools',
    title: 'Garden tools bundle',
    seller: 'Local neighbor',
    category: 'Home',
    price: '$45',
    image: 'https://images.unsplash.com/photo-1534940519139-f860b31f3d11?auto=format&fit=crop&w=1200&q=80',
    location: 'Weitchpec, CA',
    summary: 'Useful starter bundle for gardening and seasonal yard work.'
  }
];
