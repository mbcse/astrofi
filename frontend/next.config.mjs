/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle Node.js modules in client-side code
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        util: false,
        buffer: false,
        process: false,
        querystring: false,
        'node:module': false,
        'node:crypto': false,
        'node:stream': false,
        'node:util': false,
        'node:buffer': false,
        'node:process': false,
        'node:path': false,
        'node:fs': false,
        'node:os': false,
        'node:url': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:assert': false,
        'node:net': false,
        'node:tls': false,
        'node:querystring': false,
        'node:events': false,
        'node:child_process': false,
        'node:cluster': false,
        'node:dgram': false,
        'node:dns': false,
        'node:domain': false,
        'node:inspector': false,
        'node:module': false,
        'node:perf_hooks': false,
        'node:punycode': false,
        'node:readline': false,
        'node:repl': false,
        'node:string_decoder': false,
        'node:timers': false,
        'node:tty': false,
        'node:v8': false,
        'node:vm': false,
        'node:worker_threads': false,
      }

      // Handle node: scheme in module resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:module': false,
        'node:crypto': false,
        'node:stream': false,
        'node:util': false,
        'node:buffer': false,
        'node:process': false,
        'node:path': false,
        'node:fs': false,
        'node:os': false,
        'node:url': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:assert': false,
        'node:net': false,
        'node:tls': false,
      }

      // Configure Terser to handle worker files
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              parse: {
                ...minimizer.options.terserOptions?.parse,
                ecma: 2020,
              },
              compress: {
                ...minimizer.options.terserOptions?.compress,
                ecma: 2020,
              },
              mangle: {
                ...minimizer.options.terserOptions?.mangle,
                safari10: true,
              },
              output: {
                ...minimizer.options.terserOptions?.output,
                ecma: 2020,
                comments: false,
              },
            }
          }
        })
      }
    }
    return config
  },
}

export default nextConfig
