import { createClient } from '@supabase/supabase-js';

const OPPRIME_URL = 'https://rsngoqmqhfiflgwjggpn.supabase.co';
const OPPRIME_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbmdvcW1xaGZpZmxnd2pnZ3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjUzNjgsImV4cCI6MjA4ODk0MTM2OH0.HOuSGWMQXYRgnbftp59Kp6sfJaO0m8pbUXyrDqAxkiQ';

export const opprimeClient = createClient(OPPRIME_URL, OPPRIME_ANON_KEY);

const S3_BASE = 'https://opprimetv.s3-accelerate.amazonaws.com/';

export const getThumbnailUrl = (path: string | null) =>
  path ? `${S3_BASE}${path}` : '/placeholder.svg';

export const getVideoUrl = (path: string | null) =>
  path ? `${S3_BASE}${path}` : '';
