import { clsx } from 'clsx'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3 p-8 text-center', className)}>
      {icon && <div className="text-text-muted">{icon}</div>}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        {description && <p className="text-xs text-text-muted max-w-[280px]">{description}</p>}
      </div>
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
