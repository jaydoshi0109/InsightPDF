"use client"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
/**
 * UserSync component handles syncing Clerk user data with our database
 * and managing the user session state.
 */
export function UserSync() {
  const { user, isSignedIn, isLoaded } = useUser()
  const [isSyncing, setIsSyncing] = useState(false)
  const [hasError, setHasError] = useState(false)
  // Sync user data with our database
  const syncUser = async () => {
    if (!isLoaded || isSyncing || !isSignedIn || !user) {
      ;
      return;
    }
    ;
    setIsSyncing(true);
    setHasError(false);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      ;
      controller.abort();
    }, 15000); // 15 second timeout
    try {
      // Check if user exists in our database
      const checkUrl = `/api/check-user?userId=${user.id}`;
      ;
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      ;
      // Validate response
      const contentType = checkResponse.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await checkResponse.text();
        throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
      }
      const data = await checkResponse.json();
      if (!checkResponse.ok) {
        throw new Error(data.error || `Failed to check user: ${checkResponse.status}`);
      }
      // Create user if they don't exist
      if (!data.exists) {
        ;
        const userData = {
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        };
        const createResponse = await fetch('/api/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include',
          body: JSON.stringify(userData),
          cache: 'no-store',
          signal: controller.signal
        });
        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create user');
        }
        const result = await createResponse.json();
        ;
      } else {
        ;
      }
      // Redirect to dashboard if on home page
      if (window.location.pathname === '/') {
        ;
        window.location.href = '/dashboard';
      }
    } catch (error) {
      ;
      setHasError(true);
    } finally {
      setIsSyncing(false);
    }
  };
  // Run the sync when auth state changes
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      ;
      syncUser().catch(error => {
        ;
      });
    }
  }, [isLoaded, isSignedIn]);
  // No UI needed for this component
  return null;
}
