const EPSILON_TOKENS = new Set(['', 'ε', 'ϵ', 'E', 'e', 'eps', 'epsilon', 'empty', '""'])

const CLOSURE_PROPERTIES = {
  3: {
    union: true,
    intersection: true,
    complement: true,
    concatenation: true,
    kleeneStar: true,
  },
  2: {
    union: true,
    intersection: false,
    complement: false,
    concatenation: true,
    kleeneStar: true,
  },
  1: {
    union: true,
    intersection: true,
    complement: true,
    concatenation: true,
    kleeneStar: true,
  },
  0: {
    union: true,
    intersection: true,
    complement: false,
    concatenation: true,
    kleeneStar: true,
  },
}

const normalizeRhs = (rhsRaw) => {
  const trimmed = (rhsRaw || '').trim()
  if (EPSILON_TOKENS.has(trimmed)) {
    return ''
  }
  return trimmed.replace(/\s+/g, '')
}

const parseGrammar = (input) => {
  const lines = (input || '')
    .replace(/\r/g, '\n')
    .split(/[\n,;]+/)
    .map((line) => line.trim())
    .filter(Boolean)

  const productions = []

  lines.forEach((line) => {
    if (!/(->|=>|→)/.test(line)) return
    const [lhsRaw, rhsRaw = ''] = line.split(/->|=>|→/)
    const lhs = (lhsRaw || '').replace(/\s+/g, '')
    if (!lhs) return

    rhsRaw.split('|').forEach((option) => {
      const rhs = normalizeRhs(option)
      productions.push({
        lhs,
        rhs,
        isEpsilon: rhs.length === 0,
      })
    })
  })

  return productions
}

const convertLanguageDescriptionToGrammar = (raw) => {
  const lowered = raw.toLowerCase()

  if (lowered.includes('a^n') && lowered.includes('b^n') && lowered.includes('c^n')) {
    return {
      interpretedAs: 'S->aSBC|abc, CB->BC, aB->ab, bB->bb, bC->bc, cC->cc',
      note: 'Interpreted as context-sensitive language a^n b^n c^n.',
    }
  }

  if (lowered.includes('a^n') && lowered.includes('b^n')) {
    return {
      interpretedAs: 'S->aSb|ab',
      note: 'Interpreted as: S -> aSb | ab',
    }
  }

  if ((lowered.includes('end') && lowered.includes('01')) || lowered.includes('ending with 01')) {
    return {
      interpretedAs: 'S->0S|1S|0A, A->1',
      note: 'Interpreted as language of strings ending with 01.',
    }
  }

  if (lowered.includes('balanced') || raw.includes('(') || raw.includes(')')) {
    return {
      interpretedAs: 'S->(S)S|ε',
      note: 'Interpreted as balanced parentheses grammar.',
    }
  }

  return null
}

const findStartSymbol = (productions) => {
  const lhs = productions[0]?.lhs || 'S'
  const match = lhs.match(/[A-Z]/)
  return match ? match[0] : 'S'
}

const hasVariable = (lhs) => /[A-Z]/.test(lhs)
const variableCount = (text) => (text.match(/[A-Z]/g) || []).length

const classifyType0 = (productions) => {
  const violations = []
  productions.forEach((p) => {
    if (!hasVariable(p.lhs)) {
      violations.push(`Type 0 violation: '${p.lhs}' has no variable on LHS.`)
    }
  })
  return { ok: violations.length === 0, violations }
}

const classifyType1 = (productions, startSymbol) => {
  const violations = []
  const rhsAll = productions.map((p) => p.rhs).join('')
  const startOnRhs = rhsAll.includes(startSymbol)

  productions.forEach((p) => {
    if (/^[A-Z]{2,}$/.test(p.lhs)) {
      violations.push(`Type 1 violation: '${p.lhs} -> ${p.rhs || 'ε'}' treated as unrestricted in this checker.`)
      return
    }

    if (p.isEpsilon) {
      if (p.lhs === startSymbol && !startOnRhs) {
        return
      }

      if (p.lhs !== startSymbol) {
        return
      }

      violations.push(`Type 1 violation: '${p.lhs} -> ε' invalid when start appears on RHS.`)
      return
    }

    if (p.lhs.length > p.rhs.length) {
      violations.push(`Type 1 violation: '${p.lhs} -> ${p.rhs}' has |LHS| > |RHS|.`)
    }
  })

  return {
    ok: violations.length === 0,
    violations,
  }
}

const classifyType2 = (productions, startSymbol) => {
  const violations = []
  const rhsAll = productions.map((p) => p.rhs).join('')
  const startOnRhs = rhsAll.includes(startSymbol)

  productions.forEach((p) => {
    if (!/^[A-Z]$/.test(p.lhs)) {
      violations.push(`Type 2 violation: LHS '${p.lhs}' is not a single variable.`)
      return
    }

    if (p.isEpsilon && !(p.lhs === startSymbol && !startOnRhs)) {
      violations.push(`Type 2 violation: '${p.lhs} -> ε' is only valid for start symbol absent from RHS.`)
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

  const vars = [...rhs.matchAll(/[A-Z]/g)].map((m) => m.index)

  if (vars.length > 1) {
    return { ok: false, orientation: null, reason: `RHS '${rhs}' has more than one variable.` }
  }

  if (vars.length === 0) {
    return { ok: true, orientation: 'neutral' }
  }

  const pos = vars[0]
  if (pos === rhs.length - 1) {
    return { ok: true, orientation: 'right' }
  }

  if (pos === 0) {
    return { ok: true, orientation: 'left' }
  }

  return { ok: false, orientation: null, reason: `RHS '${rhs}' has variable in middle.` }
}

const classifyType3 = (productions) => {
  const violations = []
  const orientationSet = new Set()

  productions.forEach((p) => {
    const check = inspectRegularRule(p.rhs)
    if (!check.ok) {
      violations.push(`Type 3 violation: ${check.reason}`)
      return
    }

    if (check.orientation === 'left' || check.orientation === 'right') {
      orientationSet.add(check.orientation)
    }
  })

  if (orientationSet.size > 1) {
    violations.push('Type 3 violation: mixed left-linear and right-linear productions.')
  }

  return {
    ok: violations.length === 0,
    orientation: orientationSet.has('left') ? 'left' : 'right',
    violations,
  }
}

const alphabetFromProductions = (productions) => {
  const symbols = new Set()
  productions.forEach((p) => {
    for (const ch of p.rhs) {
      if (/^[a-z0-9]$/.test(ch)) {
        symbols.add(ch)
      }
    }
  })
  return Array.from(symbols).sort()
}

const buildNfaRightLinear = (productions, startSymbol) => {
  const states = new Set([startSymbol, 'q_accept'])
  const transitions = []
  const accepting = new Set(['q_accept'])

  productions.forEach((p) => {
    states.add(p.lhs)

    if (p.isEpsilon) {
      accepting.add(p.lhs)
      return
    }

    const rhs = p.rhs
    const variablePositions = [...rhs.matchAll(/[A-Z]/g)].map((m) => m.index)
    if (variablePositions.length > 1) return

    const varPos = variablePositions[0]

    if (variablePositions.length === 0) {
      if (rhs.length === 1) {
        transitions.push({ from: p.lhs, to: 'q_accept', label: rhs })
      }
      return
    }

    if (varPos === rhs.length - 1 && rhs.length === 2) {
      const terminal = rhs[0]
      const target = rhs[1]
      states.add(target)
      transitions.push({ from: p.lhs, to: target, label: terminal })
    }
  })

  return {
    states: Array.from(states),
    transitions,
    start: startSymbol,
    accepting: Array.from(accepting),
  }
}

const buildNfaFromRegularGrammar = (productions, startSymbol, orientation) => {
  const normalizedProductions = orientation === 'right'
    ? productions
    : productions.map((p) => ({
      lhs: p.lhs,
      rhs: p.rhs.split('').reverse().join(''),
      isEpsilon: p.isEpsilon,
    }))

  const unionRegex = (a, b) => {
    if (!a) return b
    if (!b) return a
    if (a === b) return a
    return `(${a}|${b})`
  }

  const concatRegex = (...parts) => {
    const filtered = parts.filter((p) => p !== null)
    if (!filtered.length) return null
    if (filtered.some((p) => p === null)) return null

    const withoutEpsilon = filtered.filter((p) => p !== 'ε')
    if (!withoutEpsilon.length) return 'ε'
    return withoutEpsilon.map((p) => (p.length === 1 ? p : `(${p})`)).join('')
  }

  const starRegex = (part) => {
    if (!part || part === 'ε') return 'ε'
    if (part.length === 1) return `${part}*`
    return `(${part})*`
  }

  const grammarToRegex = () => {
    const ACCEPT = '__ACCEPT__'
    const GNFA_START = '__GNFA_START__'
    const GNFA_END = '__GNFA_END__'

    const states = new Set([ACCEPT, GNFA_START, GNFA_END, startSymbol])
    const edges = new Map()

    const edgeKey = (from, to) => `${from}::${to}`
    const addEdge = (from, to, label) => {
      const key = edgeKey(from, to)
      const prev = edges.get(key) || null
      edges.set(key, unionRegex(prev, label))
    }

    normalizedProductions.forEach((p) => {
      states.add(p.lhs)

      if (p.isEpsilon) {
        addEdge(p.lhs, ACCEPT, 'ε')
        return
      }

      const match = p.rhs.match(/^([a-z0-9]*)([A-Z])?$/)
      if (!match) return

      const terminalPart = match[1] || ''
      const nextVariable = match[2] || null
      const target = nextVariable || ACCEPT
      states.add(target)
      addEdge(p.lhs, target, terminalPart || 'ε')
    })

    addEdge(GNFA_START, startSymbol, 'ε')
    addEdge(ACCEPT, GNFA_END, 'ε')

    const activeStates = Array.from(states)
    const getEdge = (from, to) => edges.get(edgeKey(from, to)) || null
    const setEdge = (from, to, label) => {
      if (!label) return
      edges.set(edgeKey(from, to), label)
    }

    const removable = activeStates.filter((s) => s !== GNFA_START && s !== GNFA_END)
    removable.forEach((k) => {
      const inStates = activeStates.filter((i) => i !== k)
      const outStates = activeStates.filter((j) => j !== k)
      const rkk = getEdge(k, k)

      inStates.forEach((i) => {
        const rik = getEdge(i, k)
        if (!rik) return

        outStates.forEach((j) => {
          const rkj = getEdge(k, j)
          if (!rkj) return

          const composed = concatRegex(rik, starRegex(rkk), rkj)
          const rij = getEdge(i, j)
          setEdge(i, j, unionRegex(rij, composed))
        })
      })

      activeStates.forEach((s) => {
        edges.delete(edgeKey(s, k))
        edges.delete(edgeKey(k, s))
      })
    })

    return getEdge(GNFA_START, GNFA_END) || 'ε'
  }

  const insertConcat = (regex) => {
    const isSymbol = (ch) => /^[a-z0-9ε]$/.test(ch)
    let out = ''

    for (let i = 0; i < regex.length; i += 1) {
      const curr = regex[i]
      const next = regex[i + 1]
      out += curr

      if (!next) continue
      const leftConcat = isSymbol(curr) || curr === ')' || curr === '*'
      const rightConcat = isSymbol(next) || next === '('
      if (leftConcat && rightConcat) {
        out += '.'
      }
    }

    return out
  }

  const toPostfix = (regex) => {
    const precedence = { '|': 1, '.': 2 }
    const output = []
    const ops = []

    for (let i = 0; i < regex.length; i += 1) {
      const token = regex[i]

      if (/^[a-z0-9ε]$/.test(token)) {
        output.push(token)
      } else if (token === '*') {
        output.push(token)
      } else if (token === '(') {
        ops.push(token)
      } else if (token === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          output.push(ops.pop())
        }
        if (ops.length && ops[ops.length - 1] === '(') ops.pop()
      } else if (token === '|' || token === '.') {
        while (
          ops.length
          && ops[ops.length - 1] !== '('
          && precedence[ops[ops.length - 1]] >= precedence[token]
        ) {
          output.push(ops.pop())
        }
        ops.push(token)
      }
    }

    while (ops.length) {
      output.push(ops.pop())
    }

    return output
  }

  const buildFromPostfix = (postfixTokens) => {
    let stateCounter = 0
    const nextState = () => `N${stateCounter++}`
    const stack = []

    const mergeTransitions = (...lists) => lists.flatMap((l) => l)

    postfixTokens.forEach((token) => {
      if (/^[a-z0-9ε]$/.test(token)) {
        const start = nextState()
        const accept = nextState()
        stack.push({
          start,
          accept,
          states: new Set([start, accept]),
          transitions: [{ from: start, to: accept, label: token }],
        })
        return
      }

      if (token === '.') {
        const nfa2 = stack.pop()
        const nfa1 = stack.pop()
        if (!nfa1 || !nfa2) return

        stack.push({
          start: nfa1.start,
          accept: nfa2.accept,
          states: new Set([...nfa1.states, ...nfa2.states]),
          transitions: mergeTransitions(
            nfa1.transitions,
            [{ from: nfa1.accept, to: nfa2.start, label: 'ε' }],
            nfa2.transitions
          ),
        })
        return
      }

      if (token === '|') {
        const nfa2 = stack.pop()
        const nfa1 = stack.pop()
        if (!nfa1 || !nfa2) return

        const start = nextState()
        const accept = nextState()
        stack.push({
          start,
          accept,
          states: new Set([start, accept, ...nfa1.states, ...nfa2.states]),
          transitions: mergeTransitions(
            [{ from: start, to: nfa1.start, label: 'ε' }, { from: start, to: nfa2.start, label: 'ε' }],
            nfa1.transitions,
            nfa2.transitions,
            [{ from: nfa1.accept, to: accept, label: 'ε' }, { from: nfa2.accept, to: accept, label: 'ε' }]
          ),
        })
        return
      }

      if (token === '*') {
        const nfa = stack.pop()
        if (!nfa) return

        const start = nextState()
        const accept = nextState()
        stack.push({
          start,
          accept,
          states: new Set([start, accept, ...nfa.states]),
          transitions: mergeTransitions(
            [
              { from: start, to: nfa.start, label: 'ε' },
              { from: start, to: accept, label: 'ε' },
            ],
            nfa.transitions,
            [
              { from: nfa.accept, to: nfa.start, label: 'ε' },
              { from: nfa.accept, to: accept, label: 'ε' },
            ]
          ),
        })
      }
    })

    return stack.pop() || null
  }

  const regex = grammarToRegex()
  const postfix = toPostfix(insertConcat(regex))
  const nfa = buildFromPostfix(postfix)

  if (!nfa) {
    return {
      states: [startSymbol],
      transitions: [],
      start: startSymbol,
      accepting: [startSymbol],
    }
  }

  return {
    states: Array.from(nfa.states),
    transitions: nfa.transitions,
    start: nfa.start,
    accepting: [nfa.accept],
  }
}

const epsilonClosure = (stateSet, transitions) => {
  const closure = new Set(stateSet)
  let changed = true
  while (changed) {
    changed = false
    transitions.forEach((t) => {
      if (t.label === 'ε' && closure.has(t.from) && !closure.has(t.to)) {
        closure.add(t.to)
        changed = true
      }
    })
  }
  return closure
}

const setKey = (set) => {
  const arr = Array.from(set).sort()
  if (!arr.length) return 'dead'
  if (arr.length === 1) return arr[0]
  return `{${arr.join(',')}}`
}

const buildDfaFromNfa = (nfa, alphabet) => {
  const symbols = (alphabet || []).filter((symbol) => symbol !== 'ε')
  const acceptingSet = new Set(nfa.accepting || [])

  const transitionMap = new Map()
  const keyForTransition = (from, label) => `${from}|${label}`
  ;(nfa.transitions || []).forEach((t) => {
    const key = keyForTransition(t.from, t.label)
    if (!transitionMap.has(key)) transitionMap.set(key, new Set())
    transitionMap.get(key).add(t.to)
  })

  const closure = (states) => {
    const out = new Set(states)
    const stack = [...states]

    while (stack.length) {
      const state = stack.pop()
      const epsMoves = transitionMap.get(keyForTransition(state, 'ε')) || new Set()
      epsMoves.forEach((next) => {
        if (!out.has(next)) {
          out.add(next)
          stack.push(next)
        }
      })
    }

    return out
  }

  const move = (states, symbol) => {
    const out = new Set()
    states.forEach((state) => {
      const next = transitionMap.get(keyForTransition(state, symbol)) || new Set()
      next.forEach((target) => out.add(target))
    })
    return out
  }

  const setKeyCanonical = (setValue) => {
    const arr = Array.from(setValue).sort()
    return arr.length ? `{${arr.join(',')}}` : 'dead'
  }

  const startSet = closure(new Set([nfa.start]))
  const startKey = setKeyCanonical(startSet)

  const queue = [startSet]
  const visited = new Set([startKey])
  const states = new Set([startKey])
  const accepting = new Set()
  const dfaTransitions = new Map()

  if (Array.from(startSet).some((state) => acceptingSet.has(state))) {
    accepting.add(startKey)
  }

  while (queue.length) {
    const currentSet = queue.shift()
    const currentKey = setKeyCanonical(currentSet)

    symbols.forEach((symbol) => {
      const nextSet = closure(move(currentSet, symbol))
      const nextKey = setKeyCanonical(nextSet)

      dfaTransitions.set(`${currentKey}|${symbol}`, nextKey)

      if (!visited.has(nextKey)) {
        visited.add(nextKey)
        states.add(nextKey)
        if (nextKey !== 'dead') queue.push(nextSet)

        if (Array.from(nextSet).some((state) => acceptingSet.has(state))) {
          accepting.add(nextKey)
        }
      }
    })
  }

  const hasDead = states.has('dead')
  if (hasDead) {
    symbols.forEach((symbol) => {
      dfaTransitions.set(`dead|${symbol}`, 'dead')
    })
  }

  const transitions = []
  states.forEach((fromState) => {
    symbols.forEach((symbol) => {
      const toState = dfaTransitions.get(`${fromState}|${symbol}`)
      if (toState) {
        transitions.push({ from: fromState, to: toState, label: symbol })
      }
    })
  })

  return {
    states: Array.from(states),
    transitions,
    start: startKey,
    accepting: Array.from(accepting),
    deadState: hasDead ? 'dead' : null,
  }
}

const buildTransitionTable = (automaton, alphabet) => {
  const headers = ['State', ...alphabet]
  const rows = automaton.states.map((state) => {
    let markedState = state
    if (state === automaton.start) markedState = `→ ${markedState}`
    if (automaton.accepting.includes(state)) markedState = `* ${markedState}`

    const row = [markedState]
    alphabet.forEach((symbol) => {
      const next = automaton.transitions.find((t) => t.from === state && t.label === symbol)
      row.push(next ? next.to : '-')
    })
    return row
  })

  return { headers, rows }
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

const deriveSingle = (productions, startSymbol, maxDepth = 8) => {
  const map = buildProductionMap(productions)
  const steps = [startSymbol]
  let current = startSymbol

  for (let i = 0; i < maxDepth; i += 1) {
    const nt = current.match(/[A-Z]/)?.[0]
    if (!nt) break
    const options = map[nt] || []
    if (!options.length) break
    const replacement = options.find((opt) => !/[A-Z]/.test(opt)) || options[0]
    current = current.replace(nt, replacement || '')
    steps.push(current || 'ε')
  }

  return steps
}

const deriveAllPaths = (productions, startSymbol, maxDepth = 5) => {
  const map = buildProductionMap(productions)
  const queue = [{ current: startSymbol, path: [startSymbol], depth: 0 }]
  const chains = []

  while (queue.length) {
    const item = queue.shift()
    const ntMatch = item.current.match(/[A-Z]/)

    if (!ntMatch || item.depth >= maxDepth) {
      if (!/[A-Z]/.test(item.current)) {
        chains.push(item.path)
      }
      continue
    }

    const nt = ntMatch[0]
    const options = map[nt] || []
    options.forEach((opt) => {
      const highlighted = item.current.replace(nt, `**${nt}**`)
      const next = item.current.replace(nt, opt || '') || 'ε'
      queue.push({
        current: next,
        path: [...item.path, `${highlighted} ⇒ ${next}`],
        depth: item.depth + 1,
      })
    })
  }

  const unique = []
  const seen = new Set()
  chains.forEach((chain) => {
    const key = chain.join(' | ')
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(chain)
    }
  })

  return unique.slice(0, 12).map((chain) => chain.join('  '))
}

const shortestStringAndPath = (productions, startSymbol) => {
  const map = buildProductionMap(productions)
  const queue = [{ value: startSymbol, path: [startSymbol], depth: 0 }]
  const seen = new Set([startSymbol])

  while (queue.length) {
    const current = queue.shift()
    if (!/[A-Z]/.test(current.value)) {
      if (current.value.length >= 2 && current.value.length <= 4) {
        return { string: current.value, path: current.path }
      }
    }

    if (current.depth >= 7) continue

    const nt = current.value.match(/[A-Z]/)?.[0]
    if (!nt) continue

    const options = map[nt] || []
    for (const opt of options) {
      const next = current.value.replace(nt, opt || '') || 'ε'
      if (!seen.has(next)) {
        seen.add(next)
        queue.push({ value: next, path: [...current.path, next], depth: current.depth + 1 })
      }
    }
  }

  const fallback = deriveSingle(productions, startSymbol)
  return { string: fallback[fallback.length - 1] || 'ε', path: fallback }
}

const buildParseTreeFromPath = (path) => {
  const normalize = (value) => (value === 'ε' ? '' : String(value || ''))
  const initial = normalize(path?.[0] || 'S')
  const root = { name: initial || 'ε', children: [] }

  const MAX_STEPS = 256
  const MAX_NODES = 4000
  let nodeCount = 1

  const collectLeavesLeftToRight = (node) => {
    if (!node.children || node.children.length === 0) {
      return [node]
    }
    return node.children.flatMap((child) => collectLeavesLeftToRight(child))
  }

  const locateExpansion = (prev, next) => {
    let prefixLen = 0
    while (prefixLen < prev.length && prefixLen < next.length && prev[prefixLen] === next[prefixLen]) {
      prefixLen += 1
    }

    let suffixLen = 0
    while (
      suffixLen < prev.length - prefixLen
      && suffixLen < next.length - prefixLen
      && prev[prev.length - 1 - suffixLen] === next[next.length - 1 - suffixLen]
    ) {
      suffixLen += 1
    }

    const changedPrev = prev.slice(prefixLen, prev.length - suffixLen)
    const changedNext = next.slice(prefixLen, next.length - suffixLen)
    if (changedPrev.length === 1 && /^[A-Z]$/.test(changedPrev)) {
      return { index: prefixLen, nt: changedPrev, replacement: changedNext }
    }

    for (let i = 0; i < prev.length; i += 1) {
      const symbol = prev[i]
      if (!/^[A-Z]$/.test(symbol)) continue

      const prefix = prev.slice(0, i)
      const suffix = prev.slice(i + 1)
      if (!next.startsWith(prefix) || !next.endsWith(suffix)) continue

      return {
        index: i,
        nt: symbol,
        replacement: next.slice(prefix.length, next.length - suffix.length),
      }
    }

    return null
  }

  const steps = Array.isArray(path) ? path : []
  for (let stepIndex = 1; stepIndex < steps.length && stepIndex <= MAX_STEPS; stepIndex += 1) {
    const prev = normalize(steps[stepIndex - 1])
    const next = normalize(steps[stepIndex])
    const expansion = locateExpansion(prev, next)
    if (!expansion) break

    const frontier = collectLeavesLeftToRight(root).filter((leaf) => leaf.name !== 'ε')
    const targetLeaf = frontier[expansion.index]
    if (!targetLeaf || targetLeaf.name !== expansion.nt || targetLeaf.children.length) {
      break
    }

    const symbols = expansion.replacement.length ? expansion.replacement.split('') : ['ε']
    if (nodeCount + symbols.length > MAX_NODES) break

    targetLeaf.children = symbols.map((symbol) => ({ name: symbol, children: [] }))
    nodeCount += symbols.length
  }

  return root
}

const inferRegexEquivalent = (productions, startSymbol) => {
  if (productions.length === 1 && productions[0].isEpsilon) {
    return 'ε'
  }

  if (
    productions.length === 2
    && productions.every((p) => p.lhs === startSymbol)
  ) {
    const loop = productions.find((p) => /^[a-z0-9][A-Z]$/.test(p.rhs) && p.rhs[1] === startSymbol)
    const term = productions.find((p) => /^[a-z0-9]$/.test(p.rhs))
    if (loop && term) {
      return `${loop.rhs[0]}*${term.rhs}`
    }
  }

  return null
}

const buildLanguageDescription = (typeNumber, regexEquivalent, exampleStrings) => {
  if (typeNumber === 3) {
    if (regexEquivalent) {
      return `This grammar generates strings that match pattern ${regexEquivalent}. Examples: ${exampleStrings.join(', ')}.`
    }
    return `This regular grammar generates pattern-based strings. Examples: ${exampleStrings.join(', ')}.`
  }

  if (typeNumber === 2) {
    return `This context-free grammar generates nested or recursive structures. Examples: ${exampleStrings.join(', ')}.`
  }

  if (typeNumber === 1) {
    return `This context-sensitive grammar enforces length/ordering constraints during rewriting. Examples: ${exampleStrings.join(', ')}.`
  }

  return 'This unrestricted grammar can express very general computations that need Turing-machine-level power.'
}

const buildPdaTransitions = () => [
  { from: 'q_start', to: 'q_loop', label: 'ε, ε -> S' },
  { from: 'q_loop', to: 'q_loop', label: 'a, S -> aSb' },
  { from: 'q_loop', to: 'q_accept', label: 'ε, ε -> ε' },
]

const buildLbaSteps = () => [
  { tape: '[a][a][b][b][c][c]', head: 0, state: 'q0', action: 'scan and mark first a' },
  { tape: '[X][a][b][b][c][c]', head: 2, state: 'q1', action: 'find matching b' },
  { tape: '[X][a][Y][b][c][c]', head: 4, state: 'q2', action: 'find matching c' },
]

const buildTmTransitions = () => [
  { state: 'q0', read: 'a', write: 'X', move: 'R', nextState: 'q1' },
  { state: 'q1', read: 'a', write: 'a', move: 'R', nextState: 'q1' },
  { state: 'q1', read: 'b', write: 'Y', move: 'L', nextState: 'q2' },
  { state: 'q2', read: 'X', write: 'X', move: 'R', nextState: 'q0' },
]

const classifyGrammar = (rawGrammarInput) => {
  const rawInput = (rawGrammarInput || '').trim()
  const interpreted = convertLanguageDescriptionToGrammar(rawInput)
  const grammarInput = interpreted?.interpretedAs || rawInput

  const productions = parseGrammar(grammarInput)
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
      error: type0.violations.join(' '),
      statusCode: 400,
    }
  }

  const type1 = classifyType1(productions, startSymbol)
  const type2 = classifyType2(productions, startSymbol)
  const type3 = classifyType3(productions)

  const checksPassed = {
    type3: type0.ok && type1.ok && type2.ok && type3.ok,
    type2: type0.ok && type1.ok && type2.ok,
    type1: type0.ok && type1.ok,
    type0: true,
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

  const alphabet = alphabetFromProductions(productions)
  const derivationPaths = deriveAllPaths(productions, startSymbol, 5)
  const shortest = shortestStringAndPath(productions, startSymbol)
  const parseTree = buildParseTreeFromPath(shortest.path)

  let nfa = null
  let dfa = null
  let nfaTable = null
  let dfaTable = null
  let regexEquivalent = null

  if (typeNumber === 3) {
    nfa = buildNfaFromRegularGrammar(productions, startSymbol, type3.orientation)
    dfa = buildDfaFromNfa(nfa, alphabet)
    nfaTable = buildTransitionTable(nfa, alphabet)
    dfaTable = buildTransitionTable(dfa, alphabet)
    regexEquivalent = inferRegexEquivalent(productions, startSymbol)
  }

  const tmTransitions = typeNumber === 0 ? buildTmTransitions() : []
  const pdaTransitions = typeNumber === 2 ? buildPdaTransitions() : []
  const lbaSteps = typeNumber === 1 ? buildLbaSteps() : []

  const exampleStrings = (() => {
    const map = buildProductionMap(productions)
    const queue = [{ value: startSymbol, depth: 0 }]
    const seen = new Set([startSymbol])
    const out = []

    while (queue.length && out.length < 8) {
      const curr = queue.shift()
      if (!/[A-Z]/.test(curr.value)) {
        if (curr.value.length <= 12) out.push(curr.value || 'ε')
        continue
      }
      if (curr.depth >= 6) continue

      const nt = curr.value.match(/[A-Z]/)?.[0]
      const options = map[nt] || []
      options.forEach((opt) => {
        const next = curr.value.replace(nt, opt || '') || 'ε'
        if (!seen.has(next)) {
          seen.add(next)
          queue.push({ value: next, depth: curr.depth + 1 })
        }
      })
    }

    return out.length ? out.slice(0, 6) : ['No short terminal strings found.']
  })()

  const reasonByType = {
    3: 'Grammar satisfies right/left-linear constraints consistently, so it is regular.',
    2: 'Grammar is context-free (single variable on LHS) but violates regular constraints.',
    1: 'Grammar respects non-shrinking context-sensitive constraints but is not context-free.',
    0: 'Grammar is unrestricted and does not satisfy stricter Type 1/2/3 constraints.',
  }

  const languageDescription = buildLanguageDescription(typeNumber, regexEquivalent, exampleStrings)

  return {
    type,
    typeNumber,
    reason: reasonByType[typeNumber],
    checksPassed,
    violations: Array.from(new Set(violations)),
    visualizations: {
      parseTree,
      nfa,
      dfa,
      tmTransitions: typeNumber === 0 ? { states: ['q0', 'q1', 'q2', 'q_accept', 'q_reject'], transitions: tmTransitions } : null,
    },
    derivationSteps: derivationPaths,
    exampleStrings,
    regexEquivalent,
    languageDescription,
    closureProperties: CLOSURE_PROPERTIES[typeNumber],
    parseTreeData: {
      forString: shortest.string,
      tree: parseTree,
    },
    nfaTable,
    dfaTable,
    pdaTransitions,
    tmTransitions,
    lbaSteps,
    interpretationNote: interpreted?.note || null,
    d3Hints: {
      force: { linkDistance: 120, charge: -400 },
      tree: { nodeSize: [60, 120] },
      selfLoopPath: 'M cx,cy C cx-30,cy-60 cx+30,cy-60 cx,cy',
      minCanvas: { width: 400, height: 300 },
    },
  }
}

module.exports = {
  classifyGrammar,
}
