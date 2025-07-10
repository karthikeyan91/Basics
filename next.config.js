/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // Add domains for RSS feed images here as needed
      'www.nytimes.com',
      'static01.nyt.com',
      'media.npr.org',
      'ichef.bbci.co.uk',
      'cdn.cnn.com',
    ],
  },
}

module.exports = nextConfig