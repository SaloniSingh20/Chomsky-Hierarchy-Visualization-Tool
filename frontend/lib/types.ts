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

export type GrammarVisualization = {
  states?: string[]
  transitions?: Array<Record<string, string>>
  start?: string
  accepting?: string[]
  node?: string
  children?: Array<Record<string, unknown>>
  derivation?: string[]
  growthChecks?: Array<{
    production: string
    lhsLength: number
    rhsLength: number
    condition: boolean
  }>
}

export type ClassifyResult = {
  type: string
  typeNumber: number
  reason: string
  checksPassed: {
    type3: boolean
    type2: boolean
    type1: boolean
    type0: boolean
  }
  violations: string[]
  visualizations: {
    parseTree: GrammarVisualization | null
    nfa: GrammarVisualization | null
    dfa: GrammarVisualization | null
    tmTransitions: {
      states: string[]
      transitions: Array<{
        state: string
        read: string
        write: string
        move: string
        nextState: string
      }>
    } | null
  }
  derivationSteps: string[]
  exampleStrings: string[]
  regexEquivalent?: string | null
  languageDescription?: string
  closureProperties?: {
    union: boolean
    intersection: boolean
    complement: boolean
    concatenation: boolean
    kleeneStar: boolean
  }
  parseTreeData?: {
    forString: string
    tree: {
      name: string
      children?: Array<Record<string, unknown>>
    }
  }
  nfaTable?: {
    headers: string[]
    rows: string[][]
  } | null
  dfaTable?: {
    headers: string[]
    rows: string[][]
  } | null
  pdaTransitions?: Array<{
    from: string
    to: string
    label: string
  }>
  tmTransitions?: Array<{
    state: string
    read: string
    write: string
    move: string
    nextState: string
  }>
  lbaSteps?: Array<{
    tape: string
    head: number
    state: string
    action: string
  }>
  interpretationNote?: string | null
}

export type ExploreContentSection = {
  id: string
  title: string
  aka: string
  productionForm: string
  formal?: string
  language: string
  automaton: string
  keyProperty: string
  notes: string[]
  examples: string[]
}

export type ExploreContent = {
  overview: {
    title: string
    summary: string
  }
  sections: ExploreContentSection[]
  quickReferenceTable: Array<{
    type: number
    name: string
    lhsForm: string
    language: string
    automaton: string
  }>
}
