import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PrivateRoute from './components/common/PrivateRoute'
import MainLayout from './components/common/MainLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '8px', fontSize: '14px' },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes wrapped in layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
