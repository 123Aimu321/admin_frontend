// components/dashboard/StatCard.tsx
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'; // Added purple and orange
  trend?: string;
  isLoading?: boolean;
}

export const StatCard = ({ title, value, icon, color, trend, isLoading }: StatCardProps) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  const bgColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
  };

  const iconColorClass = colorClasses[color] || 'text-blue-600';
  const iconBgClass = bgColorClasses[color] || 'bg-blue-100';

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
          ) : (
            <p className="text-3xl font-bold mt-2 text-gray-800">{value.toLocaleString()}</p>
          )}
          {trend && !isLoading && (
            <div className="flex items-center mt-1">
              {trend.includes('+') ? (
                <FiTrendingUp className="text-green-500 mr-1" />
              ) : trend.includes('-') ? (
                <FiTrendingDown className="text-red-500 mr-1" />
              ) : null}
              <p className={`text-sm ${trend.includes('+') ? 'text-green-600' : trend.includes('-') ? 'text-red-600' : 'text-gray-600'}`}>
                {trend}
              </p>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${iconBgClass}`}>
          <div className={iconColorClass}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};