'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion } from 'framer-motion'
import { Play, RefreshCcw } from 'lucide-react'
import AppShell from '@/components/app-shell'
import NeonButton from '@/components/neon-button'
import LoadingSpinner from '@/components/loading-spinner'
import { classifyGrammar } from '@/lib/api'
import { ClassifyResult } from '@/lib/types'

type GraphData = {
  states?: string[]
  transitions?: Array<{ from: string; to: string; label: string }>
  start?: string
  accepting?: string[]
  deadState?: string | null
} | null

function formatTypeLabel(type: string) {
  return type.replace('(', ' - ').replace(')', '')
}

function TransitionTable({
  title,
  table,
}: {
  title: string
  table?: { headers: string[]; rows: string[][] } | null
}) {
  if (!table) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-200">
          <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              {table.headers.map((header) => (
                <th key={header} className="px-2 py-2">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="border-t border-white/10">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-2 py-2">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ForceGraph({
  title,
  graph,
  animateString,
}: {
  title: string
  graph: GraphData
  animateString?: string
}) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const resetRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!svgRef.current || !graph?.states?.length) {
      return
    }

    const width = 500
    const height = 320

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const markerId = `arrow-${title.replace(/\s+/g, '-')}`

    const defs = svg.append('defs')
    defs
      .append('marker')
      .attr('id', markerId)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#cbd5e1')

    const g = svg.append('g')

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString())
      })

    svg.call(zoom)

    const nodes = graph.states.map((state) => ({ id: state }))
    const displayLabelById = new Map(graph.states.map((state, index) => [state, `q${index}`]))
    const links = (graph.transitions || []).map((t) => ({
      source: t.from,
      target: t.to,
      from: t.from,
      to: t.to,
      label: t.label,
    }))

    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        'link',
        d3
          .forceLink(links as unknown as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[])
          .id((d: d3.SimulationNodeDatum) => (d as { id: string }).id)
          .distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))

    const normalLinks = links.filter((l) => l.from !== l.to)
    const selfLoops = links.filter((l) => l.from === l.to)

    const linkGroup = g
      .append('g')
      .selectAll('line')
      .data(normalLinks)
      .join('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-opacity', 0.75)
      .attr('stroke-width', 1.4)
      .attr('marker-end', `url(#${markerId})`)

    const linkLabels = g
      .append('g')
      .selectAll('text')
      .data(normalLinks)
      .join('text')
      .attr('fill', '#f8fafc')
      .attr('font-size', 11)
      .text((d: { label: string }) => d.label)

    const selfLoopPaths = g
      .append('g')
      .selectAll('path')
      .data(selfLoops)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1.4)
      .attr('marker-end', `url(#${markerId})`)

    const selfLoopLabels = g
      .append('g')
      .selectAll('text')
      .data(selfLoops)
      .join('text')
      .attr('fill', '#f8fafc')
      .attr('font-size', 11)
      .text((d: { label: string }) => d.label)

    const nodeGroup = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', (d: { id: string }) => `node-${d.id.replace(/[^a-zA-Z0-9_]/g, '_')}`)

    nodeGroup
      .append('circle')
      .attr('r', 18)
      .attr('fill', (d: { id: string }) => {
        const id = d.id
        if (id === 'dead' || id.includes('∅')) return '#334155'
        if ((graph.accepting || []).includes(id)) return '#0f172a'
        return '#10243a'
      })
      .attr('stroke', (d: { id: string }) => {
        const id = d.id
        if (id === graph.start) return '#f472b6'
        if (id === 'dead' || id.includes('∅')) return '#94a3b8'
        return '#22d3ee'
      })
      .attr('stroke-dasharray', (d: { id: string }) => {
        const id = d.id
        return id === 'dead' || id.includes('∅') ? '4,3' : '0'
      })
      .attr('stroke-width', 2)

    nodeGroup
      .filter((d: { id: string }) => (graph.accepting || []).includes(d.id))
      .append('circle')
      .attr('r', 14)
      .attr('fill', 'none')
      .attr('stroke', '#a78bfa')
      .attr('stroke-width', 1.5)

    nodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', '#f8fafc')
      .attr('font-size', 10)
      .text((d: { id: string }) => displayLabelById.get(d.id) || d.id)

    simulation.on('tick', () => {
      linkGroup
        .attr('x1', (d: any) => ((d.source as { x: number }).x))
        .attr('y1', (d: any) => ((d.source as { y: number }).y))
        .attr('x2', (d: any) => ((d.target as { x: number }).x))
        .attr('y2', (d: any) => ((d.target as { y: number }).y))

      linkLabels
        .attr('x', (d: any) => (((d.source as { x: number }).x + (d.target as { x: number }).x) / 2))
        .attr('y', (d: any) => (((d.source as { y: number }).y + (d.target as { y: number }).y) / 2) - 4)

      selfLoopPaths.attr('d', (d: { from: string }) => {
        const n = nodes.find((node) => (node as { id: string }).id === d.from) as { x: number; y: number } | undefined
        if (!n) return ''
        return `M ${n.x},${n.y} C ${n.x - 30},${n.y - 60} ${n.x + 30},${n.y - 60} ${n.x},${n.y}`
      })

      selfLoopLabels
        .attr('x', (d: { from: string }) => {
          const n = nodes.find((node) => (node as { id: string }).id === d.from) as { x: number; y: number } | undefined
          return n ? n.x : 0
        })
        .attr('y', (d: { from: string }) => {
          const n = nodes.find((node) => (node as { id: string }).id === d.from) as { x: number; y: number } | undefined
          return n ? n.y - 58 : 0
        })

      nodeGroup.attr('transform', (d: any) => `translate(${(d as { x: number }).x}, ${(d as { y: number }).y})`)
    })

    if (animateString && graph.start) {
      const pathStates: string[] = [graph.start]
      let currentState = graph.start

      animateString.split('').forEach((symbol) => {
        const next = (graph.transitions || []).find((t) => t.from === currentState && t.label === symbol)
        if (next) {
          currentState = next.to
          pathStates.push(currentState)
        }
      })

      pathStates.forEach((state, index) => {
        setTimeout(() => {
          g.selectAll('g[class^="node-"] circle').attr('fill-opacity', 1)
          const cls = `.node-${state.replace(/[^a-zA-Z0-9_]/g, '_')} circle`
          g.selectAll(cls).attr('fill', '#0ea5e9').attr('fill-opacity', 0.95)
        }, 700 * (index + 1))
      })
    }

    if (resetRef.current) {
      d3.select(resetRef.current).on('click', () => {
        svg
          .transition()
          .duration(400)
          .call(zoom.transform, d3.zoomIdentity)
      })
    }

    return () => {
      simulation.stop()
      if (resetRef.current) {
        d3.select(resetRef.current).on('click', null)
      }
    }
  }, [graph, title, animateString])

  if (!graph?.states?.length) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
        <button ref={resetRef} type="button" className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-xs text-slate-200">
          <RefreshCcw className="h-3.5 w-3.5" />
          Reset View
        </button>
      </div>
      <svg ref={svgRef} className="mt-3 h-[300px] w-full min-w-[400px]" />
    </div>
  )
}

function ParseTreeD3({
  parseTreeData,
}: {
  parseTreeData?: {
    forString: string
    tree: { name: string; children?: Array<Record<string, unknown>> }
  }
}) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const resetRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!svgRef.current || !parseTreeData?.tree) return

    const width = 520
    const height = 320
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const g = svg.append('g').attr('transform', 'translate(40,40)')

    const root = d3.hierarchy(parseTreeData.tree as unknown as { name: string; children?: Array<{ name: string }> })
    const treeLayout = d3.tree<typeof root.data>().nodeSize([60, 120])
    const tree = treeLayout(root)

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString())
      })

    svg.call(zoom)

    g.selectAll('line')
      .data(tree.links())
      .join('line')
      .attr('x1', (d: d3.HierarchyPointLink<{ name: string }>) => d.source.y)
      .attr('y1', (d: d3.HierarchyPointLink<{ name: string }>) => d.source.x)
      .attr('x2', (d: d3.HierarchyPointLink<{ name: string }>) => d.target.y)
      .attr('y2', (d: d3.HierarchyPointLink<{ name: string }>) => d.target.x)
      .attr('stroke', '#e2e8f0')

    const node = g
      .selectAll('g')
      .data(tree.descendants())
      .join('g')
      .attr('transform', (d: d3.HierarchyPointNode<{ name: string }>) => `translate(${d.y},${d.x})`)

    node
      .append('circle')
      .attr('r', 14)
      .attr('fill', (d: d3.HierarchyPointNode<{ name: string }>) => (/^[A-Z]$/.test(d.data.name) ? '#0f766e' : '#be185d'))
      .attr('stroke', '#f8fafc')
      .attr('stroke-width', 1.4)

    node
      .append('text')
      .text((d: d3.HierarchyPointNode<{ name: string }>) => d.data.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', '#f8fafc')
      .attr('font-size', 10)

    if (resetRef.current) {
      d3.select(resetRef.current).on('click', () => {
        svg
          .transition()
          .duration(400)
          .call(zoom.transform, d3.zoomIdentity)
      })
    }
  }, [parseTreeData])

  if (!parseTreeData?.tree) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Parse Tree for '{parseTreeData.forString}'</p>
        <button ref={resetRef} type="button" className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-xs text-slate-200">
          <RefreshCcw className="h-3.5 w-3.5" />
          Reset View
        </button>
      </div>
      <svg ref={svgRef} className="mt-3 h-[300px] w-full min-w-[400px]" />
    </div>
  )
}

export default function SimulatorPage() {
  const [input, setInput] = useState('S->aS|b')
  const [result, setResult] = useState<ClassifyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const typeHeading = useMemo(() => {
    if (!result) return ''
    return formatTypeLabel(result.type)
  }, [result])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const data = await classifyGrammar(input)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classification failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell
      title="Grammar & Language Classifier"
      subtitle="Enter language/grammar once, then inspect complete type analysis and visualizations."
    >
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">enter language/ grammar to know its type</p>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Examples: S->aS|b, S->aSb|ab, a^n b^n"
          className="mt-4 w-full rounded-2xl border border-cyan-300/30 bg-slate-950/70 px-4 py-4 text-slate-100 outline-none ring-cyan-300/40 transition focus:ring"
        />
        <div className="mt-5">
          <NeonButton type="submit" className="w-full justify-center rounded-2xl" disabled={loading}>
            <Play className="h-4 w-4" />
            {loading ? 'Analyzing...' : 'Know Type'}
          </NeonButton>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </form>

      {loading ? (
        <div className="mt-8 glass-panel rounded-3xl p-10">
          <LoadingSpinner label="Classifying and generating visualization data..." />
        </div>
      ) : null}

      {result ? (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
          <div className="glass-panel rounded-3xl p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Classification</p>
            <h2 className="mt-2 text-3xl font-bold text-cyan-200">{typeHeading}</h2>
            <p className="mt-3 text-slate-200">{result.reason}</p>
            {result.interpretationNote ? <p className="mt-2 text-sm text-cyan-100">{result.interpretationNote}</p> : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Language Description</p>
              <p className="mt-2 text-slate-100">{result.languageDescription}</p>
              {result.regexEquivalent ? (
                <div className="mt-3 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                  Equivalent Regex: {result.regexEquivalent}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Closure Properties</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li className="rounded-lg bg-white/5 px-3 py-2">Union: {result.closureProperties?.union ? '✓' : '✗'}</li>
                <li className="rounded-lg bg-white/5 px-3 py-2">Intersection: {result.closureProperties?.intersection ? '✓' : '✗'}</li>
                <li className="rounded-lg bg-white/5 px-3 py-2">Complement: {result.closureProperties?.complement ? '✓' : '✗'}</li>
                <li className="rounded-lg bg-white/5 px-3 py-2">Concatenation: {result.closureProperties?.concatenation ? '✓' : '✗'}</li>
                <li className="rounded-lg bg-white/5 px-3 py-2">Kleene star: {result.closureProperties?.kleeneStar ? '✓' : '✗'}</li>
              </ul>
            </div>
          </div>

          <ForceGraph title="NFA Graph" graph={result.visualizations.nfa as GraphData} animateString={result.exampleStrings?.[0]} />
          <TransitionTable title="NFA Transition Table" table={result.nfaTable} />

          <ForceGraph title="DFA Graph" graph={result.visualizations.dfa as GraphData} />
          <TransitionTable title="DFA Transition Table" table={result.dfaTable} />

          <ParseTreeD3 parseTreeData={result.parseTreeData} />

          {result.pdaTransitions?.length ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">PDA Transitions</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {result.pdaTransitions.map((row) => (
                  <li key={`${row.from}-${row.to}-${row.label}`} className="rounded-lg bg-white/5 px-3 py-2">
                    {row.from} {'->'} {row.to} : {row.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.lbaSteps?.length ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">LBA Steps</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {result.lbaSteps.map((step, index) => (
                  <li key={`${step.state}-${index}`} className="rounded-lg bg-white/5 px-3 py-2">
                    {step.state}: {step.tape} (head={step.head}) - {step.action}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.tmTransitions?.length ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Turing Machine Transition Table</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-200">
                  <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-2 py-2">State</th>
                      <th className="px-2 py-2">Read</th>
                      <th className="px-2 py-2">Write</th>
                      <th className="px-2 py-2">Move</th>
                      <th className="px-2 py-2">Next</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.tmTransitions.map((row, index) => (
                      <tr key={`${row.state}-${index}`} className="border-t border-white/10">
                        <td className="px-2 py-2">{row.state}</td>
                        <td className="px-2 py-2">{row.read}</td>
                        <td className="px-2 py-2">{row.write}</td>
                        <td className="px-2 py-2">{row.move}</td>
                        <td className="px-2 py-2">{row.nextState}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Derivation Paths (depth 5)</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {result.derivationSteps.map((step) => (
                  <li key={step} className="rounded-lg bg-white/5 px-3 py-2" dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g, '<span style="color:#22d3ee;font-weight:700;">$1</span>') }} />
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Example Strings</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {result.exampleStrings.map((sample) => (
                  <li key={sample} className="rounded-lg bg-white/5 px-3 py-2">{sample}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      ) : null}
    </AppShell>
  )
}
