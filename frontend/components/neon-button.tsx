'use client'

import { motion } from 'framer-motion'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type NeonButtonProps = {
  children: ReactNode
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function NeonButton({ children, className, ...props }: NeonButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'neon-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
