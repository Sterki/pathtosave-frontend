import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarExpense {
  id: number
  date: string
  category: string
  description: string
  amount: number
}

const mockExpenses: CalendarExpense[] = [
  { id: 1, date: '2024-01-05', category: 'Alimentación', description: 'Supermercado', amount: 85.50 },
  { id: 2, date: '2024-01-10', category: 'Transporte', description: 'Uber', amount: 12.30 },
  { id: 3, date: '2024-01-15', category: 'Entretenimiento', description: 'Cinema', amount: 25.00 },
  { id: 4, date: '2024-01-20', category: 'Servicios', description: 'Internet', amount: 45.00 },
  { id: 5, date: '2024-01-25', category: 'Compras', description: 'Ropa', amount: 120.00 },
]

export function ExpenseCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDate(null)
  }

  const getExpensesForDate = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return mockExpenses.filter(expense => expense.date === dateString)
  }

  const getTotalForDate = (day: number) => {
    const expenses = getExpensesForDate(day)
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const handleDateClick = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(selectedDate === dateString ? null : dateString)
  }

  const selectedDateExpenses = selectedDate ? mockExpenses.filter(expense => expense.date === selectedDate) : []

  // Generate calendar grid
  const calendarDays = []
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Calendario de Gastos</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{monthNames[month]} {year}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="aspect-square p-1" />
                  }
                  
                  const hasExpenses = getExpensesForDate(day).length > 0
                  const total = getTotalForDate(day)
                  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const isSelected = selectedDate === dateString
                  const isToday = new Date().toISOString().split('T')[0] === dateString
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`
                        aspect-square p-1 rounded-lg text-sm border-2 transition-colors
                        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-muted'}
                        ${isToday ? 'bg-blue-100 font-semibold' : ''}
                        ${hasExpenses ? 'bg-red-50 text-red-700' : ''}
                      `}
                    >
                      <div className="h-full flex flex-col justify-between">
                        <span>{day}</span>
                        {hasExpenses && (
                          <span className="text-xs">
                            ${total.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? `Gastos del ${new Date(selectedDate).toLocaleDateString('es-ES')}`
                  : 'Selecciona un día'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  {selectedDateExpenses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No hay gastos registrados en esta fecha
                    </p>
                  ) : (
                    <>
                      {selectedDateExpenses.map(expense => (
                        <div 
                          key={expense.id}
                          className="p-3 bg-muted rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium">{expense.description}</p>
                            <p className="font-semibold text-red-600">
                              ${expense.amount}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {expense.category}
                          </p>
                        </div>
                      ))}
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total del día:</span>
                          <span className="font-bold text-red-600">
                            ${selectedDateExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Haz clic en un día del calendario para ver los gastos registrados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}