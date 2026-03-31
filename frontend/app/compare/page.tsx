'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Brain, HelpCircle, Lightbulb, MemoryStick, Sparkles } from 'lucide-react'
import AppShell from '@/components/app-shell'
import LoadingSpinner from '@/components/loading-spinner'
import { getHierarchy } from '@/lib/api'
import { HierarchyType } from '@/lib/types'
import { LEARNING_BY_TYPE } from '@/lib/learningContent'

export default function ComparePage() {
  const [types, setTypes] = useState<HierarchyType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getHierarchy()
        setTypes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hierarchy')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <AppShell
      title="Compare Language Classes"
      subtitle="A student-friendly side-by-side guide: what each type means, examples, memory, and why it matters."
    >
      {loading ? (
        <div className="glass-panel rounded-3xl p-10">
          <LoadingSpinner label="Loading comparison data..." />
        </div>
      ) : error ? (
        <div className="glass-panel rounded-3xl border border-rose-400/50 p-6 text-rose-200">{error}</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {types.map((item, index) => {
            const learning = LEARNING_BY_TYPE[item.id]
            return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="glass-panel rounded-3xl p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{item.name}</h2>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
                  <BarChart3 className="h-3.5 w-3.5" />
                  {item.id.toUpperCase()}
                </span>
              </div>

              <p className="mt-3 text-slate-300">{item.description}</p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">What is this?</p>
                <p className="mt-2 text-slate-100">{learning.simpleDefinition}</p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Grammar</p>
                  <p className="mt-2 text-cyan-200">{item.grammar}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    Machine (model used to check strings)
                    <span title={learning.machineHint}>
                      <HelpCircle className="h-3.5 w-3.5 text-cyan-300" />
                    </span>
                  </p>
                  <p className="mt-2 text-cyan-200">{item.automaton}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Example</p>
                <p className="mt-2 text-slate-100">{learning.easyExample}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">Examples from API</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">
                  {item.examples.map((example) => (
                    <li key={example} className="rounded-lg bg-white/5 px-3 py-2">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <Brain className="h-3.5 w-3.5 text-cyan-300" />
                    Why it matters
                  </p>
                  <p className="mt-2 text-slate-100">{learning.whyItMatters}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <MemoryStick className="h-3.5 w-3.5 text-cyan-300" />
                    Memory explanation
                  </p>
                  <p className="mt-2 text-slate-100">{learning.memoryExplanation}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <Lightbulb className="h-3.5 w-3.5 text-cyan-300" />
                    Visual hint
                  </p>
                  <p className="mt-2 text-slate-100">{learning.visualHint}</p>
                </div>
                <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    In simple words
                  </p>
                  <p className="mt-2 text-cyan-100">{learning.inSimpleWords}</p>
                </div>
              </div>
            </motion.article>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
