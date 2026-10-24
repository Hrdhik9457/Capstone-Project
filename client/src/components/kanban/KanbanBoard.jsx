import { useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axiosInstance'
import KanbanColumn from './KanbanColumn'
import TaskModal from '../tasks/TaskModal'
import LoadingSpinner from '../common/LoadingSpinner'

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-400' },
  { id: 'inprogress', label: 'In Progress', color: 'bg-amber-400' },
  { id: 'done', label: 'Done', color: 'bg-green-500' },
]

const KanbanBoard = ({ projectId, projectMembers = [] }) => {
  const queryClient = useQueryClient()
  const [taskModal, setTaskModal] = useState({ open: false, task: null, defaultStatus: 'todo' })

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => api.get(`/tasks/project/${projectId}`).then((r) => r.data),
    enabled: !!projectId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status, order }) =>
      api.patch(`/tasks/${taskId}/status`, { status, order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
    onError: () => {
      toast.error('Failed to update task status')
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const getColumnTasks = (status) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order)

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return

    const newStatus = destination.droppableId

    // Optimistic update
    queryClient.setQueryData(['tasks', projectId], (old) =>
      (old || []).map((t) =>
        t._id === draggableId
          ? { ...t, status: newStatus, order: destination.index }
          : t
      )
    )

    statusMutation.mutate({
      taskId: draggableId,
      status: newStatus,
      order: destination.index,
    })
  }

  if (isLoading) return <LoadingSpinner fullScreen={false} />

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              columnId={col.id}
              label={col.label}
              color={col.color}
              tasks={getColumnTasks(col.id)}
              onAddTask={(status) => setTaskModal({ open: true, task: null, defaultStatus: status })}
              onTaskClick={(task) => setTaskModal({ open: true, task, defaultStatus: task.status })}
            />
          ))}
        </div>
      </DragDropContext>

      {taskModal.open && (
        <TaskModal
          projectId={projectId}
          task={taskModal.task}
          defaultStatus={taskModal.defaultStatus}
          projectMembers={projectMembers}
          onClose={() => setTaskModal({ open: false, task: null, defaultStatus: 'todo' })}
        />
      )}
    </>
  )
}

export default KanbanBoard
