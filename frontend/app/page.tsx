'use client'

import AppShell from '@/components/app-shell'
import NeonButton from '@/components/neon-button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BarChart3, Layers, Play, Sparkles } from 'lucide-react'

const cards = [
  {
    title: 'Type 3 to Type 0 Journey',
    text: 'Follow the containment relationship from regular languages up to recursively enumerable systems.',
  },
  {
    title: 'Visual + Interactive',
    text: 'Click nested hierarchy layers and inspect grammar, automaton model, and canonical examples in context.',
  },
  {
    title: 'Live Simulation',
    text: 'Validate strings using explainable simulations for regular, context-free, and context-sensitive examples.',
  },
]

export default function Home() {
  return (
    <AppShell
      title="Chomsky Hierarchy Visualizer"
      subtitle="A premium interactive workspace for understanding language classes, automata, and grammar constraints with visual intuition."
    >
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="glass-panel rounded-3xl p-8 sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Learning Interface
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Explore Computation Theory Through Motion, Simulation, and Clarity
          </h2>
          <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
            Move between hierarchy layers, compare grammar power, and run input checks with step-by-step explanations. Designed as a top-tier educational dashboard.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link href="/explore">
              <NeonButton className="w-full justify-center rounded-2xl">
                <Layers className="h-4 w-4" />
                Explore
              </NeonButton>
            </Link>
            <Link href="/simulator">
              <NeonButton className="w-full justify-center rounded-2xl">
                <Play className="h-4 w-4" />
                Simulator
              </NeonButton>
            </Link>
            <Link href="/compare">
              <NeonButton className="w-full justify-center rounded-2xl">
                <BarChart3 className="h-4 w-4" />
                Compare
              </NeonButton>
            </Link>
          </div>
        </div>

        <div className="glass-panel animate-border-glow rounded-3xl p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-white">Hierarchy Glimpse</h3>
          <div className="relative mt-6 flex h-[320px] items-center justify-center">
            {[180, 136, 94, 58].map((size, index) => (
              <motion.div
                key={size}
                className="absolute rounded-full border"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  borderColor: ['#8b5cf6', '#3b82f6', '#22d3ee', '#f472b6'][index],
                  boxShadow: `0 0 22px ${['rgba(139,92,246,0.45)', 'rgba(59,130,246,0.45)', 'rgba(34,211,238,0.45)', 'rgba(244,114,182,0.5)'][index]}`,
                }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.2 + index * 0.4, repeat: Infinity }}
              />
            ))}
            <div className="rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-2 text-sm text-cyan-200">
              Type 3 inside Type 0
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {cards.map((card, index) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            className="glass-panel rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold text-white">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{card.text}</p>
          </motion.article>
        ))}
      </section>
    </AppShell>
  )
}
