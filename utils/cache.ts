const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
export const cache = {
  get: <T>(key: string): T | null => {
    // Skip caching in development to see fresh data
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    try {
      const item = sessionStorage.getItem(`cache_${key}`);
      if (!item) return null;
      const { data, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp > CACHE_DURATION) {
        sessionStorage.removeItem(`cache_${key}`);
        return null;
      }
      return data;
    } catch (error) {
      ;
      return null;
    }
  },
  set: (key: string, data: any): void => {
    try {
      const item = JSON.stringify({
        data,
        timestamp: Date.now()
      });
      sessionStorage.setItem(`cache_${key}`, item);
    } catch (error) {
      ;
    }
  },
  clear: (key: string): void => {
    sessionStorage.removeItem(`cache_${key}`);
  }
};
