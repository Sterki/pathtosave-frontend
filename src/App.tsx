import React, { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { Budgets } from "./components/Budgets";
import { Expenses } from "./components/Expenses";
import { ExpenseCalendar } from "./components/ExpenseCalendar";
import { Settings } from "./components/Settings";
import { useApi } from "./hooks/useApi";
import { useAuth } from "./contexts/AuthContext";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const api = useApi();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "budgets":
        return <Budgets />;
      case "expenses":
        return <Expenses />;
      case "calendar":
        return <ExpenseCalendar />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  useEffect(() => {
    if (user) {
      api
        .get("/api/expense_resources")
        .then((response) => response.json())
        .then((data) => console.log("Datos recibidos:", data))
        .catch((error) => console.error("Error:", error));
    }
  }, [activeTab, user, api]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='flex h-screen'>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className='flex-1 flex flex-col overflow-hidden lg:ml-0'>
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          <main className='flex-1 overflow-y-auto'>{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}
