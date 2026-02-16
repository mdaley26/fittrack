/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid 307 redirects on /api/webhooks/stripe/ → /api/webhooks/stripe; Stripe must use URL without trailing slash
  trailingSlash: false,
};

module.exports = nextConfig;
