import { Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'

const columnStyles = {
  todo: { header: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' },
  inprogress: { header: 'bg-amber-50 border-amber-200', dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' },
  done: { header: 'bg-green-50 border-green-200', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
}

const KanbanColumn = ({ columnId, label, tasks, onAddTask, onTaskClick }) => {
  const style = columnStyles[columnId] || columnStyles.todo

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column Header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg border ${style.header} mb-1`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <span className="font-semibold text-gray-700 text-sm">{label}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(columnId)}
          className="p-1 rounded hover:bg-white/70 text-gray-500 hover:text-gray-700 transition-colors"
          title="Add task"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] rounded-b-lg p-2 space-y-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary-50/60' : 'bg-gray-100/50'
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-24 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                Drop tasks here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default KanbanColumn
