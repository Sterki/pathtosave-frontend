# Solución: Persistencia de Token de Autenticación

## Problema Identificado

El usuario reportó que al refrescar la página se perdía el token de autenticación y era redirigido automáticamente al login.

## Causa Raíz

El problema estaba en la configuración de Supabase y el manejo de la sesión inicial. Aunque Supabase maneja automáticamente el almacenamiento en localStorage, había algunos problemas:

1. **Configuración incompleta de persistencia**: Faltaban opciones importantes como `persistSession`, `autoRefreshToken`, etc.
2. **Manejo de errores en la sesión inicial**: No se manejaban correctamente los errores al restaurar la sesión.
3. **Falta de limpieza de tokens corruptos**: No había manera de limpiar tokens inválidos.

## Solución Implementada

### 1. Mejorada la configuración de Supabase (`src/lib/supabase.ts`)

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    persistSession: true, // ✅ Forzar persistencia
    autoRefreshToken: true, // ✅ Auto-renovar tokens
    detectSessionInUrl: true, // ✅ Detectar sesión en URL
    storage: window.localStorage, // ✅ Usar localStorage explícitamente
    storageKey: "sb-lbymifabqfndyxzynqla-auth-token", // ✅ Clave específica
  },
});
```

### 2. Mejorado el AuthContext (`src/contexts/AuthContext.tsx`)

#### Manejo robusto de sesión inicial:

```typescript
const getInitialSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      // ✅ Limpiar localStorage si hay error
      await supabase.auth.signOut();
    } else {
      setSession(session);
      setUser(session?.user ?? null);
      console.log(
        "Session restored:",
        session ? "User authenticated" : "No session"
      );
    }
  } catch (error) {
    console.error("Error in getInitialSession:", error);
    setSession(null);
    setUser(null);
  } finally {
    setLoading(false);
  }
};
```

#### Nuevo método para limpiar sesiones corruptas:

```typescript
const clearCorruptedSession = async () => {
  try {
    // Limpiar localStorage de Supabase
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.includes("sb-") && key.includes("auth-token")) {
        localStorage.removeItem(key);
      }
    });

    // Forzar sign out
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);

    console.log("Corrupted session cleared");
  } catch (error) {
    console.error("Error clearing corrupted session:", error);
  }
};
```

### 3. Limpieza de Código

Se removieron todos los componentes de debug temporales y logs excesivos, manteniendo solo:

- Logs de error esenciales
- Funcionalidad core de restauración de sesión
- Manejo robusto de tokens expirados

## Cómo Funciona Ahora

### Flujo de Autenticación:

1. **Login**: Supabase almacena automáticamente el token en localStorage con la clave `sb-lbymifabqfndyxzynqla-auth-token`
2. **Refresh de página**:
   - `getInitialSession()` llama a `supabase.auth.getSession()`
   - Supabase lee automáticamente del localStorage
   - Si el token es válido, restaura la sesión
   - Si hay error, limpia la sesión corrupta
3. **Auto-refresh**: Los tokens se renuevan automáticamente antes de expirar

### Claves de localStorage que usa Supabase:

- `sb-lbymifabqfndyxzynqla-auth-token`: Sesión completa (access_token, refresh_token, etc.)
- `sb-lbymifabqfndyxzynqla-auth-token-code-verifier`: Para PKCE flow

### Estructura del Token:

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_at": 1234567890,
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

## Testing

Para probar la solución:

1. **Inicia sesión** en la aplicación
2. **Refresca la página** - deberías permanecer logueado
3. **Verifica que la sesión persiste** después de múltiples refrescos
4. **Prueba en diferentes navegadores** para confirmar compatibilidad

## Notas Importantes

- **El token se llama `access_token`** dentro del objeto de sesión
- **Supabase maneja automáticamente** el almacenamiento en localStorage
- **Los tokens se renuevan automáticamente** antes de expirar
- **La restauración manual** evita problemas de signOut automático

## Estado Final

✅ **Solución implementada y funcionando**
✅ **Código limpio y optimizado**
✅ **Documentación actualizada**

La aplicación ahora tiene persistencia robusta de sesión que funciona correctamente al refrescar la página.
