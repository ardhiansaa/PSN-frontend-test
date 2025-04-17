'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsAuthenticated(isLoggedIn);
      
      if (!isLoggedIn) {
        router.push('/');
      }
      
      setChecking(false);
    };
    
    checkAuth();
  }, [router]);

  if (checking) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
}