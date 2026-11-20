// Config for the content resources managed through the generic admin CRUD screens.
// Column names come only from this file (allowlist), never from user input.
const CONTENT_STATUS = ['draft', 'review', 'published', 'archived'];
const text = (name, label, extra = {}) => ({ name, label, type: 'text', ...extra });
const area = (name, label, extra = {}) => ({ name, label, type: 'textarea', ...extra });
const lines = (name, label, hint) => ({ name, label, type: 'lines', hint: hint ?? 'One item per line' });
const status = { name: 'status', label: 'Status', type: 'select', options: CONTENT_STATUS };
const image = text('image', 'Image (Unsplash photo id or full URL)');

export const resources = {
  tours: {
    table: 'tours', label: 'Tours', singular: 'Tour', perm: 'tours', title: 'title', softDelete: true, hasStatus: true,
    columns: [['title', 'Title'], ['category', 'Category'], ['duration_days', 'Days'], ['price_from', 'From (USD)'], ['status', 'Status']],
    search: ['title', 'slug'], order: 'created_at DESC',
    fields: [
      text('title', 'Title', { required: true }), text('slug', 'URL slug', { hint: 'Leave blank to generate from the title' }),
      { name: 'category', label: 'Category', type: 'select', options: ['safari', 'kilimanjaro', 'day-trip', 'zanzibar'] },
      { name: 'style', label: 'Style', type: 'select', options: ['joining', 'camping', 'mid-range', 'luxury', 'migration', 'honeymoon', 'trek', 'cultural', 'beach'] },
      { name: 'duration_days', label: 'Duration (days)', type: 'number', required: true, min: 1 },
      { name: 'price_from', label: 'Price from (USD per person)', type: 'number', required: true, min: 0 },
      area('summary', 'Summary', { rows: 3 }), area('description', 'Description', { rows: 6 }), image,
      { name: 'is_featured', label: 'Featured on the home page', type: 'checkbox' },
      { name: 'rating', label: 'Rating (1 to 5, optional)', type: 'decimal' },
      { name: 'review_count', label: 'Review count', type: 'number', min: 0 },
      lines('inclusions', 'Included'), lines('exclusions', 'Not included'),
      { name: 'stops', label: 'Destinations visited (in order)', type: 'multi', virtual: true, source: 'destinations' },
      area('itinerary', 'Itinerary', { virtual: true, rows: 8, hint: 'One day per line: Title :: Description' }),
      status,
    ],
  },
  destinations: {
    table: 'destinations', label: 'Destinations', singular: 'Destination', perm: 'destinations', title: 'name', softDelete: true, hasStatus: true,
    columns: [['name', 'Name'], ['region', 'Region'], ['sort_order', 'Order'], ['status', 'Status']],
    search: ['name', 'slug'], order: 'sort_order, name',
    fields: [
      text('name', 'Name', { required: true }), text('slug', 'URL slug'), text('region', 'Region'), text('tagline', 'Tagline'),
      area('summary', 'Summary', { rows: 3 }), area('description', 'Description', { rows: 6 }), text('best_season', 'Best time to visit'), image,
      lines('highlights', 'Highlights'), lines('wildlife', 'Wildlife'),
      { name: 'sort_order', label: 'Sort order', type: 'number' }, status,
    ],
  },
  accommodations: {
    table: 'accommodations', label: 'Accommodation', singular: 'Stay', perm: 'accommodations', title: 'name', softDelete: true, hasStatus: true,
    columns: [['name', 'Name'], ['type', 'Type'], ['tier', 'Tier'], ['status', 'Status']],
    search: ['name', 'slug'], order: 'created_at DESC',
    fields: [
      text('name', 'Name', { required: true }), text('slug', 'URL slug'), text('type', 'Type (Lodge, Tented camp...)'),
      { name: 'tier', label: 'Tier', type: 'select', options: ['camping', 'mid-range', 'luxury', 'beach'] },
      { name: 'destination_id', label: 'Destination', type: 'select', source: 'destinations', nullable: true },
      area('description', 'Description', { rows: 4 }), lines('amenities', 'Amenities'),
      { name: 'price_range', label: 'Price range', type: 'select', options: ['$', '$$', '$$$', '$$$$'] }, image, status,
    ],
  },
  posts: {
    table: 'posts', label: 'Blog posts', singular: 'Post', perm: 'posts', title: 'title', softDelete: true, hasStatus: true,
    columns: [['title', 'Title'], ['published_at', 'Published'], ['status', 'Status']],
    search: ['title', 'slug'], order: 'created_at DESC',
    fields: [
      text('title', 'Title', { required: true }), text('slug', 'URL slug'), area('excerpt', 'Excerpt', { rows: 2 }),
      area('body_html', 'Body', { rows: 12, hint: 'Separate paragraphs with a blank line' }),
      text('category', 'Category', { virtual: true }), image,
      { name: 'published_at', label: 'Publish date', type: 'date' }, status,
    ],
  },
};

export const resourceKeys = Object.keys(resources);
