# Configuración de Autenticación con Supabase

Este documento explica cómo configurar y usar el sistema de autenticación implementado en la aplicación.

## Características Implementadas

### 1. Configuración de Supabase

- Cliente de Supabase configurado con las credenciales proporcionadas
- Soporte para variables de entorno para mayor seguridad

### 2. Contexto de Autenticación

- `AuthContext` que maneja el estado global de autenticación
- Hook `useAuth` para acceder a las funciones de autenticación
- Gestión automática de sesiones y tokens

### 3. Componentes de Autenticación

- Componente `Auth` con pestañas para login y registro
- Validación de formularios con mensajes de error
- Interfaz moderna usando shadcn/ui

### 4. Rutas Protegidas

- Componente `ProtectedRoute` que protege toda la aplicación
- Redirección automática a login si no hay usuario autenticado
- Pantalla de carga mientras se verifica la autenticación

### 5. Hook para API

- `useApi` que automáticamente incluye el token de autenticación
- Métodos helper para GET, POST, PUT, DELETE
- Manejo automático de headers de autorización

### 6. Header con Usuario

- Dropdown menu con información del usuario
- Botón de logout
- Avatar con iniciales del usuario

## Configuración

### Variables de Entorno (Opcional)

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://lbymifabqfndyxzynqla.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
VITE_API_URL=http://127.0.0.1:8000
```

### Credenciales de Supabase

Las credenciales están configuradas directamente en el código:

- **URL**: `https://lbymifabqfndyxzynqla.supabase.co`
- **Anon Key**: Configurada en `src/lib/supabase.ts`

## Uso

### Registro de Usuario

1. Los usuarios pueden registrarse usando email y contraseña
2. Se requiere confirmación por email (configurado en Supabase)
3. Contraseña mínima de 6 caracteres

### Inicio de Sesión

1. Los usuarios pueden iniciar sesión con email y contraseña
2. La sesión se mantiene automáticamente entre recargas
3. Token JWT se incluye automáticamente en todas las peticiones

### Peticiones API

```typescript
const api = useApi();

// GET request con token automático
const response = await api.get("/api/expense_resources");

// POST request con token automático
const response = await api.post("/api/expenses", { amount: 100 });
```

### Logout

- Disponible en el dropdown del header
- Limpia la sesión local y remota
- Redirige automáticamente al login

## Seguridad

### Row Level Security (RLS)

- Todas las tablas tienen RLS habilitado
- Los usuarios solo pueden acceder a sus propios datos
- Políticas configuradas en `docs/supabase.sql`

### Tokens JWT

- Tokens generados automáticamente por Supabase
- Incluidos automáticamente en todas las peticiones al backend
- Verificación automática de expiración

### Validación de Datos

- Validación de contraseñas en el frontend
- Validación de email en el frontend
- Validación adicional en el backend (recomendado)

## Estructura de Archivos

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticación
├── components/
│   ├── Auth.tsx                 # Componente de login/registro
│   ├── ProtectedRoute.tsx       # Componente de rutas protegidas
│   └── Header.tsx               # Header con logout
├── hooks/
│   └── useApi.ts                # Hook para peticiones API
└── lib/
    └── supabase.ts              # Configuración de Supabase
```

## Próximos Pasos

1. **Configurar el Backend**: Asegúrate de que tu backend FastAPI verifique los tokens JWT de Supabase
2. **Personalización**: Modifica los estilos y mensajes según tus necesidades
3. **Funcionalidades Adicionales**: Implementa recuperación de contraseña, cambio de perfil, etc.
4. **Testing**: Agrega tests para los componentes de autenticación

## Troubleshooting

### Error: "Invalid JWT"

- Verifica que las credenciales de Supabase sean correctas
- Asegúrate de que el backend esté configurado para verificar tokens de Supabase

### Error: "User not authenticated"

- Verifica que el usuario esté logueado
- Revisa la consola del navegador para errores de red

### Error: "Network request failed"

- Verifica que el backend esté corriendo
- Revisa la URL del backend en la configuración
