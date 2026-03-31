import { HierarchyType } from '@/lib/types'

export type LearningContent = {
  simpleDefinition: string
  easyExample: string
  whyItMatters: string
  memoryExplanation: string
  visualHint: string
  inSimpleWords: string
  rule: string
  machineHint: string
}

export const LEARNING_BY_TYPE: Record<HierarchyType['id'], LearningContent> = {
  type3: {
    simpleDefinition:
      'Regular languages are the simplest type of languages. They follow simple patterns and do not need memory.',
    easyExample: 'Strings ending with 01, like 101 and 1101.',
    whyItMatters: 'Used in search, regex, token checks, and simple form validations.',
    memoryExplanation: 'Memory use: No extra memory. It only needs to know the current state.',
    visualHint: 'Think of it like: a simple pattern checker.',
    inSimpleWords: 'This is like checking if a word follows one easy rule.',
    rule: "String must contain only 0/1 and end with '01'.",
    machineHint: 'Finite Automaton: A simple machine that moves between a few states to check a pattern.',
  },
  type2: {
    simpleDefinition:
      'Context-Free languages can handle nested structures, like matching open and close brackets.',
    easyExample: 'Balanced parentheses, like () and (()()).',
    whyItMatters: 'Used in programming language parsers and syntax checking.',
    memoryExplanation: 'Memory use: Uses a stack to remember what needs to be closed.',
    visualHint: 'Think of it like: opening and closing boxes in the right order.',
    inSimpleWords: 'If you open something, you must close it correctly before ending.',
    rule: "Parentheses must be balanced: each '(' needs a matching ')'.",
    machineHint: 'Pushdown Automaton: A machine with a stack memory used for nested patterns.',
  },
  type1: {
    simpleDefinition:
      'Context-Sensitive languages can handle rules where nearby symbols affect what is valid.',
    easyExample: 'a^n b^n c^n, like abc or aaabbbccc.',
    whyItMatters: 'Useful for advanced language rules and structured constraints.',
    memoryExplanation: 'Memory use: Needs bounded memory to compare counts and order.',
    visualHint: "Think of it like: three groups that must stay in order and have equal sizes.",
    inSimpleWords: 'You need the same number of a, b, and c, in that exact order.',
    rule: "String must look like a...b...c... with equal counts of a, b, and c.",
    machineHint:
      'Linear Bounded Automaton: A machine that uses limited tape space based on input length.',
  },
  type0: {
    simpleDefinition:
      'Recursively Enumerable languages are the most powerful type and can describe very complex problems.',
    easyExample: 'General Turing-machine style languages (no simple universal check).',
    whyItMatters: 'Shows the limit of computation and what can be described algorithmically.',
    memoryExplanation: 'Memory use: Can require unlimited memory and time in general.',
    visualHint: 'Think of it like: an unrestricted computer program.',
    inSimpleWords:
      'This type is so powerful that a machine may keep working for a very long time and still not finish.',
    rule: 'No simple fixed rule here; general membership is undecidable in many cases.',
    machineHint: 'Turing Machine: A general-purpose abstract machine with unbounded tape memory.',
  },
}
