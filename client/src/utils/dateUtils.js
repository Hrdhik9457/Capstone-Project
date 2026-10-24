import { format, formatDistanceToNow, differenceInDays, isPast } from 'date-fns'

/**
 * Format a date as 'MMM dd, yyyy'
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return 'No date'
  try {
    return format(new Date(date), 'MMM dd, yyyy')
  } catch {
    return 'Invalid date'
  }
}

/**
 * Check if a task is overdue
 * @param {string|Date} dueDate
 * @param {string} status
 * @returns {boolean}
 */
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false
  return isPast(new Date(dueDate))
}

/**
 * Get relative time string (e.g. "3 days ago")
 * @param {string|Date} date
 * @returns {string}
 */
export const getRelativeTime = (date) => {
  if (!date) return ''
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return ''
  }
}

/**
 * Get number of days until due date
 * @param {string|Date} dueDate
 * @returns {number}
 */
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null
  return differenceInDays(new Date(dueDate), new Date())
}
