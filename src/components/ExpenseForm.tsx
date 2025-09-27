import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ExpenseResource, CategoryResource } from "../services/api";
import { useExpensesAPI } from "../services/api";

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseResource, "id" | "@id" | "@type">) => void;
  editingExpense?: ExpenseResource | null;
}

export function ExpenseForm({
  open,
  onClose,
  onSave,
  editingExpense,
}: ExpenseFormProps) {
  const api = useExpensesAPI();
  const [categories, setCategories] = useState<CategoryResource[]>([]);
  const [formData, setFormData] = useState({
    occurredAt: "",
    categoryId: "",
    description: "",
    amount: "",
    merchant: "",
    paymentMethod: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getCategories();
        setCategories(response.member);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []); // Remover api de las dependencias

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        occurredAt: editingExpense.occurredAt.split("T")[0], // Convertir a formato de fecha
        categoryId: editingExpense.categoryId || "",
        description: editingExpense.description,
        amount: editingExpense.amount.toString(),
        merchant: editingExpense.merchant || "",
        paymentMethod: editingExpense.paymentMethod || "",
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        occurredAt: today,
        categoryId: "",
        description: "",
        amount: "",
        merchant: "",
        paymentMethod: "",
      });
    }
  }, [editingExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.occurredAt ||
      !formData.categoryId ||
      !formData.description ||
      !formData.amount
    )
      return;

    onSave({
      amount: parseFloat(formData.amount),
      description: formData.description,
      occurredAt: new Date(formData.occurredAt).toISOString(),
      merchant: formData.merchant || undefined,
      paymentMethod: formData.paymentMethod || undefined,
      categoryId: formData.categoryId,
    });

    const today = new Date().toISOString().split("T")[0];
    setFormData({
      occurredAt: today,
      categoryId: "",
      description: "",
      amount: "",
      merchant: "",
      paymentMethod: "",
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='occurredAt'>Fecha</Label>
            <Input
              id='occurredAt'
              type='date'
              value={formData.occurredAt}
              onChange={(e) => handleChange("occurredAt", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor='categoryId'>Categoría</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleChange("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecciona una categoría' />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='description'>Descripción</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder='Describe el gasto...'
              required
            />
          </div>

          <div>
            <Label htmlFor='merchant'>Comercio (opcional)</Label>
            <Input
              id='merchant'
              type='text'
              value={formData.merchant}
              onChange={(e) => handleChange("merchant", e.target.value)}
              placeholder='Nombre del comercio'
            />
          </div>

          <div>
            <Label htmlFor='paymentMethod'>Método de Pago (opcional)</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleChange("paymentMethod", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecciona método de pago' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='cash'>Efectivo</SelectItem>
                <SelectItem value='card'>Tarjeta</SelectItem>
                <SelectItem value='transfer'>Transferencia</SelectItem>
                <SelectItem value='other'>Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='amount'>Monto</Label>
            <Input
              id='amount'
              type='number'
              step='0.01'
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder='0.00'
              required
            />
          </div>

          <div className='flex gap-2 pt-4'>
            <Button type='submit' className='flex-1'>
              {editingExpense ? "Actualizar" : "Crear"}
            </Button>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
