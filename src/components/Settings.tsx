import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'

export function Settings() {
  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6">Configuración</h2>
      
      <div className="space-y-6">
        {/* Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder="Tu nombre" />
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tu@email.com" />
              </div>
            </div>
            <Button>Guardar cambios</Button>
          </CardContent>
        </Card>

        {/* Preferencias */}
        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Moneda</Label>
                <p className="text-sm text-muted-foreground">
                  Selecciona tu moneda preferida
                </p>
              </div>
              <Select defaultValue="usd">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="mxn">MXN ($)</SelectItem>
                  <SelectItem value="cop">COP ($)</SelectItem>
                </SelectContent>                
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir alertas cuando se exceda el presupuesto
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Tema oscuro</Label>
                <p className="text-sm text-muted-foreground">
                  Cambiar a modo oscuro
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Categorías personalizadas */}
        <Card>
          <CardHeader>
            <CardTitle>Categorías Personalizadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Nueva categoría" />
              <Button>Agregar</Button>
            </div>
            
            <div className="space-y-2">
              <Label>Categorías actuales:</Label>
              <div className="flex flex-wrap gap-2">
                {['Alimentación', 'Transporte', 'Entretenimiento', 'Servicios', 'Compras', 'Salud'].map((category) => (
                  <div key={category} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                    <span className="text-sm">{category}</span>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground">
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exportar datos */}
        <Card>
          <CardHeader>
            <CardTitle>Exportar Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Descarga todos tus datos de gastos y presupuestos
            </p>
            <div className="flex gap-2">
              <Button variant="outline">Exportar CSV</Button>
              <Button variant="outline">Exportar PDF</Button>
            </div>
          </CardContent>
        </Card>

        {/* Zona de peligro */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Eliminar todos los datos</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Esta acción eliminará permanentemente todos tus gastos, presupuestos y configuraciones.
              </p>
              <Button variant="destructive">Eliminar todos los datos</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}