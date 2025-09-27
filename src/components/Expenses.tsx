import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { ExpenseTable } from "./ExpenseTable";
import { ExpenseForm } from "./ExpenseForm";
import { useExpensesAPI, ExpenseResource } from "../services/api";
import { Alert, AlertDescription } from "./ui/alert";

export function Expenses() {
  const api = useExpensesAPI();
  const [expenses, setExpenses] = useState<ExpenseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseResource | null>(
    null
  );

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getExpenses();
      setExpenses(response.member);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(err instanceof Error ? err.message : "Error al cargar gastos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []); // fetchExpenses ya está definida dentro del componente

  const handleSave = async (
    expenseData: Omit<ExpenseResource, "id" | "@id" | "@type">
  ) => {
    try {
      if (editingExpense) {
        await api.updateExpense(editingExpense.id, expenseData);
        setEditingExpense(null);
      } else {
        await api.createExpense(expenseData);
      }

      // Recargar la lista de gastos
      await fetchExpenses();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving expense:", err);
      setError(err instanceof Error ? err.message : "Error al guardar gasto");
    }
  };

  const handleEdit = (expense: ExpenseResource) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteExpense(id);
      await fetchExpenses(); // Recargar la lista
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar gasto");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-muted-foreground'>Cargando gastos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-semibold'>Gestión de Gastos</h2>
        <Button onClick={() => setShowForm(true)} className='gap-2'>
          <Plus className='h-4 w-4' />
          Nuevo Gasto
        </Button>
      </div>

      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ExpenseTable
        expenses={expenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ExpenseForm
        open={showForm}
        onClose={handleCloseForm}
        onSave={handleSave}
        editingExpense={editingExpense}
      />
    </div>
  );
}
