// Site-wide settings. Contact details are placeholders until the client supplies real ones.
export const site = {
  name: '+Discovery',
  fullName: 'Plus Discovery Adventure',
  tagline: 'lifetime experience',
  email: 'info@example.com',
  phone: '+255 000 000 000',
  address: 'Arusha, Tanzania',
  social: { instagram: '#', facebook: '#', youtube: '#', tiktok: '#' },
  currency: 'USD',
};

export const whyUs = [
  { icon: 'price', title: 'Price Guarantee', text: 'Competitive, transparent pricing with no hidden extras, so you get real value without compromising on the quality of your trip.' },
  { icon: 'expert', title: 'Expert Assistance', text: 'Our planners know the parks first-hand and shape every itinerary around your dates, interests and pace.' },
  { icon: 'local', title: 'Local Safari Operator', text: 'Based in Arusha with our own guides and trusted partners, for authentic experiences beyond the usual tourist trail.' },
  { icon: 'custom', title: '100% Customization', text: 'Change the route, accommodation or activities. Every detail of your journey can be adjusted to suit you.' },
  { icon: 'safety', title: 'Safe & Comfortable', text: 'Well-kept 4x4 vehicles, experienced driver-guides and clear safety briefings on every departure.' },
  { icon: 'chat', title: 'Personal Care', text: 'One planner from your first message to your airport goodbye, with fast replies before and during travel.' },
];

export const steps = [
  { icon: 'chat', title: 'Tell us your plans', text: 'Share your dates, group size and what you want to see.' },
  { icon: 'map', title: 'Get a tailored proposal', text: 'We design a day-by-day itinerary with clear prices.' },
  { icon: 'calendar', title: 'Confirm and prepare', text: 'Secure your dates with a deposit and receive your travel pack.' },
  { icon: 'compass', title: 'Enjoy Tanzania', text: 'Your guide meets you at the airport and looks after the rest.' },
];

export const tourStyles = [
  ['camping', 'Camping', 'Budget-friendly, close to nature.'],
  ['mid-range', 'Mid-range', 'Comfortable lodges and tented camps.'],
  ['luxury', 'Luxury', 'Premium camps and private guides.'],
];

// url: route after /{lang}. key: i18n key in locales/*/common.json
export const mainNav = [
  { key: 'safaris', url: '/safaris', children: [['Camping', '/safaris?style=camping'], ['Mid-range', '/safaris?style=mid-range'], ['Luxury', '/safaris?style=luxury'], ['Great Migration', '/safaris?style=migration'], ['Honeymoon', '/safaris?style=honeymoon'], ['Joining safaris', '/safaris?style=joining']] },
  { key: 'kilimanjaro', url: '/kilimanjaro' },
  { key: 'dayTrips', url: '/day-trips' },
  { key: 'zanzibar', url: '/zanzibar' },
  { key: 'destinations', url: '/destinations' },
  { key: 'travelGuide', url: '/travel-guide', children: [['Accommodation', '/accommodations'], ['Gallery', '/gallery'], ['FAQs', '/faqs'], ['Reviews', '/reviews']] },
  { key: 'blog', url: '/blog' },
  { key: 'about', url: '/about' },
];
