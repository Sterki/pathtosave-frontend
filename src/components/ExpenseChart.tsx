import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface ExpenseData {
  name: string
  value: number
}

interface WeeklyData {
  week: string
  gastos: number
}

interface ExpenseChartProps {
  type: 'pie' | 'bar'
  data: ExpenseData[] | WeeklyData[]
  title: string
}

export function ExpenseChart({ type, data, title }: ExpenseChartProps) {
  if (type === 'pie') {
    const pieData = data as ExpenseData[]
    return (
      <div className="h-80">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`$${value}`, 'Monto']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const barData = data as WeeklyData[]
  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${value}`, 'Gastos']} />
          <Bar dataKey="gastos" fill="#0088FE" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}