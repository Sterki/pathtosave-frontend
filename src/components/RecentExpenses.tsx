import React, { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { useExpensesAPI, ExpenseResource } from "../services/api";
import { Alert, AlertDescription } from "./ui/alert";

const categoryColors: Record<string, string> = {
  Alimentación: "bg-blue-100 text-blue-800",
  Transporte: "bg-green-100 text-green-800",
  Entretenimiento: "bg-purple-100 text-purple-800",
  Servicios: "bg-orange-100 text-orange-800",
  Compras: "bg-pink-100 text-pink-800",
  Salud: "bg-red-100 text-red-800",
  Educación: "bg-indigo-100 text-indigo-800",
  Otros: "bg-gray-100 text-gray-800",
};

export function RecentExpenses() {
  const api = useExpensesAPI();
  const [expenses, setExpenses] = useState<ExpenseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener los 5 gastos más recientes
        const response = await api.getExpenses({ limit: "5" });
        setExpenses(response.member);
      } catch (err) {
        console.error("Error fetching recent expenses:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar gastos recientes"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecentExpenses();
  }, []); // Remover api de las dependencias

  if (loading) {
    return (
      <div>
        <h3 className='text-lg font-semibold mb-4'>Gastos Recientes</h3>
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className='text-lg font-semibold mb-4'>Gastos Recientes</h3>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div>
        <h3 className='text-lg font-semibold mb-4'>Gastos Recientes</h3>
        <p className='text-muted-foreground text-center py-8'>
          No hay gastos recientes para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className='text-lg font-semibold mb-4'>Gastos Recientes</h3>
      <div className='space-y-3'>
        {expenses.map((expense) => {
          const date = new Date(expense.occurredAt).toLocaleDateString();
          const categoryName = expense.categoryId || "Otros"; // TODO: Obtener nombre de categoría desde API

          return (
            <div
              key={expense.id}
              className='flex items-center justify-between p-3 bg-muted rounded-lg'
            >
              <div className='flex items-center gap-3'>
                <Badge
                  variant='secondary'
                  className={
                    categoryColors[categoryName] || categoryColors["Otros"]
                  }
                >
                  {categoryName}
                </Badge>
                <div>
                  <p className='font-medium'>{expense.description}</p>
                  <p className='text-sm text-muted-foreground'>{date}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-red-600'>
                  -${expense.amount.toLocaleString()}
                </p>
                {expense.merchant && (
                  <p className='text-xs text-muted-foreground'>
                    {expense.merchant}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
