import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axiosInstance'
import ProjectCard from '../components/projects/ProjectCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ProjectsPage = () => {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (newProject) => api.post('/projects', newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully!')
      setModalOpen(false)
      setTitle('')
      setDescription('')
      setDeadline('')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create project')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return toast.error('Project title is required')
    createMutation.mutate({ title, description, deadline: deadline || undefined })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your ongoing projects</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started!</p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Plus size={18} />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <ProjectCard key={proj._id} project={proj} />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short overview of the project..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
