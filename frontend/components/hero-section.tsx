'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Purple glow blob */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Cyan glow blob */}
        <div className="absolute bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Blue glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Visualize the Chomsky</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Hierarchy Classification</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Understand Regular, Context-Free, Context-Sensitive and Recursively Enumerable Languages interactively
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-background font-semibold h-12 px-8 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all group">
                <span>Explore Hierarchy</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 h-12 px-8 hover:border-cyan-400">
                Try Simulator
              </Button>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="relative h-96 lg:h-full flex items-center justify-center">
            <div className="relative w-full h-96">
              {/* Animated circles representing hierarchy */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Outermost circle - Type 0 */}
                <div className="absolute w-80 h-80 rounded-full border-2 border-purple-500/30 animate-spin" style={{ animationDuration: '20s' }}></div>
                
                {/* Type 1 */}
                <div className="absolute w-64 h-64 rounded-full border-2 border-cyan-500/40 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
                
                {/* Type 2 */}
                <div className="absolute w-48 h-48 rounded-full border-2 border-blue-500/50 animate-spin" style={{ animationDuration: '10s' }}></div>
                
                {/* Type 3 - innermost */}
                <div className="absolute w-32 h-32 rounded-full border-2 border-pink-500/60 flex items-center justify-center animate-pulse">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/50 to-purple-500/50 shadow-2xl shadow-cyan-500/50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
