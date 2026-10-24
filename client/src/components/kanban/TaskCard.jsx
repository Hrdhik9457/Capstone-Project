import { Draggable } from '@hello-pangea/dnd'
import { Paperclip, Calendar } from 'lucide-react'
import { isOverdue, formatDate } from '../../utils/dateUtils'

const priorityStyles = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const TaskCard = ({ task, index, onClick }) => {
  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer
            hover:shadow-md hover:border-primary-200 transition-all select-none
            ${snapshot.isDragging ? 'shadow-lg rotate-1 border-primary-300' : ''}`}
        >
          {/* Priority badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                priorityStyles[task.priority] || priorityStyles.medium
              }`}
            >
              {task.priority}
            </span>
            {task.attachments?.length > 0 && (
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Paperclip size={12} />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{task.title}</h4>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            {/* Due date */}
            {task.dueDate ? (
              <div
                className={`flex items-center gap-1 text-xs ${
                  overdue ? 'text-red-500 font-semibold' : 'text-gray-400'
                }`}
              >
                <Calendar size={11} />
                <span>{formatDate(task.dueDate)}</span>
                {overdue && <span>(Overdue)</span>}
              </div>
            ) : (
              <span />
            )}

            {/* Assignee avatar */}
            {task.assignee && (
              <div
                className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
                title={task.assignee.name}
              >
                {task.assignee.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

export default TaskCard
