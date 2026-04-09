'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Layers, Lightbulb, MemoryStick, Sparkles } from 'lucide-react'
import AppShell from '@/components/app-shell'
import LoadingSpinner from '@/components/loading-spinner'
import { getExploreContent, getHierarchy, getHierarchyType } from '@/lib/api'
import { ExploreContent, HierarchyType } from '@/lib/types'
import { LEARNING_BY_TYPE } from '@/lib/learningContent'

const layerColors: Record<string, string> = {
  type0: '#8b5cf6',
  type1: '#3b82f6',
  type2: '#22d3ee',
  type3: '#f472b6',
}

const layerSize: Record<string, number> = {
  type0: 88,
  type1: 70,
  type2: 52,
  type3: 34,
}

export default function ExplorePage() {
  const [types, setTypes] = useState<HierarchyType[]>([])
  const [selectedId, setSelectedId] = useState<string>('type3')
  const [selectedType, setSelectedType] = useState<HierarchyType | null>(null)
  const [exploreContent, setExploreContent] = useState<ExploreContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHierarchy() {
      try {
        setLoading(true)
        setError(null)
        const [hierarchyData, exploreData] = await Promise.all([
          getHierarchy(),
          getExploreContent(),
        ])
        setTypes(hierarchyData)
        setExploreContent(exploreData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hierarchy')
      } finally {
        setLoading(false)
      }
    }

    fetchHierarchy()
  }, [])

  useEffect(() => {
    async function fetchTypeDetails() {
      if (!selectedId) return

      try {
        setDetailsLoading(true)
        setError(null)
        const data = await getHierarchyType(selectedId)
        setSelectedType(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hierarchy type')
      } finally {
        setDetailsLoading(false)
      }
    }

    fetchTypeDetails()
  }, [selectedId])

  const orderedTypes = useMemo(() => {
    const ordering = ['type0', 'type1', 'type2', 'type3']
    return [...types].sort((a, b) => ordering.indexOf(a.id) - ordering.indexOf(b.id))
  }, [types])

  const learning = selectedType ? LEARNING_BY_TYPE[selectedType.id] : null
  const backendSection = selectedType
    ? exploreContent?.sections.find((section) => section.id === selectedType.id)
    : null

  return (
    <AppShell
      title={exploreContent?.overview.title || 'Explore the Hierarchy'}
      subtitle={
        exploreContent?.overview.summary
        || 'Click a layer to learn each type in plain English, with examples and friendly intuition.'
      }
    >
      {loading ? (
        <div className="glass-panel rounded-3xl p-10">
          <LoadingSpinner label="Loading hierarchy..." />
        </div>
      ) : error ? (
        <div className="glass-panel rounded-3xl border border-rose-400/50 p-6 text-rose-200">{error}</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, x: -22 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-3xl p-6 sm:p-8"
          >
            <div className="mb-6 flex items-center gap-2 text-cyan-200">
              <Layers className="h-4 w-4" />
              <span className="text-sm uppercase tracking-[0.2em]">Nested View</span>
            </div>
            <p className="mb-6 text-sm text-slate-300">
              Tip: On mobile, use the buttons below the circles if tapping rings feels hard.
            </p>

            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              {orderedTypes.map((item, index) => {
                const isActive = selectedId === item.id
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.03 }}
                    animate={{ opacity: isActive ? 1 : 0.75 }}
                    onClick={() => setSelectedId(item.id)}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                    title={`${item.name}: ${LEARNING_BY_TYPE[item.id].simpleDefinition}`}
                    style={{
                      width: `${layerSize[item.id]}%`,
                      height: `${layerSize[item.id]}%`,
                      borderColor: layerColors[item.id],
                      boxShadow: isActive
                        ? `0 0 38px ${layerColors[item.id]}88`
                        : `0 0 16px ${layerColors[item.id]}55`,
                      background: isActive
                        ? `${layerColors[item.id]}1a`
                        : `${layerColors[item.id]}0d`,
                      zIndex: 20 - index,
                    }}
                  >
                    <span className="sr-only">{item.name}</span>
                  </motion.button>
                )
              })}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-cyan-200 sm:px-4 sm:text-sm"
              >
                Click a layer
              </motion.div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {orderedTypes.map((item) => {
                const active = selectedId === item.id
                return (
                  <button
                    key={`chip-${item.id}`}
                    onClick={() => setSelectedId(item.id)}
                    className={`rounded-2xl border px-3 py-2 text-sm transition ${
                      active
                        ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100'
                        : 'border-white/15 bg-slate-900/60 text-slate-200 hover:border-cyan-300/40'
                    }`}
                  >
                    {item.name.replace('Type ', 'T')}
                  </button>
                )
              })}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-3xl p-6 sm:p-8"
          >
            {detailsLoading ? (
              <LoadingSpinner label="Loading type details..." />
            ) : selectedType ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">{selectedType.name}</h2>
                <p className="text-slate-300">{selectedType.description}</p>

                {backendSection && (
                  <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Also called</p>
                    <p className="mt-2 text-cyan-100">{backendSection.aka}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">What is this?</p>
                  <p className="mt-2 text-slate-100">{learning?.simpleDefinition || backendSection?.keyProperty}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Grammar</p>
                    <p className="mt-2 font-medium text-cyan-200">{selectedType.grammar}</p>
                    <p className="mt-2 text-xs text-slate-300">
                      {backendSection?.productionForm || 'This is the rule style used to build valid strings.'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      Machine (model used to check strings)
                      <span title={learning?.machineHint}>
                        <HelpCircle className="h-3.5 w-3.5 text-cyan-300" />
                      </span>
                    </p>
                    <p className="mt-2 font-medium text-cyan-200">{selectedType.automaton}</p>
                    {backendSection?.formal && (
                      <p className="mt-2 text-xs text-slate-300">Formal form: {backendSection.formal}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Example</p>
                    <p className="mt-2 text-slate-100">{learning?.easyExample}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Why it matters</p>
                    <p className="mt-2 text-slate-100">{learning?.whyItMatters || backendSection?.language}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      <MemoryStick className="h-3.5 w-3.5 text-cyan-300" />
                      Memory explanation
                    </p>
                    <p className="mt-2 text-slate-100">{learning?.memoryExplanation}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      <Lightbulb className="h-3.5 w-3.5 text-cyan-300" />
                      Visual hint
                    </p>
                    <p className="mt-2 text-slate-100">{learning?.visualHint}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    In simple words
                  </p>
                  <p className="mt-2 text-cyan-100">{learning?.inSimpleWords}</p>
                </div>

                {backendSection?.notes?.length ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Important notes</p>
                    <ul className="mt-3 space-y-2 text-slate-200">
                      {backendSection.notes.map((note) => (
                        <li key={note} className="rounded-lg bg-white/5 px-3 py-2">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">How it works (examples from API)</p>
                  <ul className="mt-3 space-y-2 text-slate-200">
                    {(backendSection?.examples?.length ? backendSection.examples : selectedType.examples).map((example) => (
                      <li key={example} className="rounded-lg bg-white/5 px-3 py-2">
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-slate-300">Select a hierarchy type to inspect details.</p>
            )}
          </motion.section>
        </div>
      )}
    </AppShell>
  )
}
