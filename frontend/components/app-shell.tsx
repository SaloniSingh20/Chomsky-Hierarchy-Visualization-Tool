'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Layers, PlayCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore', icon: Layers },
  { href: '/simulator', label: 'Simulator', icon: PlayCircle },
  { href: '/compare', label: 'Compare', icon: BarChart3 },
]

export default function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title?: string
  subtitle?: string
}) {
  const pathname = usePathname()

  return (
    <div className="gradient-bg min-h-screen particles text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="neon-border flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/70 font-black text-cyan-200">
              CH
            </span>
            <span className="font-semibold tracking-wide text-white">Chomsky Visualizer</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm text-slate-300 transition-all',
                    active ? 'bg-white/10 text-cyan-200 shadow-[0_0_20px_rgba(45,226,230,0.2)]' : 'hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          <Link
            href="/explore"
            className="neon-button hidden rounded-xl px-4 py-2 text-sm font-semibold md:inline-flex"
          >
            Start
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 rounded-3xl border border-white/10 bg-slate-900/45 p-8 backdrop-blur-xl"
          >
            {title && (
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {title}
              </h1>
            )}
            {subtitle && <p className="mt-3 max-w-3xl text-slate-300">{subtitle}</p>}
            <motion.div
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-200"
            >
              <Sparkles className="h-4 w-4" />
              Interactive learning mode active
            </motion.div>
          </motion.div>
        )}
        {children}
      </main>
    </div>
  )
}
