const LoadingSpinner = ({ fullScreen = true }) => {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  )
}

export default LoadingSpinner
