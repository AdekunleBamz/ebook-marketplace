'use client'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ 
  icon = '📭', 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-7xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-amber-500 hover:from-teal-500 hover:to-amber-400 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-teal-900/50"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
