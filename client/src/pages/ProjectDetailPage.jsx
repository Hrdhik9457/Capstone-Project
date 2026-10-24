import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, UserPlus, Calendar, Clock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axiosInstance'
import KanbanBoard from '../components/kanban/KanbanBoard'
import TaskModal from '../components/tasks/TaskModal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/dateUtils'

const ProjectDetailPage = () => {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [memberModalOpen, setMemberModalOpen] = useState(false)

  // Fetch project details
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then((r) => r.data),
    enabled: !!projectId,
  })

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (email) => api.post(`/projects/${projectId}/members`, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success('Member added successfully!')
      setMemberEmail('')
      setMemberModalOpen(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add member')
    },
  })

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: () => api.delete(`/projects/${projectId}`),
    onSuccess: () => {
      toast.success('Project deleted')
      navigate('/projects')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete project')
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found or you don't have access.</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 text-indigo-600 font-medium hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>
      </div>
    )
  }

  const handleAddMember = (e) => {
    e.preventDefault()
    if (!memberEmail.trim()) return
    addMemberMutation.mutate(memberEmail.trim())
  }

  return (
    <div className="space-y-6">
      {/* Back button & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 font-medium transition"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMemberModalOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <UserPlus size={16} />
            <span>Invite Member</span>
          </button>

          <button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this project?')) {
                deleteProjectMutation.mutate()
              }
            }}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
            title="Delete Project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Project Header Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <span className="text-xs uppercase tracking-wide font-semibold px-2.5 py-1 bg-green-100 text-green-700 rounded-full w-fit">
            {project.status}
          </span>
        </div>
        {project.description && (
          <p className="text-sm text-gray-600 mb-4 max-w-3xl">{project.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
          {project.deadline && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span>Deadline: {formatDate(project.deadline)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-gray-400" />
            <span>Created {formatDate(project.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-700">{project.members?.length || 1}</span>
            <span>team members</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Board</h2>
        <KanbanBoard projectId={projectId} projectMembers={project.members || []} />
      </div>

      {/* Add Task Modal */}
      {taskModalOpen && (
        <TaskModal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          projectId={projectId}
          projectMembers={project.members || []}
        />
      )}

      {/* Add Member Modal */}
      {memberModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
            <h3 className="text-base font-bold text-gray-900 mb-2">Invite Team Member</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter the registered email of the user to add them to this project.
            </p>
            <form onSubmit={handleAddMember} className="space-y-4">
              <input
                type="email"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMemberMutation.isPending}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {addMemberMutation.isPending ? 'Inviting...' : 'Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetailPage
