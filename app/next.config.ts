import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'ui-avatars.com', 
      'lh3.googleusercontent.com', 
      'avatars.githubusercontent.com',
      'avatars.githubusercontent.com',
      'pbs.twimg.com',
      'abs.twimg.com',
      'platform-lookaside.fbsbx.com',
      'cloudflare-ipfs.com',
      'i.pravatar.cc',
      'robohash.org',
      'loremflickr.com',
      'picsum.photos'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
};

export default nextConfig;
