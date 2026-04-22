'use client'

import { useEffect } from 'react'

export default function TopicsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Topics list error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Topics page error</h2>
        <p className="text-gray-400 mb-6">
          {error.message || 'Failed to load topics list.'}
        </p>
        {error.digest && (
          <p className="text-gray-500 text-sm mb-6">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
