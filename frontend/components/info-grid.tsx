'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Code, GitBranch, Cpu } from 'lucide-react'

const infoCards = [
  {
    id: 'type3',
    icon: Zap,
    title: 'Regular Languages',
    description: 'Recognized by finite automata. Used in lexical analysis and pattern matching.',
    color: 'from-pink-500 to-pink-400'
  },
  {
    id: 'type2',
    icon: Code,
    title: 'Context-Free Languages',
    description: 'Recognized by pushdown automata. The foundation of programming language syntax.',
    color: 'from-cyan-500 to-cyan-400'
  },
  {
    id: 'type1',
    icon: GitBranch,
    title: 'Context-Sensitive Languages',
    description: 'Recognized by linear-bounded automata. Rules depend on surrounding context.',
    color: 'from-blue-500 to-blue-400'
  },
  {
    id: 'type0',
    icon: Cpu,
    title: 'Recursively Enumerable',
    description: 'Recognized by Turing machines. The most general class of computable languages.',
    color: 'from-purple-500 to-purple-400'
  }
]

export default function InfoGrid({
  setSelectedType
}: {
  setSelectedType: (type: string) => void
}) {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-1/2 -right-48 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Language Types</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Deep dive into each level of the hierarchy
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {infoCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.id} className="group relative">
                {/* Gradient border effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.color} rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-500`}></div>
                
                <Card className="relative bg-card/50 backdrop-blur-sm border border-card rounded-xl p-6 h-full hover:bg-card/80 transition-all duration-300 flex flex-col">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-20 border border-opacity-50 flex items-center justify-center group-hover:shadow-lg transition-all`}
                        style={{
                          borderColor: card.color.split(' ')[1] || '#00d9ff'
                        }}
                      >
                        <Icon className="w-6 h-6 text-white opacity-80 group-hover:opacity-100" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground flex-grow mb-4">{card.description}</p>
                    <Button
                      onClick={() => setSelectedType(card.id)}
                      className={`w-full bg-gradient-to-r ${card.color} hover:opacity-90 text-background font-semibold transition-all`}
                    >
                      Explore
                    </Button>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
