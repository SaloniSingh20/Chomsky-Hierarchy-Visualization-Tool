'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-glow backdrop-blur-md bg-background/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/50 to-purple-500/50 border border-cyan-400/50 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
              <span className="text-lg font-bold text-white">CH</span>
            </div>
            <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Chomsky Hierarchy</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Simulator</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Compare</Link>
          </div>

          {/* CTA Button */}
          <Button
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-background font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all"
          >
            Start Learning
          </Button>
        </div>
      </div>
    </nav>
  )
}
