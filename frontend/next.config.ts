import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: ['lucide-react', '@components/ui']
    }
}

export default nextConfig
