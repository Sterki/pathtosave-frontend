import { 
  Home, 
  PiggyBank, 
  Receipt, 
  Calendar,
  Settings,
  Menu
} from 'lucide-react'
import { Button } from './ui/button'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ activeTab, onTabChange, isOpen, onToggle }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'budgets', label: 'Presupuestos', icon: PiggyBank },
    { id: 'expenses', label: 'Gastos', icon: Receipt },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Mi Gestor</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => {
                  onTabChange(item.id)
                  if (window.innerWidth < 1024) onToggle()
                }}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}