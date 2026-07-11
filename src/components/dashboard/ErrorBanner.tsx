'use client'

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="bg-error-container border border-error/20 rounded-lg p-sm flex items-center justify-between gap-sm">
      <div className="flex items-center gap-xs">
        <span className="material-symbols-outlined text-error text-[20px]">
          error
        </span>
        <p className="text-on-error-container text-label-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-sm py-xs bg-error text-on-error text-label-md font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      )}
    </div>
  )
}
