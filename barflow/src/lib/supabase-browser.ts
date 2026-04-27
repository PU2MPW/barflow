import { createServerClient } from '@supabase/ssr';
import { Cookies } from 'react-cookie';

const cookieStore = new Cookies();

export const createBrowserClient = () => {
  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name);
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.remove(name, options);
        },
      },
    }
  );
};