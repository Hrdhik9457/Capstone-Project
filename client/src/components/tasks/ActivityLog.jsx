import { useQuery } from '@tanstack/react-query'
import { getRelativeTime } from '../../utils/dateUtils'
import api from '../../api/axiosInstance'

const ActivityLog = ({ taskId }) => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['task-activity', taskId],
    queryFn: () => api.get(`/tasks/${taskId}/activity`).then((r) => r.data),
    enabled: !!taskId,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-2.5 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        No activity yet.
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
      {activities.map((entry, index) => (
        <div key={entry._id} className="flex gap-3">
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            {entry.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          {/* Content + connector line */}
          <div className="flex-1 relative">
            {index < activities.length - 1 && (
              <div className="absolute left-[-18px] top-7 bottom-0 w-px bg-gray-200" />
            )}
            <p className="text-sm text-gray-800">
              <span className="font-medium">{entry.user?.name || 'Unknown'}</span>{' '}
              <span className="text-gray-600">{entry.action}</span>
            </p>
            {entry.details && (
              <p className="text-xs text-gray-500 mt-0.5">{entry.details}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{getRelativeTime(entry.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActivityLog
