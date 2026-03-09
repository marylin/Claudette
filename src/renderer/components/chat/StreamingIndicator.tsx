import { Bot } from 'lucide-react'

export function StreamingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex gap-2">
        <div className="w-6 h-6 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
          <Bot className="w-3.5 h-3.5 text-text-secondary" />
        </div>
        <div className="bg-bg-surface border border-border rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-soft" />
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-soft [animation-delay:300ms]" />
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-soft [animation-delay:600ms]" />
          </div>
        </div>
      </div>
    </div>
  )
}
