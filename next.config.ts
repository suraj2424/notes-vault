import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Some environments (locked-down Windows shells / CI sandboxes) can throw `spawn EPERM`
    // during Next.js' type-check phase. We run type-checking separately (e.g. in editor/CI),
    // so allow builds to complete here.
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['mongoose', 'mongodb', 'aws4', 'bufferutil', 'utf-8-validate', 'kerberos', 'snappy', 'zlib', 'bson', 'gridfs-stream'],
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev, isServer}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }

    // Fix for Node.js built-in modules when bundling MongoDB for serverless
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      child_process: false,
    };

    // Hide noisy webpack persistent-cache warning about large string serialization.
    // This is informational and typically comes from large dependency/source-map strings.
    config.infrastructureLogging = {
      ...(config.infrastructureLogging ?? {}),
      level: 'error',
    };

    // Bundle analyzer (only enabled when ANALYZE environment variable is set)
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          generateStatsFile: true,
        })
      );
    }

    return config;
  },
};

export default nextConfig;
