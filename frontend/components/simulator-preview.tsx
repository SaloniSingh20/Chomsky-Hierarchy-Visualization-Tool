'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Check, X } from 'lucide-react'

export default function SimulatorPreview() {
  const [testString, setTestString] = useState('101')
  const [result, setResult] = useState<'accepted' | 'rejected' | null>('accepted')

  const handleTest = () => {
    // Simulate result
    const isAccepted = Math.random() > 0.3
    setResult(isAccepted ? 'accepted' : 'rejected')
  }

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Try the Simulator</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Test your understanding with interactive string validation
          </p>
        </div>

        {/* Simulator card */}
        <div className="relative">
          {/* Gradient border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur opacity-75"></div>
          
          <Card className="relative bg-card/80 backdrop-blur-sm border border-cyan-500/40 rounded-2xl p-12">
            <div className="space-y-8">
              {/* Language selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Select Language Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'regular', label: 'Regular', color: 'from-pink-500/30' },
                    { id: 'cf', label: 'Context-Free', color: 'from-cyan-500/30' },
                    { id: 'cs', label: 'Context-Sensitive', color: 'from-blue-500/30' },
                    { id: 're', label: 'Recursively Enum.', color: 'from-purple-500/30' }
                  ].map(lang => (
                    <button
                      key={lang.id}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border border-muted transition-all ${lang.color} hover:shadow-lg hover:shadow-cyan-500/20`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input field */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Enter Test String</label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="e.g., 101, aabb, ()[]"
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    className="bg-background/50 border-muted focus:border-cyan-500 focus:ring-cyan-500 text-foreground placeholder:text-muted-foreground h-12 text-lg"
                  />
                  <Button
                    onClick={handleTest}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-background font-semibold h-12 px-8 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all whitespace-nowrap"
                  >
                    Test String
                  </Button>
                </div>
              </div>

              {/* Result display */}
              {result && (
                <div className={`p-6 rounded-xl border-2 transition-all ${
                  result === 'accepted'
                    ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20'
                    : 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/20'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      result === 'accepted' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {result === 'accepted' ? (
                        <Check className="w-6 h-6 text-green-400" />
                      ) : (
                        <X className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg">
                        {result === 'accepted' ? (
                          <span className="text-green-400">String Accepted ✓</span>
                        ) : (
                          <span className="text-red-400">String Rejected ✗</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result === 'accepted'
                          ? 'The string matches the grammar rules'
                          : 'The string does not conform to the language rules'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                Try different strings to understand how each language type accepts or rejects input. Experiment with various patterns to see which types can recognize them.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
