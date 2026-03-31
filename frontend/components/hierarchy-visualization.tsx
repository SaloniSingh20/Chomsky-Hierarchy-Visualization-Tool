'use client'

import { useState } from 'react'

const hierarchyLevels = [
  {
    id: 'type0',
    name: 'Type 0',
    label: 'Recursively Enumerable',
    glowColor: '#a855f7',
    rgbColor: '168, 85, 247',
    radius: '200px',
    description: 'Recognized by Turing machines. The most general class - no restrictions on production rules.',
    examples: 'All languages that can be described by any formal system'
  },
  {
    id: 'type1',
    name: 'Type 1',
    label: 'Context-Sensitive',
    glowColor: '#3b82f6',
    rgbColor: '59, 130, 246',
    radius: '150px',
    description: 'Recognized by linear-bounded automata. Production rules depend on surrounding context.',
    examples: 'Moderately complex parsing tasks'
  },
  {
    id: 'type2',
    name: 'Type 2',
    label: 'Context-Free',
    glowColor: '#00d9ff',
    rgbColor: '0, 217, 255',
    radius: '100px',
    description: 'Recognized by pushdown automata. Forms the basis of programming language syntax.',
    examples: 'Most programming languages, arithmetic expressions'
  },
  {
    id: 'type3',
    name: 'Type 3',
    label: 'Regular',
    glowColor: '#ec4899',
    rgbColor: '236, 72, 153',
    radius: '50px',
    description: 'Recognized by finite automata. The simplest and most efficient to process.',
    examples: 'Pattern matching, regular expressions, simple patterns'
  }
]

type Tooltip = {
  x: number
  y: number
  level: (typeof hierarchyLevels)[0]
} | null

export default function HierarchyVisualization({
  selectedType,
  setSelectedType
}: {
  selectedType: string | null
  setSelectedType: (type: string | null) => void
}) {
  const [hoveredType, setHoveredType] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<Tooltip>(null)

  const handleCircleHover = (levelId: string, e: React.MouseEvent) => {
    setHoveredType(levelId)
    const level = hierarchyLevels.find(l => l.id === levelId)
    if (level) {
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        level
      })
    }
  }

  const handleCircleLeave = () => {
    setHoveredType(null)
    setTooltip(null)
  }

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-96 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-96 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">The Chomsky Hierarchy</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Hover over or click the circles to explore each language type
          </p>
        </div>

        {/* Interactive nested circles visualization */}
        <div className="flex justify-center items-center py-12">
          <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
            {/* Nested circles background */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500">
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Render circles from largest to smallest */}
              {[...hierarchyLevels].reverse().map((level) => {
                const isHovered = hoveredType === level.id
                const isSelected = selectedType === level.id
                const radiusValue = parseFloat(level.radius) / 2 // Convert to SVG units
                
                return (
                  <circle
                    key={level.id}
                    cx="250"
                    cy="250"
                    r={radiusValue}
                    fill="none"
                    stroke={level.glowColor}
                    strokeWidth={isHovered || isSelected ? 3 : 2}
                    opacity={isHovered || isSelected ? 0.8 : 0.4}
                    filter="url(#glow)"
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      filter: isHovered || isSelected ? `drop-shadow(0 0 20px ${level.glowColor})` : 'none'
                    }}
                  />
                )
              })}
            </svg>

            {/* Interactive circles as clickable elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              {hierarchyLevels.map((level) => {
                const isHovered = hoveredType === level.id
                const isSelected = selectedType === level.id
                
                return (
                  <div
                    key={level.id}
                    className="absolute flex items-center justify-center cursor-pointer transition-all duration-300"
                    style={{
                      width: level.radius,
                      height: level.radius,
                      borderRadius: '50%'
                    }}
                    onMouseEnter={(e) => handleCircleHover(level.id, e)}
                    onMouseLeave={handleCircleLeave}
                    onClick={() => setSelectedType(isSelected ? null : level.id)}
                  >
                    {/* Inner circle content - only visible for innermost types on hover/select */}
                    {(isHovered || isSelected) && (
                      <div className="text-center space-y-1 animate-in fade-in duration-200">
                        <h3 className="text-lg sm:text-xl font-bold text-white">{level.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{level.label}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Detailed information section */}
        {selectedType && (
          <div className="mt-16 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur opacity-50"></div>
            <div className="relative bg-card/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    <span style={{ color: hierarchyLevels.find(l => l.id === selectedType)?.glowColor }}>
                      {hierarchyLevels.find(l => l.id === selectedType)?.name}
                    </span>
                    <span className="text-muted-foreground"> - {hierarchyLevels.find(l => l.id === selectedType)?.label}</span>
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {hierarchyLevels.find(l => l.id === selectedType)?.description}
                </p>
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Examples: </span>
                    {hierarchyLevels.find(l => l.id === selectedType)?.examples}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="fixed bg-card/95 backdrop-blur border border-cyan-500/50 rounded-lg px-4 py-2 text-sm pointer-events-none z-50 max-w-xs"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y + 10}px`
          }}
        >
          <p className="font-semibold" style={{ color: tooltip.level.glowColor }}>
            {tooltip.level.name}
          </p>
          <p className="text-muted-foreground text-xs">{tooltip.level.label}</p>
        </div>
      )}
    </section>
  )
}
