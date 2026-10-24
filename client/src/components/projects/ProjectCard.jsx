import { useNavigate } from 'react-router-dom'
import { Calendar, Users, CheckCircle2, Clock } from 'lucide-react'
import { formatDate, isOverdue } from '../../utils/dateUtils'

const statusStyles = {
  active: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-600',
}

const ProjectCard = ({ project, taskStats = {} }) => {
  const navigate = useNavigate()
  const { total = 0, done = 0 } = taskStats
  const progress = total > 0 ? Math.round((done / total) * 100) : 0
  const overdue = isOverdue(project.deadline, project.status === 'archived' ? 'done' : 'todo')

  const displayMembers = project.members?.slice(0, 3) || []
  const extraMembers = (project.members?.length || 0) - 3

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-primary-200 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-1">
          {project.title}
        </h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ml-2 flex-shrink-0 ${statusStyles[project.status]}`}>
          {project.status}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description}</p>
      )}

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span className="font-medium">{done}/{total} tasks</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        {/* Member avatars */}
        <div className="flex items-center">
          {displayMembers.map((m, i) => {
            const u = m.user || m
            return (
              <div
                key={u._id || i}
                className="w-7 h-7 rounded-full bg-primary-400 text-white flex items-center justify-center text-xs font-bold border-2 border-white"
                style={{ marginLeft: i > 0 ? '-8px' : 0 }}
                title={u.name}
              >
                {u.name?.charAt(0)?.toUpperCase()}
              </div>
            )
          })}
          {extraMembers > 0 && (
            <div
              className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold border-2 border-white"
              style={{ marginLeft: '-8px' }}
            >
              +{extraMembers}
            </div>
          )}
        </div>

        {/* Deadline */}
        {project.deadline && (
          <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
            <Calendar size={12} />
            <span>{formatDate(project.deadline)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectCard
