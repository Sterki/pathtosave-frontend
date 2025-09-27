import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  color?: 'default' | 'success' | 'danger'
}

export function DashboardCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = 'default' 
}: DashboardCardProps) {
  const colorClasses = {
    default: 'text-primary',
    success: 'text-green-600',
    danger: 'text-red-600'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClasses[color]}`}>
          {value}
        </div>
        {trend && (
          <p className={`text-xs mt-1 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value} vs mes anterior
          </p>
        )}
      </CardContent>
    </Card>
  )
}