import { useQuery } from '@tanstack/react-query'
import { FolderKanban, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import api from '../api/axiosInstance'
import { useAuthStore } from '../store/authStore'
import StatsCard from '../components/dashboard/StatsCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/dateUtils'

const DashboardPage = () => {
  const { user } = useAuthStore()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
  })

  if (isLoading) return <LoadingSpinner />

  const totalProjects = stats?.totalProjects || 0
  const totalTasks = stats?.totalTasks || 0
  const completedTasks = stats?.completedTasks || 0
  const overdueTasks = stats?.overdueTasks || 0

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
        <p className="text-sm text-gray-500 mt-1">
          Here is an overview of your projects and task progress.
        </p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<FolderKanban className="text-indigo-600" size={24} />}
          label="Total Projects"
          value={totalProjects}
          color="bg-indigo-50"
        />
        <StatsCard
          icon={<Clock className="text-blue-600" size={24} />}
          label="Total Tasks"
          value={totalTasks}
          color="bg-blue-50"
        />
        <StatsCard
          icon={<CheckCircle2 className="text-green-600" size={24} />}
          label="Completed Tasks"
          value={completedTasks}
          color="bg-green-50"
        />
        <StatsCard
          icon={<AlertCircle className="text-red-500" size={24} />}
          label="Overdue Tasks"
          value={overdueTasks}
          color="bg-red-50"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {stats.recentActivity.map((activity) => (
              <li key={activity._id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800">{activity.user?.name || 'Someone'}</span>
                  <span className="text-gray-600 text-sm ml-2">{activity.action}: {activity.details}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(activity.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No recent activity found. Start by creating a project!</p>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
