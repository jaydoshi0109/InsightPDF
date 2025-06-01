/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Enable server actions with larger body size limit
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Allow external packages in server components
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  webpack: (config, { isServer, dev }) => {
    // Fixes npm packages that depend on `pg` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Webpack 5 no longer polyfills Node.js modules by default
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        // Cloudflare Workers specific modules
        'cloudflare:sockets': false,
        'pg-native': false,
        // PostgreSQL client
        pg: false,
      };
    }

    // Add null-loader for server-only modules in client-side code
    if (!isServer) {
      config.module.rules.push({
        test: /\.(node|worker\.js|cloudflare|pg-native|pg|net|dns|tls|fs|child_process)$/,
        use: 'null-loader',
      });
    }

    // Server-side configuration - ensure pg is properly externalized
    config.externals = [...(config.externals || []), 'pg', 'pg-native', 'pg-connection-string'];

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      // Add more Node.js module fallbacks if needed
      ...(!isServer && {
        // Client-side only fallbacks
        'pg': false,
        'pg-native': false,
      }),
    };
    
    // Add support for .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
  // Enable server components
  experimental: {
    // Required for Clerk to work with localtunnel
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Allow external packages in server components
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  // Disable type checking during build (handled by CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build (handled by CI)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Required for Clerk to work with localtunnel
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
