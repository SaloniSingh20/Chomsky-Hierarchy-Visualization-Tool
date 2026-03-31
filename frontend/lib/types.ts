export type HierarchyType = {
  id: 'type0' | 'type1' | 'type2' | 'type3'
  name: string
  description: string
  grammar: string
  automaton: string
  examples: string[]
  simpleDefinition?: string
  easyExample?: string
  whyItMatters?: string
  memoryExplanation?: string
  visualHint?: string
  inSimpleWords?: string
  rule?: string
}

export type SimulationResult = {
  accepted: boolean | 'unknown'
  steps: string[]
  reason: string
}
