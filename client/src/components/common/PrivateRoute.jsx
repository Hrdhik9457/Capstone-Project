import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const PrivateRoute = () => {
  const { isAuthenticated, token } = useAuthStore()
  return isAuthenticated || token ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoute
