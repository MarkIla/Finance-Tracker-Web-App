'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../app/lib/auth-context';

/** Gate that redirects to /login when no JWT is present */
export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();              // always called
  const router   = useRouter();            // always called
  const path     = usePathname();          // always called

  /* redirect in an effect so we don't change hook order */
  useEffect(() => {
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(path)}`);
    }
  }, [user, router, path]);

  /* while redirecting we simply render nothing */
  if (!user) return null;

  return <>{children}</>;
}
