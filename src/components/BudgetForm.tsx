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
import { BudgetResource, CategoryResource } from "../services/api";
import { useExpensesAPI } from "../services/api";

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    budget: Omit<
      BudgetResource,
      "id" | "@id" | "@type" | "spentAmount" | "remainingAmount"
    >
  ) => void;
  editingBudget?: BudgetResource | null;
}

export function BudgetForm({
  open,
  onClose,
  onSave,
  editingBudget,
}: BudgetFormProps) {
  const api = useExpensesAPI();
  const [categories, setCategories] = useState<CategoryResource[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "USD",
    period: "monthly",
    categoryId: "",
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
  }, []);

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        name: editingBudget.name,
        amount: editingBudget.amount.toString(),
        currency: editingBudget.currency,
        period: editingBudget.period,
        categoryId: editingBudget.categoryId || "",
      });
    } else {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      setFormData({
        name: "",
        amount: "",
        currency: "USD",
        period: "monthly",
        categoryId: "",
      });
    }
  }, [editingBudget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    onSave({
      name: formData.name,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      period: formData.period,
      periodStart: startOfMonth.toISOString(),
      periodEnd: endOfMonth.toISOString(),
      isActive: true,
      categoryId: formData.categoryId || undefined,
    });

    setFormData({
      name: "",
      amount: "",
      currency: "USD",
      period: "monthly",
      categoryId: "",
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
            {editingBudget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='name'>Nombre del Presupuesto</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder='Ej: Alimentación'
              required
            />
          </div>

          <div>
            <Label htmlFor='amount'>Monto Asignado</Label>
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

          <div>
            <Label htmlFor='categoryId'>Categoría (opcional)</Label>
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
            <Label htmlFor='period'>Período</Label>
            <Select
              value={formData.period}
              onValueChange={(value) => handleChange("period", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecciona período' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='weekly'>Semanal</SelectItem>
                <SelectItem value='monthly'>Mensual</SelectItem>
                <SelectItem value='yearly'>Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex gap-2 pt-4'>
            <Button type='submit' className='flex-1'>
              {editingBudget ? "Actualizar" : "Crear"}
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
