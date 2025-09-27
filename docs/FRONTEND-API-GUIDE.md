# 🚀 Guía Completa para Frontend - Expenses Backend API

## 📋 Información General

**Base URL:** `http://127.0.0.1:8000`  
**Autenticación:** JWT Token de Supabase  
**Formato:** JSON

## 🔐 Autenticación

### Obtener Token JWT de Supabase

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://tu-proyecto.supabase.co", "tu-anon-key");

// Login
const { data, error } = await supabase.auth.signInWithPassword({
    email: "usuario@ejemplo.com",
    password: "password123",
});

// Obtener token
const token = data.session?.access_token;
```

### Header para todas las peticiones

```javascript
const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
};
```

## 🚀 ENDPOINTS COMPLETOS

### 📊 DASHBOARD & ESTADÍSTICAS

#### Resumen General

```javascript
GET /api/v1/dashboard/summary

// Respuesta esperada:
{
  "totalIncome": 1500.00,
  "totalExpenses": 800.50,
  "availableBalance": 699.50,
  "budgetsActive": 3,
  "expensesThisMonth": 25,
  "categoriesWithBudget": ["Comida", "Transporte"]
}
```

#### Gastos Diarios

```javascript
GET /api/v1/dashboard/daily-spend

// Respuesta esperada:
{
  "dailySpending": [
    { "date": "2024-01-15", "amount": 45.50 },
    { "date": "2024-01-14", "amount": 32.00 },
    { "date": "2024-01-13", "amount": 28.75 }
  ],
  "averageDaily": 35.42,
  "totalThisWeek": 247.94
}
```

#### Gastos por Categoría

```javascript
GET /api/v1/dashboard/expenses/by-category

// Respuesta esperada:
{
  "expensesByCategory": [
    {
      "categoryId": "uuid-comida",
      "categoryName": "Comida",
      "totalAmount": 320.50,
      "expenseCount": 15,
      "percentage": 40.2
    },
    {
      "categoryId": "uuid-transporte",
      "categoryName": "Transporte",
      "totalAmount": 180.00,
      "expenseCount": 8,
      "percentage": 22.6
    }
  ]
}
```

### 💰 GASTOS (Expenses)

#### Listar Todos los Gastos

```javascript
GET /api/expense_resources

// Con filtros:
GET /api/expense_resources?categoryId=uuid-categoria
GET /api/expense_resources?minAmount=10
GET /api/expense_resources?maxAmount=100

// Respuesta:
{
  "@context": "/api/contexts/ExpenseResource",
  "@type": "Collection",
  "totalItems": 15,
  "member": [
    {
      "@id": "/api/expense_resources/uuid-expense",
      "@type": "ExpenseResource",
      "id": "uuid-expense",
      "amount": 25.50,
      "description": "Almuerzo en restaurante",
      "occurredAt": "2024-01-15T12:00:00+00:00",
      "merchant": "Restaurante El Buen Sabor",
      "paymentMethod": "tarjeta",
      "receiptUrl": null,
      "categoryId": "uuid-comida",
      "budgetId": "uuid-budget"
    }
  ]
}
```

#### Crear Gasto

```javascript
POST /api/expense_resources

// Body:
{
  "amount": 25.50,
  "description": "Almuerzo en restaurante",
  "occurredAt": "2024-01-15T12:00:00Z",
  "merchant": "Restaurante El Buen Sabor",
  "paymentMethod": "tarjeta",
  "receiptUrl": "https://ejemplo.com/receipt.jpg",
  "categoryId": "uuid-categoria-comida"
}

// Respuesta: 201 Created con el gasto creado
```

#### Obtener Gasto Específico

```javascript
GET / api / expense_resources / { id };

// Respuesta: Objeto ExpenseResource completo
```

#### Actualizar Gasto

```javascript
PUT /api/expense_resources/{id}     // Actualización completa
PATCH /api/expense_resources/{id}   // Actualización parcial

// Body (PATCH):
{
  "amount": 30.00,
  "description": "Almuerzo actualizado"
}

// Respuesta: 200 OK con el gasto actualizado
```

#### Eliminar Gasto

```javascript
DELETE / api / expense_resources / { id };

// Respuesta: 204 No Content
```

### 💵 INGRESOS (Income)

#### Listar Todos los Ingresos

```javascript
GET /api/income_resources

// Con filtros:
GET /api/income_resources?categoryId=uuid-categoria
GET /api/income_resources?minAmount=100
GET /api/income_resources?maxAmount=5000

// Respuesta similar a expenses pero con campos de Income
```

#### Crear Ingreso

```javascript
POST /api/income_resources

// Body:
{
  "amount": 1500.00,
  "description": "Salario mensual",
  "occurredAt": "2024-01-01T00:00:00Z",
  "source": "Empresa ABC",
  "categoryId": "uuid-categoria-salario"
}

// Respuesta: 201 Created
```

#### Operaciones CRUD Ingresos

```javascript
GET / api / income_resources / { id }; // Obtener
PUT / api / income_resources / { id }; // Actualizar completo
PATCH / api / income_resources / { id }; // Actualizar parcial
DELETE / api / income_resources / { id }; // Eliminar
```

### 📋 PRESUPUESTOS (Budgets)

#### Listar Todos los Presupuestos

```javascript
GET /api/budget_resources

// Respuesta:
{
  "member": [
    {
      "id": "uuid-budget",
      "name": "Presupuesto Comida Enero",
      "amount": 300.00,
      "currency": "USD",
      "period": "monthly",
      "periodStart": "2024-01-01T00:00:00+00:00",
      "periodEnd": "2024-01-31T23:59:59+00:00",
      "isActive": true,
      "categoryId": "uuid-comida",
      "spentAmount": 180.50,
      "remainingAmount": 119.50
    }
  ]
}
```

#### Crear Presupuesto

```javascript
POST /api/budget_resources

// Body:
{
  "name": "Presupuesto Comida Enero",
  "amount": 300.00,
  "currency": "USD",
  "period": "monthly",
  "periodStart": "2024-01-01T00:00:00Z",
  "periodEnd": "2024-01-31T23:59:59Z",
  "categoryId": "uuid-categoria-comida"
}

// Respuesta: 201 Created
```

#### Estado de Presupuestos

```javascript
GET /api/v1/budgets/status

// Respuesta:
{
  "budgets": [
    {
      "id": "uuid-budget",
      "name": "Presupuesto Comida",
      "amount": 300.00,
      "spent": 180.50,
      "remaining": 119.50,
      "percentage": 60.17,
      "status": "warning", // "ok", "warning", "danger"
      "daysRemaining": 15
    }
  ],
  "summary": {
    "totalBudgets": 5,
    "totalAmount": 1500.00,
    "totalSpent": 800.50,
    "totalRemaining": 699.50
  }
}
```

#### Verificar si Gasto Excede Presupuesto

```javascript
POST /api/v1/budgets/check-expense

// Body:
{
  "categoryId": "uuid-categoria-comida",
  "amount": 50.00
}

// Respuesta:
{
  "canSpend": true,
  "budgetId": "uuid-budget",
  "remainingAmount": 119.50,
  "wouldExceed": false,
  "message": "Puedes realizar este gasto"
}
```

#### Crear Presupuesto con Validaciones

```javascript
POST /api/v1/budgets/create

// Body:
{
  "name": "Presupuesto Transporte",
  "amount": 200.00,
  "categoryId": "uuid-transporte",
  "period": "monthly"
}

// Respuesta: 201 Created o 400 Bad Request si hay conflictos
```

### 🏷️ CATEGORÍAS (Categories)

#### Listar Todas las Categorías

```javascript
GET /api/category_resources

// Respuesta:
{
  "member": [
    {
      "id": "uuid-comida",
      "name": "Comida",
      "description": "Gastos relacionados con alimentación",
      "color": "#FF6B6B",
      "icon": "🍽️",
      "isDefault": true
    },
    {
      "id": "uuid-transporte",
      "name": "Transporte",
      "description": "Gastos de transporte público y privado",
      "color": "#4ECDC4",
      "icon": "🚗",
      "isDefault": true
    }
  ]
}
```

#### Crear Categoría

```javascript
POST /api/category_resources

// Body:
{
  "name": "Entretenimiento",
  "description": "Gastos de entretenimiento y ocio",
  "color": "#45B7D1",
  "icon": "🎬"
}

// Respuesta: 201 Created
```

### 👤 PERFIL DE USUARIO (Profile)

#### Obtener Perfil

```javascript
GET /api/profile_resources

// Respuesta:
{
  "id": "uuid-profile",
  "userId": "ea65668c-5d6a-4465-8d0b-10b1a21fc03d",
  "firstName": "Alex",
  "lastName": "Rodriguez",
  "email": "alex.rodriguez.vera@gmail.com",
  "phone": "+1234567890",
  "currency": "USD",
  "timezone": "America/New_York",
  "createdAt": "2024-01-01T00:00:00+00:00",
  "updatedAt": "2024-01-15T12:00:00+00:00"
}
```

#### Actualizar Perfil

```javascript
PUT /api/profile_resources    // Actualización completa
PATCH /api/profile_resources  // Actualización parcial

// Body (PATCH):
{
  "firstName": "Alejandro",
  "phone": "+1234567891"
}

// Respuesta: 200 OK
```

## 🔧 UTILIDADES

### Documentación Interactiva

```javascript
GET / api / docs;
// Abre la documentación Swagger/OpenAPI en el navegador
```

### Webhook (Solo para desarrollo)

```javascript
POST / webhook / supabase;
// Webhook para crear usuarios automáticamente desde Supabase
```

## 📱 EJEMPLOS DE IMPLEMENTACIÓN

### Clase de Servicio API (JavaScript)

```javascript
class ExpensesAPI {
    constructor(baseURL, token) {
        this.baseURL = baseURL;
        this.token = token;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Dashboard
    async getDashboardSummary() {
        return this.request("/api/v1/dashboard/summary");
    }

    async getDailySpend() {
        return this.request("/api/v1/dashboard/daily-spend");
    }

    async getExpensesByCategory() {
        return this.request("/api/v1/dashboard/expenses/by-category");
    }

    // Gastos
    async getExpenses(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/api/expense_resources?${params}`);
    }

    async createExpense(expense) {
        return this.request("/api/expense_resources", {
            method: "POST",
            body: JSON.stringify(expense),
        });
    }

    async updateExpense(id, expense) {
        return this.request(`/api/expense_resources/${id}`, {
            method: "PATCH",
            body: JSON.stringify(expense),
        });
    }

    async deleteExpense(id) {
        return this.request(`/api/expense_resources/${id}`, {
            method: "DELETE",
        });
    }

    // Ingresos
    async getIncomes(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/api/income_resources?${params}`);
    }

    async createIncome(income) {
        return this.request("/api/income_resources", {
            method: "POST",
            body: JSON.stringify(income),
        });
    }

    // Presupuestos
    async getBudgets() {
        return this.request("/api/budget_resources");
    }

    async createBudget(budget) {
        return this.request("/api/budget_resources", {
            method: "POST",
            body: JSON.stringify(budget),
        });
    }

    async getBudgetStatus() {
        return this.request("/api/v1/budgets/status");
    }

    async checkExpenseAgainstBudget(categoryId, amount) {
        return this.request("/api/v1/budgets/check-expense", {
            method: "POST",
            body: JSON.stringify({ categoryId, amount }),
        });
    }

    // Categorías
    async getCategories() {
        return this.request("/api/category_resources");
    }

    async createCategory(category) {
        return this.request("/api/category_resources", {
            method: "POST",
            body: JSON.stringify(category),
        });
    }

    // Perfil
    async getProfile() {
        return this.request("/api/profile_resources");
    }

    async updateProfile(profile) {
        return this.request("/api/profile_resources", {
            method: "PATCH",
            body: JSON.stringify(profile),
        });
    }
}

// Uso:
const api = new ExpensesAPI("http://127.0.0.1:8000", token);

// Obtener resumen del dashboard
const summary = await api.getDashboardSummary();

// Crear un gasto
const newExpense = await api.createExpense({
    amount: 25.5,
    description: "Almuerzo",
    occurredAt: new Date().toISOString(),
    merchant: "Restaurante ABC",
    paymentMethod: "tarjeta",
    categoryId: "uuid-categoria-comida",
});
```

### Ejemplo con React Hooks

```javascript
import { useState, useEffect } from "react";

function useExpensesAPI(token) {
    const [api] = useState(
        () => new ExpensesAPI("http://127.0.0.1:8000", token)
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (apiCall) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiCall();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        api,
        loading,
        error,
        execute,
    };
}

// Componente de ejemplo
function ExpensesList({ token }) {
    const { api, loading, error, execute } = useExpensesAPI(token);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        execute(async () => {
            const data = await api.getExpenses();
            setExpenses(data.member);
        });
    }, []);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Gastos</h2>
            {expenses.map((expense) => (
                <div key={expense.id}>
                    <h3>{expense.description}</h3>
                    <p>${expense.amount}</p>
                    <p>{new Date(expense.occurredAt).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );
}
```

## 🚨 CÓDIGOS DE ERROR COMUNES

-   **401 Unauthorized**: Token JWT inválido o expirado
-   **403 Forbidden**: No tienes permisos para acceder al recurso
-   **404 Not Found**: Recurso no encontrado
-   **400 Bad Request**: Datos enviados incorrectos
-   **422 Unprocessable Entity**: Validación fallida

## 📝 NOTAS IMPORTANTES

1. **Todos los endpoints requieren autenticación** excepto `/api/docs`
2. **Los UUIDs** son strings, no números
3. **Las fechas** deben estar en formato ISO 8601
4. **Los montos** son números decimales (ej: 25.50)
5. **CORS** está configurado para localhost y 127.0.0.1
6. **La paginación** está habilitada por defecto (página 1, 30 items)

## 🎯 PRÓXIMOS PASOS

1. Configura Supabase en tu frontend
2. Implementa la autenticación
3. Crea los componentes para cada entidad
4. Implementa el dashboard con gráficos
5. Añade validaciones y manejo de errores

¡Con esta guía tienes todo lo necesario para implementar tu frontend completo! 🚀
