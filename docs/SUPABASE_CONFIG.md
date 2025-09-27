# Configuración de Supabase para Autenticación

## Pasos para configurar correctamente la autenticación en Supabase

### 1. Configurar Site URL y Redirect URLs

En el dashboard de Supabase:

1. Ve a **Authentication** > **URL Configuration**
2. Configura las siguientes URLs:

**Site URL:**

```
http://localhost:3000
```

**Redirect URLs (agregar todas estas):**

```
http://localhost:3000
http://localhost:3000/
http://localhost:3000/auth/callback
http://localhost:3000/#auth/callback
```

### 2. Configurar Plantillas de Email

En **Authentication** > **Email Templates**:

#### Confirm Signup Template

```html
<h2>Confirma tu email para activar tu cuenta</h2>
<p>Haz clic en el siguiente enlace para confirmar tu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
<p>
  Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:
</p>
<p>{{ .ConfirmationURL }}</p>
```

### 3. Configurar Políticas de Confirmación

En **Authentication** > **Settings**:

- **Enable email confirmations**: ✅ Activado
- **Secure email change**: ✅ Activado (opcional)
- **Enable phone confirmations**: ❌ Desactivado (si no usas teléfono)

### 4. Configurar Email Provider

En **Authentication** > **Email**:

- Configura tu proveedor de email (SMTP) o usa el servicio por defecto de Supabase
- Para desarrollo, puedes usar el servicio por defecto

### 5. Verificar Configuración de RLS

Asegúrate de que las políticas RLS estén configuradas correctamente ejecutando el archivo `docs/supabase.sql` en tu base de datos.

### 6. Probar el Flujo

1. **Registro**: Crea una nueva cuenta
2. **Email**: Revisa tu email y haz clic en el enlace de confirmación
3. **Login**: Intenta iniciar sesión después de confirmar el email

### 7. Troubleshooting

#### Error: "Email link is invalid or has expired"

- Verifica que las Redirect URLs estén configuradas correctamente
- Asegúrate de que la Site URL coincida con tu aplicación local

#### Error: "Email not confirmed"

- Verifica que el usuario haya hecho clic en el enlace de confirmación
- Revisa que la plantilla de email esté configurada correctamente
- Usa el botón "Reenviar email de confirmación" en la aplicación

#### El email no llega

- Revisa la carpeta de spam
- Verifica la configuración del proveedor de email
- Para desarrollo, revisa los logs de Supabase

### 8. URLs Importantes

- **Dashboard de Supabase**: https://supabase.com/dashboard
- **Tu proyecto**: https://supabase.com/dashboard/project/lbymifabqfndyxzynqla
- **Authentication Settings**: https://supabase.com/dashboard/project/lbymifabqfndyxzynqla/auth/settings

### 9. Configuración para Producción

Cuando despliegues a producción:

1. Cambia la Site URL a tu dominio de producción
2. Actualiza las Redirect URLs con tu dominio de producción
3. Configura un proveedor de email profesional (SendGrid, Mailgun, etc.)
4. Actualiza las variables de entorno en tu aplicación de producción

```env
VITE_SUPABASE_URL=https://lbymifabqfndyxzynqla.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
VITE_API_URL=https://tu-api-de-produccion.com
```
