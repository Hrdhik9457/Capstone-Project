import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-8xl font-bold text-primary-600">404</h1>
      <p className="text-2xl font-semibold text-gray-800 mt-4">Page not found</p>
      <p className="text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        <Home size={18} />
        Go back to Dashboard
      </Link>
    </div>
  </div>
)

export default NotFoundPage
