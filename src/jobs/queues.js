import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

const connection = redis;
export const emailQueue = new Queue('email', { connection });
export const imagesQueue = new Queue('images', { connection });
export const cdnQueue = new Queue('cdn', { connection });
export const sitemapQueue = new Queue('sitemap', { connection });
