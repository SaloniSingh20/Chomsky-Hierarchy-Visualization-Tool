'use client'

import Link from 'next/link'
import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-muted bg-background/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            by SaloniSingh20
          </p>

          {/* GitHub link */}
          <Link 
            href="https://github.com/SaloniSingh20" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-cyan-500/10"
          >
            <Github className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
