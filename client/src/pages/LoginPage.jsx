import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axiosInstance'
import { useAuthStore } from '../store/authStore'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(
        { _id: data._id, name: data.name, email: data.email, role: data.role, avatar: data.avatar },
        data.token
      )
      toast.success(`Welcome back, ${data.name}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-3">
            <CheckSquare size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your workspace</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
