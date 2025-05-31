import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { AuthPage } from './AuthPage';
import { DashboardPage } from './DashboardPage';

const Index = () => {
  const { user, isLoading, login, signup, logout } = useAuth();
  const { fetchExpenses, addExpense, deleteExpense, getSummary, exportPDF, exportCSV } = useExpenses();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage
        onLogin={login}
        onSignup={signup}
        isLoading={isLoading}
      />
    );
  }

  return (
    <DashboardPage
      userEmail={user.email}
      onLogout={logout}
      onAddExpense={addExpense}
      onDeleteExpense={deleteExpense}
      onGetSummary={getSummary}
      onExportPDF={exportPDF}
      onExportCSV={exportCSV}
      onFetchExpenses={fetchExpenses}
    />
  );
};

export default Index;
