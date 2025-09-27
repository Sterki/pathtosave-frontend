import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { BudgetResource } from "../services/api";

interface BudgetCardProps {
  budget: BudgetResource;
  onEdit: (budget: BudgetResource) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const spent = budget.spentAmount || 0;
  const remaining = budget.amount - spent;
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const isOverBudget = percentage > 100;

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <CardTitle className='text-lg'>{budget.name}</CardTitle>
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onEdit(budget)}
            className='h-8 w-8'
          >
            <Edit2 className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onDelete(budget.id)}
            className='h-8 w-8 text-red-600 hover:text-red-700'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='text-muted-foreground'>Asignado</p>
            <p className='font-semibold'>${budget.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Gastado</p>
            <p
              className={`font-semibold ${
                isOverBudget ? "text-red-600" : "text-green-600"
              }`}
            >
              ${spent.toLocaleString()}
            </p>
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>Progreso</span>
            <span
              className={
                isOverBudget ? "text-red-600" : "text-muted-foreground"
              }
            >
              {percentage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={Math.min(percentage, 100)}
            className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
          />
        </div>

        <div className='pt-2 border-t'>
          <p className='text-sm text-muted-foreground'>Restante</p>
          <p
            className={`font-semibold ${
              remaining >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            $
            {remaining >= 0
              ? remaining.toLocaleString()
              : Math.abs(remaining).toLocaleString()}
            {remaining < 0 && " (excedido)"}
          </p>
        </div>

        <div className='pt-2 border-t'>
          <p className='text-sm text-muted-foreground'>Período</p>
          <p className='text-sm font-medium'>
            {budget.period} - {budget.isActive ? "Activo" : "Inactivo"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
