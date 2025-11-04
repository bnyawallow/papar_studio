import { Lucia } from 'lucia';
import supabaseAdapter from '@lucia-auth/adapter-supabase';
import { supabaseUrl, supabaseAnonKey } from './supabase';

const adapter = supabaseAdapter(supabaseUrl, supabaseAnonKey);

export const lucia = new Lucia(adapter(), {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  }
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
  }
}