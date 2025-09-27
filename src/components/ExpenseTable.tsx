import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import { ExpenseResource } from "../services/api";

interface ExpenseTableProps {
  expenses: ExpenseResource[];
  onEdit: (expense: ExpenseResource) => void;
  onDelete: (id: string) => void;
}

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

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className='border rounded-lg'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Comercio</TableHead>
            <TableHead className='text-right'>Monto</TableHead>
            <TableHead className='text-center'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className='text-center py-8 text-muted-foreground'
              >
                No hay gastos registrados
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => {
              const categoryName = expense.categoryId || "Otros"; // TODO: Obtener nombre de categoría desde API

              return (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.occurredAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant='secondary'
                      className={
                        categoryColors[categoryName] || categoryColors["Otros"]
                      }
                    >
                      {categoryName}
                    </Badge>
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.merchant || "-"}</TableCell>
                  <TableCell className='text-right font-semibold text-red-600'>
                    ${expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className='flex justify-center gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onEdit(expense)}
                        className='h-8 w-8'
                      >
                        <Edit2 className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(expense.id)}
                        className='h-8 w-8 text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
