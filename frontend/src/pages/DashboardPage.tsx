import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { AddExpenseForm } from '@/components/dashboard/AddExpenseForm';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { AIInsights } from '@/components/dashboard/AIInsights';

interface Expense {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface DashboardPageProps {
  userEmail: string;
  onLogout: () => void;
  onAddExpense: (amount: number, description: string) => Promise<void>;
  onDeleteExpense: (id: number) => Promise<void>;
  onGetSummary: () => Promise<string>;
  onExportPDF: () => Promise<void>;
  onExportCSV: () => Promise<void>;
  onFetchExpenses: () => Promise<Expense[]>;
}

export const DashboardPage = ({
  userEmail,
  onLogout,
  onAddExpense,
  onDeleteExpense,
  onGetSummary,
  onExportPDF,
  onExportCSV,
  onFetchExpenses,
}: DashboardPageProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const fetchedExpenses = await onFetchExpenses();
      setExpenses(fetchedExpenses);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (amount: number, description: string) => {
    setIsLoading(true);
    try {
      await onAddExpense(amount, description);
      await fetchExpenses(); // Refresh the list
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    await onDeleteExpense(id);
    await fetchExpenses(); // Refresh the list
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <p className="text-gray-600">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <Header onLogout={onLogout} userEmail={userEmail} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            Track your expenses with AI-powered insights and smart categorization.
          </p>
        </div>

        <div className="space-y-8">
          {/* Add Expense Form */}
          <AddExpenseForm onAddExpense={handleAddExpense} isLoading={isLoading} />

          {/* Charts Section */}
          <ExpenseChart expenses={expenses} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Expenses List */}
            <div className="lg:col-span-2">
              <ExpenseList
                expenses={expenses}
                onDeleteExpense={handleDeleteExpense}
                isLoading={isLoading}
              />
            </div>

            {/* AI Insights & Export */}
            <div className="lg:col-span-1">
              <AIInsights
                onGetSummary={onGetSummary}
                onExportPDF={onExportPDF}
                onExportCSV={onExportCSV}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
