
import { useAuth } from './useAuth';

interface Expense {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export const useExpenses = () => {
  const { user } = useAuth();

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token}`,
  });

  const fetchExpenses = async (): Promise<Expense[]> => {
    if (!user) throw new Error('Not authenticated');

    // TODO: Replace with your actual API endpoint
    const response = await fetch('http://localhost:3000/api/expenses', {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }

    return response.json();
  };

  const addExpense = async (amount: number, description: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    // TODO: Replace with your actual API endpoint
    const response = await fetch('http://localhost:3000/api/expenses', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, description }),
    });

    if (!response.ok) {
      throw new Error('Failed to add expense');
    }
  };

  const deleteExpense = async (id: number): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    // TODO: Replace with your actual API endpoint
    const response = await fetch(`http://localhost:3000/api/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }
  };

  const getSummary = async (): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    // TODO: Replace with your actual API endpoint
    const response = await fetch('http://localhost:3000/api/expenses/summary', {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get summary');
    }

    const data = await response.json();
    return data.summary;
  };

  const exportPDF = async (): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    // TODO: Replace with your actual API endpoint
    const response = await fetch('http://localhost:3000/api/expenses/export/pdf', {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportCSV = async (): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    // TODO: Replace with your actual API endpoint
    const response = await fetch('http://localhost:3000/api/expenses/export/csv', {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    fetchExpenses,
    addExpense,
    deleteExpense,
    getSummary,
    exportPDF,
    exportCSV,
  };
};
