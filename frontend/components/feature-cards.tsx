'use client'

import { Card } from '@/components/ui/card'
import { Zap, Layers, Scale } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Interactive Hierarchy',
    description: 'Explore the nested levels of the Chomsky Hierarchy with smooth animations and real-time interactions.'
  },
  {
    icon: Layers,
    title: 'String Simulator',
    description: 'Test strings against different automaton types and see real-time acceptance/rejection results.'
  },
  {
    icon: Scale,
    title: 'Concept Comparison',
    description: 'Compare language types side-by-side to understand their differences and relationships.'
  }
]

export default function FeatureCards() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Powerful Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to master the theory of computation
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Gradient border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 to-purple-500/50 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                
                <Card className="relative bg-card/50 backdrop-blur-sm border-glow rounded-2xl p-8 h-full hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-400/50 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                        <Icon className="w-7 h-7 text-cyan-400 group-hover:text-cyan-300" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground flex-grow">{feature.description}</p>
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
