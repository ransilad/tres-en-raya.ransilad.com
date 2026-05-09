import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  key: string;
}

let client: SupabaseClient | null = null;
const playerClients = new Map<string, SupabaseClient>();

export function getSupabaseConfig(): SupabaseConfig | null {
  const env = import.meta.env;
  const url = env.PUBLIC_SUPABASE_URL;
  const key = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export function getSupabaseClient(): SupabaseClient {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error('Supabase public configuration is missing.');
  }

  client ??= createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}

export function createSupabasePlayerClient(playerToken: string): SupabaseClient {
  const existing = playerClients.get(playerToken);
  if (existing) return existing;

  const config = getSupabaseConfig();
  if (!config) {
    throw new Error('Supabase public configuration is missing.');
  }

  const playerClient = createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: `tres-en-raya-${playerToken.slice(0, 12)}`,
    },
    global: {
      headers: {
        'x-player-token': playerToken,
      },
    },
  });

  playerClients.set(playerToken, playerClient);
  return playerClient;
}
