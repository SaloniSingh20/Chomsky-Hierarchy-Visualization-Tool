import { LoaderCircle } from 'lucide-react'

export default function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 text-muted-foreground">
      <LoaderCircle className="h-5 w-5 animate-spin text-cyan-300" />
      <span>{label}</span>
    </div>
  )
}
