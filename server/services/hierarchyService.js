const hierarchyData = [
  {
    id: 'type0',
    name: 'Type 0 (Recursively Enumerable)',
    description:
      'Most expressive language class. Production rules have no structural restrictions and are recognized by Turing machines.',
    grammar: 'Unrestricted grammar',
    automaton: 'Turing Machine',
    examples: ['Halting-problem encodings', 'General algorithmic languages'],
  },
  {
    id: 'type1',
    name: 'Type 1 (Context Sensitive)',
    description:
      'Production rules preserve or increase length (except start rule special cases). Suitable for context-sensitive structures.',
    grammar: 'Context-sensitive grammar',
    automaton: 'Linear Bounded Automaton',
    examples: ['a^n b^n c^n', 'Some natural language agreement constraints'],
  },
  {
    id: 'type2',
    name: 'Type 2 (Context Free)',
    description:
      'Rules replace a single non-terminal. Widely used for parsers and nested structures.',
    grammar: 'Context-free grammar',
    automaton: 'Pushdown Automaton',
    examples: ['Balanced parentheses', 'Expression grammars'],
  },
  {
    id: 'type3',
    name: 'Type 3 (Regular)',
    description:
      'Simplest class with linear patterns and finite memory requirements.',
    grammar: 'Regular grammar',
    automaton: 'Finite Automaton (DFA/NFA)',
    examples: ['Binary strings ending in 01', 'Token patterns'],
  },
]

const { classifyGrammar: classifyGrammarEngine } = require('./classifierService')

const exploreContent = {
  overview: {
    title: 'The Chomsky Hierarchy Overview',
    summary: 'Type 3 ⊂ Type 2 ⊂ Type 1 ⊂ Type 0. Each type is a subset of the one above it.',
  },
  sections: [
    {
      id: 'type0',
      title: 'Type 0 - Unrestricted Grammar',
      aka: 'Phrase Structure Grammar',
      productionForm: 'x -> y where x contains at least one variable',
      formal: 'x ∈ (V ∪ T)* · V · (V ∪ T)*',
      language: 'Recursively Enumerable Language',
      automaton: 'Turing Machine',
      keyProperty: 'At least one variable must appear on the left-hand side.',
      notes: [
        'T = terminals (a, b, ...), V = variables (S, A, ...).',
        'Any grammar that cannot satisfy Type 1/2/3 constraints is Type 0.',
      ],
      examples: [
        'G({S, A}, {a, b}, {S->a, aS->aAS, A->b}, S)',
        'Rules with context on LHS such as aS -> a are Type 0 patterns.',
      ],
    },
    {
      id: 'type1',
      title: 'Type 1 - Context Sensitive Grammar',
      aka: 'Context Sensitive Grammar (CSG)',
      productionForm: 'For every rule x -> y, |x| <= |y|',
      language: 'Context Sensitive Language',
      automaton: 'Linear Bounded Automata (LBA)',
      keyProperty: 'Rules cannot shrink strings (except start epsilon exception).',
      notes: [
        'S -> ε allowed only if S never appears on any RHS.',
        'B -> ε is not allowed when B is not start variable.',
      ],
      examples: ['Sab -> abab is valid because 3 <= 4.'],
    },
    {
      id: 'type2',
      title: 'Type 2 - Context Free Grammar',
      aka: 'CFG',
      productionForm: 'Left side must be exactly one variable: X -> Y',
      language: 'Context Free Language',
      automaton: 'Pushdown Automata (PDA)',
      keyProperty: 'Every production has a single non-terminal on the left.',
      notes: [
        'Only start variable can derive ε (and only under the standard RHS condition).',
        'B -> ε is invalid if B is not start variable.',
      ],
      examples: ['S -> aS | b', 'S -> AB, A -> a, B -> b'],
    },
    {
      id: 'type3',
      title: 'Type 3 - Regular Grammar',
      aka: 'Regular Grammar',
      productionForm: 'Rules are consistently right-linear OR left-linear (not mixed).',
      language: 'Regular Language',
      automaton: 'Finite Automata (DFA/NFA)',
      keyProperty: 'Variable position is restricted to one side only.',
      notes: [
        'Right linear example: S -> aS, invalid: S -> Saa.',
        'Left linear example: S -> Saa, invalid: S -> aasaa.',
      ],
      examples: ['S -> aS | b', 'S -> Sa | b (left-linear style)'],
    },
  ],
  quickReferenceTable: [
    {
      type: 0,
      name: 'Unrestricted',
      lhsForm: '(V∪T)*V(V∪T)*',
      language: 'Recursively Enumerable',
      automaton: 'Turing Machine',
    },
    {
      type: 1,
      name: 'Context Sensitive',
      lhsForm: '|x|<=|y|',
      language: 'Context Sensitive',
      automaton: 'Linear Bounded Automata',
    },
    {
      type: 2,
      name: 'Context Free',
      lhsForm: 'Single Variable',
      language: 'Context Free',
      automaton: 'Pushdown Automata',
    },
    {
      type: 3,
      name: 'Regular',
      lhsForm: 'Right/Left Linear',
      language: 'Regular',
      automaton: 'Finite Automata',
    },
  ],
}

const getAllHierarchyData = () => hierarchyData

const getHierarchyTypeById = (id) => {
  return hierarchyData.find((item) => item.id.toLowerCase() === id.toLowerCase())
}

const getExploreContent = () => exploreContent

const EPSILON_TOKENS = new Set(['ε', 'ϵ', 'E', 'e', 'eps', 'epsilon', ''])

const normalizeRhs = (rhs) => {
  const trimmed = (rhs || '').trim()
  if (EPSILON_TOKENS.has(trimmed)) {
    return ''
  }
  return trimmed.replace(/\s+/g, '')
}

const parseGrammar = (grammarText) => {
  const chunks = (grammarText || '')
    .replace(/\r/g, '\n')
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)

  const productions = []

  chunks.forEach((chunk) => {
    if (!/(->|=>|→)/.test(chunk)) {
      return
    }

    const parts = chunk.split(/->|=>|→/)
    if (parts.length < 2) {
      return
    }

    const lhs = (parts[0] || '').replace(/\s+/g, '')
    const rhsPart = parts.slice(1).join('->')

    if (!lhs) {
      return
    }

    rhsPart.split('|').forEach((alt) => {
      const rhs = normalizeRhs(alt)
      productions.push({
        lhs,
        rhs,
        isEpsilon: rhs.length === 0,
      })
    })
  })

  return productions
}

const hasVariable = (text) => /[A-Z]/.test(text)

const classifyType0 = (productions) => {
  const violations = []
  productions.forEach((p) => {
    if (!hasVariable(p.lhs)) {
      violations.push(`Type 0 violation: LHS '${p.lhs}' has no variable.`)
    }
  })

  return {
    ok: violations.length === 0,
    violations,
  }
}

const findStartSymbol = (productions) => {
  const firstLhs = productions[0]?.lhs || 'S'
  const firstVar = (firstLhs.match(/[A-Z]/) || [firstLhs[0] || 'S'])[0]
  return firstVar
}

const classifyType1 = (productions, startSymbol) => {
  const violations = []
  const rhsCombined = productions.map((p) => p.rhs).join('')
  const startAppearsOnRhs = rhsCombined.includes(startSymbol)

  productions.forEach((p) => {
    if (p.isEpsilon) {
      if (p.lhs !== startSymbol) {
        violations.push(`Type 1 violation: '${p.lhs} -> ε' is not allowed for non-start symbol.`)
      } else if (startAppearsOnRhs) {
        violations.push(`Type 1 violation: '${startSymbol} -> ε' allowed only if start symbol is absent on RHS.`)
      }
      return
    }

    if (p.lhs.length > p.rhs.length) {
      violations.push(`Type 1 violation: '${p.lhs} -> ${p.rhs}' shrinks string (${p.lhs.length} > ${p.rhs.length}).`)
    }
  })

  return {
    ok: violations.length === 0,
    violations,
    growthChecks: productions.map((p) => ({
      production: `${p.lhs} -> ${p.isEpsilon ? 'ε' : p.rhs}`,
      lhsLength: p.lhs.length,
      rhsLength: p.rhs.length,
      condition: p.lhs.length <= p.rhs.length || p.isEpsilon,
    })),
  }
}

const classifyType2 = (productions) => {
  const violations = []
  productions.forEach((p) => {
    if (!/^[A-Z]$/.test(p.lhs)) {
      violations.push(`Type 2 violation: LHS '${p.lhs}' is not a single variable.`)
    }
  })

  return {
    ok: violations.length === 0,
    violations,
  }
}

const inspectRegularRule = (rhs) => {
  if (rhs.length === 0) {
    return { ok: true, orientation: 'neutral' }
  }

  const variablePositions = []
  for (let i = 0; i < rhs.length; i += 1) {
    if (/[A-Z]/.test(rhs[i])) {
      variablePositions.push(i)
    }
  }

  if (variablePositions.length > 1) {
    return { ok: false, orientation: null, reason: `More than one variable in RHS '${rhs}'.` }
  }

  if (variablePositions.length === 0) {
    return { ok: true, orientation: 'neutral' }
  }

  const pos = variablePositions[0]
  if (rhs.length === 1) {
    return { ok: true, orientation: 'both' }
  }

  if (pos === rhs.length - 1) {
    return { ok: true, orientation: 'right' }
  }

  if (pos === 0) {
    return { ok: true, orientation: 'left' }
  }

  return { ok: false, orientation: null, reason: `Variable appears in the middle of RHS '${rhs}'.` }
}

const classifyType3 = (productions) => {
  const violations = []
  const orientations = new Set()

  productions.forEach((p) => {
    const check = inspectRegularRule(p.rhs)
    if (!check.ok) {
      violations.push(`Type 3 violation: ${check.reason}`)
      return
    }

    if (check.orientation === 'left' || check.orientation === 'right') {
      orientations.add(check.orientation)
    }
  })

  if (orientations.size > 1) {
    violations.push('Type 3 violation: Grammar mixes left-linear and right-linear productions.')
  }

  const orientation = orientations.has('left') ? 'left' : 'right'

  return {
    ok: violations.length === 0,
    violations,
    orientation,
  }
}

const buildNfaForRegularGrammar = (productions, startSymbol, orientation) => {
  const states = new Set([startSymbol, 'q_accept'])
  const transitions = []
  const accepting = new Set(['q_accept'])
  let intermediateCounter = 0

  const addChain = (fromState, terminalString, toState) => {
    if (!terminalString.length) {
      if (fromState !== toState) {
        transitions.push({ from: fromState, to: toState, label: 'ε' })
      }
      return
    }

    let current = fromState
    for (let i = 0; i < terminalString.length; i += 1) {
      const next = i === terminalString.length - 1 ? toState : `q_i_${intermediateCounter++}`
      states.add(next)
      transitions.push({ from: current, to: next, label: terminalString[i] })
      current = next
    }
  }

  productions.forEach((p) => {
    states.add(p.lhs)

    if (p.isEpsilon) {
      accepting.add(p.lhs)
      return
    }

    if (orientation === 'right') {
      const match = p.rhs.match(/^([a-z0-9]*)([A-Z])?$/)
      if (!match) {
        return
      }
      const terminals = match[1] || ''
      const finalVar = match[2] || null
      const target = finalVar || 'q_accept'
      states.add(target)
      addChain(p.lhs, terminals, target)
    } else {
      const match = p.rhs.match(/^([A-Z])?([a-z0-9]*)$/)
      if (!match) {
        return
      }
      const leadingVar = match[1] || null
      const terminals = match[2] || ''

      if (!leadingVar) {
        addChain(p.lhs, terminals, 'q_accept')
      } else {
        states.add(leadingVar)
        addChain(leadingVar, terminals, p.lhs)
      }
    }
  })

  return {
    states: Array.from(states),
    transitions,
    start: startSymbol,
    accepting: Array.from(accepting),
  }
}

const convertNfaToDfa = (nfa) => {
  const alphabet = Array.from(
    new Set(
      nfa.transitions
        .map((t) => t.label)
        .filter((label) => label !== 'ε')
    )
  )

  const toKey = (set) => Array.from(set).sort().join(',') || '∅'
  const startSet = new Set([nfa.start])
  const queue = [startSet]
  const visited = new Set([toKey(startSet)])
  const states = []
  const transitions = []
  const accepting = []

  while (queue.length > 0) {
    const currentSet = queue.shift()
    const currentKey = toKey(currentSet)
    states.push(currentKey)

    if (Array.from(currentSet).some((state) => nfa.accepting.includes(state))) {
      accepting.push(currentKey)
    }

    alphabet.forEach((symbol) => {
      const nextSet = new Set()
      nfa.transitions.forEach((t) => {
        if (currentSet.has(t.from) && t.label === symbol) {
          nextSet.add(t.to)
        }
      })

      const nextKey = toKey(nextSet)
      transitions.push({ from: currentKey, to: nextKey, label: symbol })
      if (!visited.has(nextKey)) {
        visited.add(nextKey)
        queue.push(nextSet)
      }
    })
  }

  return {
    states,
    transitions,
    start: toKey(startSet),
    accepting,
  }
}

const buildSimpleParseTree = (startSymbol, derivationSteps) => {
  if (!derivationSteps.length) {
    return { node: startSymbol, children: [] }
  }

  const root = { node: startSymbol, children: [] }
  let current = root

  derivationSteps.slice(1).forEach((step) => {
    const rhs = step.split('->')[1]?.trim() || ''
    const children = rhs.length
      ? rhs.split('').map((symbol) => ({ node: symbol }))
      : [{ node: 'ε' }]

    const next = { node: rhs || 'ε', children }
    current.children.push(next)
    current = next
  })

  return root
}

const buildType0TmTransitions = () => {
  return {
    states: ['q0', 'q1', 'q_accept', 'q_reject'],
    transitions: [
      { state: 'q0', read: 'a', write: 'a', move: 'R', nextState: 'q0' },
      { state: 'q0', read: 'b', write: 'b', move: 'R', nextState: 'q1' },
      { state: 'q1', read: 'b', write: 'b', move: 'R', nextState: 'q1' },
      { state: 'q1', read: '_', write: '_', move: 'S', nextState: 'q_accept' },
    ],
  }
}

const buildProductionMap = (productions) => {
  const map = {}
  productions.forEach((p) => {
    if (/^[A-Z]$/.test(p.lhs)) {
      map[p.lhs] = map[p.lhs] || []
      map[p.lhs].push(p.rhs)
    }
  })
  return map
}

const deriveSteps = (productions, startSymbol) => {
  const map = buildProductionMap(productions)
  const steps = [startSymbol]
  let current = startSymbol

  for (let i = 0; i < 8; i += 1) {
    const match = current.match(/[A-Z]/)
    if (!match) {
      break
    }

    const variable = match[0]
    const replacements = map[variable] || []
    if (!replacements.length) {
      break
    }

    const preferred = replacements.find((r) => r && !/[A-Z]/.test(r))
      || replacements.find((r) => r)
      || ''

    current = current.replace(variable, preferred)
    steps.push(current || 'ε')
  }

  return steps.map((value, index) => {
    if (index === 0) {
      return value
    }
    return `${steps[index - 1]} -> ${value}`
  })
}

const generateExampleStrings = (productions, startSymbol) => {
  const map = buildProductionMap(productions)
  const queue = [{ value: startSymbol, depth: 0 }]
  const seen = new Set([startSymbol])
  const results = []

  while (queue.length && results.length < 6) {
    const current = queue.shift()
    if (!/[A-Z]/.test(current.value)) {
      if (current.value.length <= 12) {
        results.push(current.value)
      }
      continue
    }

    if (current.depth >= 6) {
      continue
    }

    const match = current.value.match(/[A-Z]/)
    if (!match) {
      continue
    }

    const variable = match[0]
    const replacements = map[variable] || []

    replacements.forEach((rep) => {
      const next = current.value.replace(variable, rep)
      if (!seen.has(next) && next.length <= 16) {
        seen.add(next)
        queue.push({ value: next, depth: current.depth + 1 })
      }
    })
  }

  if (!results.length) {
    return ['No short terminal string found from the given productions.']
  }

  return results.slice(0, 5)
}

const classifyGrammar = (grammarText) => {
  const productions = parseGrammar(grammarText)
  const rawInput = (grammarText || '').trim()

  if (!productions.length && rawInput.length) {
    const lowered = rawInput.toLowerCase()

    if ((lowered.includes('end') && lowered.includes('01')) || lowered.includes('ending with 01')) {
      const demoProductions = parseGrammar('S->0S|1S|0A, A->1')
      const startSymbol = 'S'
      const type3 = { orientation: 'right' }
      const nfa = buildNfaForRegularGrammar(demoProductions, startSymbol, type3.orientation)
      const dfa = convertNfaToDfa(nfa)

      return {
        type: 'Type 3 (Regular Grammar)',
        typeNumber: 3,
        reason: 'Detected a regular pattern-style language description (strings ending with 01).',
        checksPassed: { type3: true, type2: true, type1: true, type0: true },
        violations: [],
        visualizations: {
          parseTree: null,
          nfa,
          dfa,
          tmTransitions: null,
        },
        derivationSteps: ['S', 'S -> 1S', '1S -> 10A', '10A -> 1001'],
        exampleStrings: ['01', '101', '1101', '1001'],
      }
    }

    if (lowered.includes('balanced') || rawInput.includes('(') || rawInput.includes(')')) {
      return {
        type: 'Type 2 (Context Free Grammar)',
        typeNumber: 2,
        reason: 'Detected a nested-structure language description (balanced parentheses), which is context-free.',
        checksPassed: { type3: false, type2: true, type1: true, type0: true },
        violations: ['Type 3 violation: nested dependencies require stack memory.'],
        visualizations: {
          parseTree: {
            node: 'S',
            children: [
              { node: '(' },
              {
                node: 'S',
                children: [{ node: '(' }, { node: 'S', children: [{ node: 'ε' }] }, { node: ')' }],
              },
              { node: ')' },
            ],
          },
          nfa: null,
          dfa: null,
          tmTransitions: null,
        },
        derivationSteps: ['S', 'S -> (S)', '(S) -> ((S))', '((S)) -> (())'],
        exampleStrings: ['()', '(())', '(()())'],
      }
    }

    if (lowered.includes('a^n') && lowered.includes('b^n') && lowered.includes('c^n')) {
      return {
        type: 'Type 1 (Context Sensitive Grammar)',
        typeNumber: 1,
        reason: 'Detected language form a^n b^n c^n, which is context-sensitive and not context-free regular.',
        checksPassed: { type3: false, type2: false, type1: true, type0: true },
        violations: [
          'Type 2 violation: equal synchronized counts across three blocks cannot be captured by single-stack CFG in this form.',
        ],
        visualizations: {
          parseTree: {
            derivation: ['S', 'S -> aSBC', 'aSBC -> aaBBCC', 'aaBBCC -> aaabbbccc'],
            growthChecks: [
              { production: 'S -> aSBC', lhsLength: 1, rhsLength: 4, condition: true },
              { production: 'BC -> bC', lhsLength: 2, rhsLength: 2, condition: true },
            ],
          },
          nfa: null,
          dfa: null,
          tmTransitions: null,
        },
        derivationSteps: ['S', 'S -> aSBC', 'aSBC -> aaBBCC', 'aaBBCC -> aaabbbccc'],
        exampleStrings: ['abc', 'aabbcc', 'aaabbbccc'],
      }
    }

    if (lowered.includes('turing') || lowered.includes('undecidable') || lowered.includes('unrestricted')) {
      return {
        type: 'Type 0 (Unrestricted Grammar)',
        typeNumber: 0,
        reason: 'Detected unrestricted/undecidable language description, classified as Type 0.',
        checksPassed: { type3: false, type2: false, type1: false, type0: true },
        violations: ['Violates stricter Type 1/2/3 constraints by unrestricted nature.'],
        visualizations: {
          parseTree: null,
          nfa: null,
          dfa: null,
          tmTransitions: buildType0TmTransitions(),
        },
        derivationSteps: ['General unrestricted derivation depends on machine transitions.'],
        exampleStrings: ['Depends on machine and input; no finite template.'],
      }
    }
  }

  if (!productions.length) {
    return {
      error: 'No valid productions detected. Use rules like S->aS|b separated by newline or comma.',
      statusCode: 400,
    }
  }

  const startSymbol = findStartSymbol(productions)
  const type0 = classifyType0(productions)
  if (!type0.ok) {
    return {
      error: `Invalid grammar for Type 0 baseline: ${type0.violations.join(' ')}`,
      statusCode: 400,
    }
  }

  const type1 = classifyType1(productions, startSymbol)
  const type2 = classifyType2(productions)
  const type3 = classifyType3(productions)

  const checksPassed = {
    type3: type0.ok && type1.ok && type2.ok && type3.ok,
    type2: type0.ok && type1.ok && type2.ok,
    type1: type0.ok && type1.ok,
    type0: type0.ok,
  }

  let typeNumber = 0
  let type = 'Type 0 (Unrestricted Grammar)'
  const violations = []

  if (checksPassed.type3) {
    typeNumber = 3
    type = 'Type 3 (Regular Grammar)'
  } else if (checksPassed.type2) {
    typeNumber = 2
    type = 'Type 2 (Context Free Grammar)'
    violations.push(...type3.violations)
  } else if (checksPassed.type1) {
    typeNumber = 1
    type = 'Type 1 (Context Sensitive Grammar)'
    violations.push(...type2.violations, ...type3.violations)
  } else {
    typeNumber = 0
    type = 'Type 0 (Unrestricted Grammar)'
    violations.push(...type1.violations, ...type2.violations, ...type3.violations)
  }

  const derivationSteps = deriveSteps(productions, startSymbol)
  const exampleStrings = generateExampleStrings(productions, startSymbol)

  const visualizations = {
    parseTree: null,
    nfa: null,
    dfa: null,
    tmTransitions: null,
  }

  if (typeNumber === 3) {
    const nfa = buildNfaForRegularGrammar(productions, startSymbol, type3.orientation)
    const dfa = convertNfaToDfa(nfa)
    visualizations.nfa = nfa
    visualizations.dfa = dfa
  } else if (typeNumber === 2) {
    visualizations.parseTree = buildSimpleParseTree(startSymbol, derivationSteps)
  } else if (typeNumber === 1) {
    visualizations.parseTree = {
      derivation: derivationSteps,
      growthChecks: type1.growthChecks,
    }
  } else {
    visualizations.tmTransitions = buildType0TmTransitions()
  }

  const reasonByType = {
    3: 'All productions satisfy Type 1 and Type 2 constraints, and every rule is consistently regular (right-linear or left-linear) without mixing.',
    2: 'The grammar satisfies non-shrinking and single-variable LHS rules, but fails strict regular-form constraints.',
    1: 'The grammar is non-shrinking with the epsilon exception respected, but it does not satisfy context-free single-variable LHS constraints.',
    0: 'The grammar has at least one variable on every LHS, but violates stricter Type 1/2/3 constraints.',
  }

  return {
    type,
    typeNumber,
    reason: reasonByType[typeNumber],
    checksPassed,
    violations: Array.from(new Set(violations)).slice(0, 20),
    visualizations,
    derivationSteps,
    exampleStrings,
  }
}

const simulateRegular = (input) => {
  const pattern = /^[01]*01$/
  const accepted = pattern.test(input)

  return {
    accepted,
    steps: [
      "Rule: Type 3 example accepts only binary strings ending with '01'.",
      `Input scanned: '${input || '(empty)'}'.`,
      accepted ? "Regex /^[01]*01$/ matched the input." : "Regex /^[01]*01$/ did not match the input.",
    ],
    reason: accepted
      ? "Accepted because the input is binary and ends with '01'."
      : "Rejected because the input is not binary or does not end with '01'.",
  }
}

const simulateContextFree = (input) => {
  const stack = []
  const steps = ["Rule: Type 2 example validates balanced parentheses using a stack."]

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]

    if (char !== '(' && char !== ')') {
      steps.push(`Invalid symbol '${char}' at index ${i}. Only '(' and ')' are allowed.`)
      return {
        accepted: false,
        steps,
        reason: 'Rejected because input contains non-parenthesis characters.',
      }
    }

    if (char === '(') {
      stack.push(char)
      steps.push(`Read '(' at index ${i}: push to stack (size = ${stack.length}).`)
    } else if (stack.length === 0) {
      steps.push(`Read ')' at index ${i}: stack empty, cannot match.`)
      return {
        accepted: false,
        steps,
        reason: "Rejected because ')' appeared without a matching '('.",
      }
    } else {
      stack.pop()
      steps.push(`Read ')' at index ${i}: pop stack (size = ${stack.length}).`)
    }
  }

  const accepted = stack.length === 0

  steps.push(
    accepted
      ? 'End of input: stack is empty.'
      : `End of input: stack still has ${stack.length} unmatched '(' symbol(s).`
  )

  return {
    accepted,
    steps,
    reason: accepted
      ? 'Accepted because every opening parenthesis has a matching closing parenthesis.'
      : 'Rejected because there are unmatched opening parentheses.',
  }
}

const simulateContextSensitive = (input) => {
  const pattern = /^a+b+c+$/
  const steps = ["Rule: Type 1 example validates strings in the form a^n b^n c^n, n >= 1."]

  if (!pattern.test(input)) {
    steps.push("Input must have only contiguous groups of 'a', then 'b', then 'c'.")
    return {
      accepted: false,
      steps,
      reason: "Rejected because the input is not in ordered groups a...b...c...",
    }
  }

  const aCount = (input.match(/a/g) || []).length
  const bCount = (input.match(/b/g) || []).length
  const cCount = (input.match(/c/g) || []).length

  steps.push(`Counted a=${aCount}, b=${bCount}, c=${cCount}.`)

  const accepted = aCount === bCount && bCount === cCount && aCount > 0

  steps.push(
    accepted
      ? 'All three symbol counts are equal and greater than zero.'
      : 'Counts are not equal, so the string is outside a^n b^n c^n.'
  )

  return {
    accepted,
    steps,
    reason: accepted
      ? 'Accepted because the input satisfies a^n b^n c^n with equal counts.'
      : 'Rejected because counts of a, b, and c are not equal.',
  }
}

const simulateTypeZero = () => {
  return {
    accepted: 'unknown',
    steps: [
      'Type 0 languages are recognized by Turing machines.',
      'General membership may require unbounded computation.',
    ],
    reason: 'Undecidable (Turing Machine required)',
  }
}

const simulateString = (type, input) => {
  const normalizedType = type.toLowerCase()

  if (normalizedType === 'type3') {
    return simulateRegular(input)
  }

  if (normalizedType === 'type2') {
    return simulateContextFree(input)
  }

  if (normalizedType === 'type1') {
    return simulateContextSensitive(input)
  }

  if (normalizedType === 'type0') {
    return simulateTypeZero()
  }

  return null
}

module.exports = {
  getAllHierarchyData,
  getExploreContent,
  getHierarchyTypeById,
  classifyGrammar: classifyGrammarEngine,
  simulateString,
}
