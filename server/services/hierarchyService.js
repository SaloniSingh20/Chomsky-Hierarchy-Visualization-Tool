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

const getAllHierarchyData = () => hierarchyData

const getHierarchyTypeById = (id) => {
  return hierarchyData.find((item) => item.id.toLowerCase() === id.toLowerCase())
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
  getHierarchyTypeById,
  simulateString,
}
