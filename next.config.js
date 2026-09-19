/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.CAPACITOR_BUILD ? { output: 'export', images: { unoptimized: true } } : {
    rewrites: async () => {
      return [
        {
          source: '/api/:path*',
          destination:
            process.env.NODE_ENV === 'development'
              ? 'http://127.0.0.1:5328/api/:path*'
              : '/api/',
        },
      ]
    },
  })
}

module.exports = nextConfig
