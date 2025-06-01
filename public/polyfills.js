// Polyfill process for browser
if (typeof window !== 'undefined') {
  window.process = {
    env: {
      NODE_ENV: 'development'
    }
  };
}
