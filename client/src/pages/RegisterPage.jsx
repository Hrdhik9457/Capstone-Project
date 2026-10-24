import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axiosInstance'
import { useAuthStore } from '../store/authStore'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      login(
        { _id: data._id, name: data.name, email: data.email, role: data.role, avatar: data.avatar },
        data.token
      )
      toast.success(`Welcome to TaskFlow, ${data.name}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3">
            <CheckSquare size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Start managing your projects today</p>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.password ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.confirmPassword ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
