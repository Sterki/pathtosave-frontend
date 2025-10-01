import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { BudgetCard } from "./BudgetCard";
import { BudgetForm } from "./BudgetForm";
import { useExpensesAPI, BudgetResource } from "../services/api";
import { Alert, AlertDescription } from "./ui/alert";

export function Budgets() {
  const api = useExpensesAPI();
  const [budgets, setBudgets] = useState<BudgetResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetResource | null>(
    null
  );

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getBudgets();
      console.log("response budgets", response);
      setBudgets(response.member);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar presupuestos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("fetching budgets");
    fetchBudgets();
  }, []); // fetchBudgets ya está definida dentro del componente

  const handleSave = async (
    budgetData: Omit<
      BudgetResource,
      "id" | "@id" | "@type" | "spentAmount" | "remainingAmount"
    >
  ) => {
    try {
      if (editingBudget) {
        await api.updateBudget(editingBudget.id, budgetData);
        setEditingBudget(null);
      } else {
        await api.createBudget(budgetData);
      }

      // Recargar la lista de presupuestos
      await fetchBudgets();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving budget:", err);
      setError(
        err instanceof Error ? err.message : "Error al guardar presupuesto"
      );
    }
  };

  const handleEdit = (budget: BudgetResource) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBudget(id);
      await fetchBudgets(); // Recargar la lista
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError(
        err instanceof Error ? err.message : "Error al eliminar presupuesto"
      );
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-muted-foreground'>Cargando presupuestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-semibold'>Presupuestos</h2>
        <Button onClick={() => setShowForm(true)} className='gap-2'>
          <Plus className='h-4 w-4' />
          Nuevo Presupuesto
        </Button>
      </div>

      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {budgets.length === 0 && !loading && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground text-lg'>
            No tienes presupuestos configurados
          </p>
          <p className='text-muted-foreground text-sm mt-2'>
            Crea tu primer presupuesto para comenzar a controlar tus gastos
          </p>
        </div>
      )}

      <BudgetForm
        open={showForm}
        onClose={handleCloseForm}
        onSave={handleSave}
        editingBudget={editingBudget}
      />
    </div>
  );
}
