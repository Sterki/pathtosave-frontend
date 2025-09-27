import React, { useState, useEffect } from "react";
import { DashboardCard } from "./DashboardCard";
import { ExpenseChart } from "./ExpenseChart";
import { RecentExpenses } from "./RecentExpenses";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useExpensesAPI,
  DashboardSummary,
  DailySpend,
  ExpensesByCategory,
} from "../services/api";
import { Alert, AlertDescription } from "./ui/alert";

export function Dashboard() {
  const api = useExpensesAPI();
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null
  );
  const [dailySpend, setDailySpend] = useState<DailySpend | null>(null);
  const [expensesByCategory, setExpensesByCategory] =
    useState<ExpensesByCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryData, dailyData, categoryData] = await Promise.all([
          api.getDashboardSummary(),
          api.getDailySpend(),
          api.getExpensesByCategory(),
        ]);

        console.log("Dashboard data:", {
          summaryData,
          dailyData,
          categoryData,
        });
        setDashboardData(summaryData);
        setDailySpend(dailyData);
        setExpensesByCategory(categoryData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar los datos del dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Remover api de las dependencias

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-muted-foreground'>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Transformar datos para los gráficos
  const categoryData =
    expensesByCategory?.expensesByCategory &&
    Array.isArray(expensesByCategory.expensesByCategory)
      ? expensesByCategory.expensesByCategory.map((item) => ({
          name: item.categoryName || "Sin nombre",
          value: item.totalAmount || 0,
        }))
      : [];

  const weeklyData =
    dailySpend?.dailySpending && Array.isArray(dailySpend.dailySpending)
      ? dailySpend.dailySpending.slice(0, 7).map((item, index) => ({
          week: `Día ${index + 1}`,
          gastos: item.amount || 0,
        }))
      : [];

  return (
    <div className='p-6 space-y-6'>
      {/* Cards de resumen */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <DashboardCard
          title='Total Ingresos'
          value={`$${dashboardData?.totalIncome?.toLocaleString() || "0"}`}
          icon={TrendingUp}
          color='success'
          trend={{ value: "12%", isPositive: true }}
        />
        <DashboardCard
          title='Total Gastos'
          value={`$${dashboardData?.totalExpenses?.toLocaleString() || "0"}`}
          icon={TrendingDown}
          color='danger'
          trend={{ value: "8%", isPositive: false }}
        />
        <DashboardCard
          title='Balance Disponible'
          value={`$${dashboardData?.availableBalance?.toLocaleString() || "0"}`}
          icon={Wallet}
          color={
            dashboardData?.availableBalance &&
            dashboardData.availableBalance > 0
              ? "success"
              : "danger"
          }
          trend={{
            value: "15%",
            isPositive: Boolean(
              dashboardData?.availableBalance &&
                dashboardData.availableBalance > 0
            ),
          }}
        />
      </div>

      {/* Gráficos */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-card border border-border rounded-lg p-6'>
          <ExpenseChart
            type='pie'
            data={categoryData}
            title='Distribución por Categoría'
          />
        </div>
        <div className='bg-card border border-border rounded-lg p-6'>
          <ExpenseChart
            type='bar'
            data={weeklyData}
            title='Gastos Diarios (Últimos 7 días)'
          />
        </div>
      </div>

      {/* Gastos recientes */}
      <div className='bg-card border border-border rounded-lg p-6'>
        <RecentExpenses />
      </div>
    </div>
  );
}
