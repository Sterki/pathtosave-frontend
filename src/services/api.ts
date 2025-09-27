import React from 'react'
import { useAuth } from '../contexts/AuthContext'

// Tipos basados en la documentación de la API
export interface ExpenseResource {
  '@id': string
  '@type': string
  id: string
  amount: number
  description: string
  occurredAt: string
  merchant?: string
  paymentMethod?: string
  receiptUrl?: string
  categoryId?: string
  budgetId?: string
}

export interface IncomeResource {
  '@id': string
  '@type': string
  id: string
  amount: number
  description: string
  occurredAt: string
  source?: string
  categoryId?: string
}

export interface BudgetResource {
  '@id': string
  '@type': string
  id: string
  name: string
  amount: number
  currency: string
  period: string
  periodStart: string
  periodEnd: string
  isActive: boolean
  categoryId?: string
  spentAmount?: number
  remainingAmount?: number
}

export interface CategoryResource {
  '@id': string
  '@type': string
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  isDefault?: boolean
}

export interface ProfileResource {
  id: string
  userId: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  currency: string
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  availableBalance: number
  budgetsActive: number
  expensesThisMonth: number
  categoriesWithBudget: string[]
}

export interface DailySpend {
  dailySpending: Array<{
    date: string
    amount: number
  }>
  averageDaily: number
  totalThisWeek: number
}

export interface ExpensesByCategory {
  expensesByCategory: Array<{
    categoryId: string
    categoryName: string
    totalAmount: number
    expenseCount: number
    percentage: number
  }>
}

export interface BudgetStatus {
  budgets: Array<{
    id: string
    name: string
    amount: number
    spent: number
    remaining: number
    percentage: number
    status: 'ok' | 'warning' | 'danger'
    daysRemaining: number
  }>
  summary: {
    totalBudgets: number
    totalAmount: number
    totalSpent: number
    totalRemaining: number
  }
}

export interface BudgetCheckResult {
  canSpend: boolean
  budgetId?: string
  remainingAmount?: number
  wouldExceed: boolean
  message: string
}

// Clase principal del servicio API
export class ExpensesAPI {
  private baseURL: string
  private getToken: () => string | null

  constructor(baseURL: string, getToken: () => string | null) {
    this.baseURL = baseURL
    this.getToken = getToken
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    // Si la respuesta está vacía (como en DELETE), no intentar parsear JSON
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T
    }

    return response.json()
  }

  // Dashboard endpoints
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await this.request<DashboardSummary>('/api/v1/dashboard/summary')
      console.log('Dashboard summary response:', response)
      return response
    } catch (error) {
      console.error('Error in getDashboardSummary:', error)
      // Retornar estructura por defecto si hay error
      return {
        totalIncome: 0,
        totalExpenses: 0,
        availableBalance: 0,
        budgetsActive: 0,
        expensesThisMonth: 0,
        categoriesWithBudget: []
      }
    }
  }

  async getDailySpend(): Promise<DailySpend> {
    try {
      const response = await this.request<DailySpend>('/api/v1/dashboard/daily-spend')
      console.log('Daily spend response:', response)
      return response
    } catch (error) {
      console.error('Error in getDailySpend:', error)
      // Retornar estructura por defecto si hay error
      return {
        dailySpending: [],
        averageDaily: 0,
        totalThisWeek: 0
      }
    }
  }

  async getExpensesByCategory(): Promise<ExpensesByCategory> {
    try {
      const response = await this.request<ExpensesByCategory>('/api/v1/dashboard/expenses/by-category')
      console.log('Expenses by category response:', response)
      return response
    } catch (error) {
      console.error('Error in getExpensesByCategory:', error)
      // Retornar estructura por defecto si hay error
      return {
        expensesByCategory: []
      }
    }
  }

  // Expense endpoints
  async getExpenses(filters: Record<string, string> = {}): Promise<{ member: ExpenseResource[]; totalItems: number }> {
    const params = new URLSearchParams(filters)
    return this.request<{ member: ExpenseResource[]; totalItems: number }>(`/api/expense_resources?${params}`)
  }

  async getExpense(id: string): Promise<ExpenseResource> {
    return this.request<ExpenseResource>(`/api/expense_resources/${id}`)
  }

  async createExpense(expense: Omit<ExpenseResource, 'id' | '@id' | '@type'>): Promise<ExpenseResource> {
    return this.request<ExpenseResource>('/api/expense_resources', {
      method: 'POST',
      body: JSON.stringify(expense),
    })
  }

  async updateExpense(id: string, expense: Partial<ExpenseResource>): Promise<ExpenseResource> {
    return this.request<ExpenseResource>(`/api/expense_resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(expense),
    })
  }

  async deleteExpense(id: string): Promise<void> {
    await this.request<void>(`/api/expense_resources/${id}`, {
      method: 'DELETE',
    })
  }

  // Income endpoints
  async getIncomes(filters: Record<string, string> = {}): Promise<{ member: IncomeResource[]; totalItems: number }> {
    const params = new URLSearchParams(filters)
    return this.request<{ member: IncomeResource[]; totalItems: number }>(`/api/income_resources?${params}`)
  }

  async createIncome(income: Omit<IncomeResource, 'id' | '@id' | '@type'>): Promise<IncomeResource> {
    return this.request<IncomeResource>('/api/income_resources', {
      method: 'POST',
      body: JSON.stringify(income),
    })
  }

  async updateIncome(id: string, income: Partial<IncomeResource>): Promise<IncomeResource> {
    return this.request<IncomeResource>(`/api/income_resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(income),
    })
  }

  async deleteIncome(id: string): Promise<void> {
    await this.request<void>(`/api/income_resources/${id}`, {
      method: 'DELETE',
    })
  }

  // Budget endpoints
  async getBudgets(): Promise<{ member: BudgetResource[]; totalItems: number }> {
    return this.request<{ member: BudgetResource[]; totalItems: number }>('/api/budget_resources')
  }

  async createBudget(budget: Omit<BudgetResource, 'id' | '@id' | '@type' | 'spentAmount' | 'remainingAmount'>): Promise<BudgetResource> {
    return this.request<BudgetResource>('/api/budget_resources', {
      method: 'POST',
      body: JSON.stringify(budget),
    })
  }

  async updateBudget(id: string, budget: Partial<BudgetResource>): Promise<BudgetResource> {
    return this.request<BudgetResource>(`/api/budget_resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(budget),
    })
  }

  async deleteBudget(id: string): Promise<void> {
    await this.request<void>(`/api/budget_resources/${id}`, {
      method: 'DELETE',
    })
  }

  async getBudgetStatus(): Promise<BudgetStatus> {
    return this.request<BudgetStatus>('/api/v1/budgets/status')
  }

  async checkExpenseAgainstBudget(categoryId: string, amount: number): Promise<BudgetCheckResult> {
    return this.request<BudgetCheckResult>('/api/v1/budgets/check-expense', {
      method: 'POST',
      body: JSON.stringify({ categoryId, amount }),
    })
  }

  // Category endpoints
  async getCategories(): Promise<{ member: CategoryResource[]; totalItems: number }> {
    return this.request<{ member: CategoryResource[]; totalItems: number }>('/api/category_resources')
  }

  async createCategory(category: Omit<CategoryResource, 'id' | '@id' | '@type'>): Promise<CategoryResource> {
    return this.request<CategoryResource>('/api/category_resources', {
      method: 'POST',
      body: JSON.stringify(category),
    })
  }

  async updateCategory(id: string, category: Partial<CategoryResource>): Promise<CategoryResource> {
    return this.request<CategoryResource>(`/api/category_resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(category),
    })
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request<void>(`/api/category_resources/${id}`, {
      method: 'DELETE',
    })
  }

  // Profile endpoints
  async getProfile(): Promise<ProfileResource> {
    return this.request<ProfileResource>('/api/profile_resources')
  }

  async updateProfile(profile: Partial<ProfileResource>): Promise<ProfileResource> {
    return this.request<ProfileResource>('/api/profile_resources', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    })
  }
}

// Hook para usar la API con autenticación
export const useExpensesAPI = () => {
  const { getAccessToken } = useAuth()
  const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000'
  
  // Usar useMemo para evitar crear nueva instancia en cada render
  const api = React.useMemo(() => {
    return new ExpensesAPI(API_BASE_URL, getAccessToken)
  }, [getAccessToken, API_BASE_URL])
  
  return api
}
