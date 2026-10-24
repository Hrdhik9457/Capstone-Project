import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({ icon, label, value, color = 'bg-primary-100', trend }) => {
  const isPositive = trend > 0
  const isNegative = trend < 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`${color} p-3 rounded-lg flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? 0}</p>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 mt-1 text-xs font-medium ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp size={13} />
            ) : isNegative ? (
              <TrendingDown size={13} />
            ) : null}
            <span>{trend > 0 ? `+${trend}` : trend} from last week</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsCard
