'use client'

import { FormEvent, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, HelpCircle, Play, Sparkles, XCircle } from 'lucide-react'
import AppShell from '@/components/app-shell'
import NeonButton from '@/components/neon-button'
import LoadingSpinner from '@/components/loading-spinner'
import { getHierarchy, simulateString } from '@/lib/api'
import { HierarchyType, SimulationResult } from '@/lib/types'
import { LEARNING_BY_TYPE } from '@/lib/learningContent'

const PLACEHOLDER_BY_TYPE: Record<string, string> = {
  type3: 'Try: 1101',
  type2: 'Try: (()())',
  type1: 'Try: aaabbbccc',
  type0: 'Any string',
}

function buildSimpleSteps(type: string, input: string, accepted: boolean | 'unknown') {
  if (type === 'type3') {
    const lastTwo = input.slice(-2)
    return [
      "Step 1: Check if the string uses only 0 and 1.",
      `Step 2: Check the last two characters. They are '${lastTwo || 'none'}'.`,
      accepted === true
        ? "Step 3: Last two are '01', so it follows the rule."
        : "Step 3: Last two are not '01', so it breaks the rule.",
    ]
  }

  if (type === 'type2') {
    return [
      "Step 1: Move left to right through the string.",
      "Step 2: Push '(' and pop when ')' appears.",
      accepted === true
        ? 'Step 3: All opens are matched by closes, so it is valid.'
        : 'Step 3: A bracket did not match correctly, so it is invalid.',
    ]
  }

  if (type === 'type1') {
    return [
      "Step 1: Check order is a...b...c...",
      "Step 2: Count how many a, b, and c symbols exist.",
      accepted === true
        ? 'Step 3: Counts are equal, so it fits a^n b^n c^n.'
        : 'Step 3: Counts or order are wrong, so it does not fit.',
    ]
  }

  return [
    'Step 1: Type 0 is very general.',
    'Step 2: There is no short universal test for all cases.',
    'Step 3: Result stays unknown in this teaching simulator.',
  ]
}

export default function SimulatorPage() {
  const [types, setTypes] = useState<HierarchyType[]>([])
  const [selectedType, setSelectedType] = useState('type3')
  const [input, setInput] = useState('1101')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const teaching = LEARNING_BY_TYPE[selectedType as HierarchyType['id']]

  useEffect(() => {
    async function fetchTypes() {
      try {
        setInitialLoading(true)
        const data = await getHierarchy()
        setTypes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hierarchy')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchTypes()
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const data = await simulateString({
        type: selectedType,
        string: input,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell
      title="String Simulator"
      subtitle="Pick a type, test a string, and learn why it passes or fails in simple words."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel rounded-3xl p-8"
        >
          <h2 className="text-xl font-semibold text-white">Run Simulation</h2>
          <div className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">In simple words</p>
            <p className="mt-2 text-cyan-100">{teaching.inSimpleWords}</p>
          </div>
          {initialLoading ? (
            <div className="mt-6">
              <LoadingSpinner label="Loading language types..." />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label htmlFor="type" className="mb-2 block text-sm text-slate-300">
                  Grammar Type
                </label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full rounded-2xl border border-cyan-300/30 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300/40 transition focus:ring"
                >
                  {types.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="input" className="mb-2 block text-sm text-slate-300">
                  Input String
                </label>
                <input
                  id="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={PLACEHOLDER_BY_TYPE[selectedType]}
                  className="w-full rounded-2xl border border-cyan-300/30 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300/40 transition focus:ring"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Rule used</p>
                <p className="mt-2 text-slate-100">{teaching.rule}</p>
                <p className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                  <HelpCircle className="h-3.5 w-3.5 text-cyan-300" />
                  Machine (model used to check strings): {teaching.machineHint}
                </p>
              </div>

              <NeonButton type="submit" className="w-full justify-center rounded-2xl" disabled={loading}>
                <Play className="h-4 w-4" />
                {loading ? 'Testing...' : 'Test String'}
              </NeonButton>
            </form>
          )}
          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel rounded-3xl p-8"
        >
          <h2 className="text-xl font-semibold text-white">Simulation Result</h2>
          {!result ? (
            <p className="mt-5 text-slate-300">Run a test to see Accepted/Rejected status, steps, and explanation.</p>
          ) : (
            <div className="mt-5 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                <div className="mt-2 inline-flex items-center gap-2 text-lg font-semibold">
                  {result.accepted === true && (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                      <span className="text-emerald-300">Accepted</span>
                    </>
                  )}
                  {result.accepted === false && (
                    <>
                      <XCircle className="h-5 w-5 text-rose-300" />
                      <span className="text-rose-300">Rejected</span>
                    </>
                  )}
                  {result.accepted === 'unknown' && <span className="text-amber-300">Unknown</span>}
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Why this result?
                </p>
                <p className="mt-2 text-cyan-100">
                  {result.accepted === true && `This string is accepted because it follows the rule: ${teaching.rule}`}
                  {result.accepted === false && `This string is rejected because it breaks the rule: ${teaching.rule}`}
                  {result.accepted === 'unknown' && 'This result is unknown because Type 0 needs a general Turing-machine level check.'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">How it works (simple steps)</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {buildSimpleSteps(selectedType, input, result.accepted).map((step) => (
                    <li key={step} className="rounded-lg bg-white/5 px-3 py-2">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Backend steps</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {result.steps.map((step) => (
                    <li key={step} className="rounded-lg bg-white/5 px-3 py-2">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Explanation</p>
                <p className="mt-2 text-slate-200">{result.reason}</p>
              </div>
            </div>
          )}
        </motion.section>
      </div>
      {loading && (
        <div className="mt-6">
          <LoadingSpinner label="Running simulation..." />
        </div>
      )}
    </AppShell>
  )
}
