const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const loginWithPassport = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/log-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Enable cookie-based sessions
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return await response.json(); // Optional: user data or success message
};

export const SignUpWithPassport = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/create-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Enable cookie-based sessions
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return await response.json(); // Optional: user data or success message
};


export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/api/log-out`, {
    method: "GET",
    credentials: "include", // send cookies
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
};



// expenses
export const addExpense = async (amount: number, description: string) => {
  const response = await fetch(`${API_BASE_URL}/transactions/expense`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Important for session-based auth (Passport)
    body: JSON.stringify({ amount, description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || "Failed to add expense");
  }

  return await response.json();
};

export const fetchExpenses = async () => {
  const res = await fetch(`${API_BASE_URL}/transactions/expense`, {
    method: 'GET',
    credentials: "include"
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch expenses: ${error}`);
  }

  return await res.json();
};

export const deleteExpense = async (id: number) => {
  const res = await fetch(`${API_BASE_URL}/transactions/expense/${id}`, {
    method: 'DELETE',
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete expense: ${error}`);
  }

  return await res.json();
};


// Get AI-generated summary of expenses
export async function getSummary(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/summary`,{
    method: 'GET',
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error('Failed to fetch summary');
  }
  const data = await response.json();
  return data.summary;
}

// Export expenses as PDF and trigger download
export async function exportPDF(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/export/pdf`, {
    method: 'GET',
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error('Failed to export PDF');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'expenses.pdf';
  link.click();
  window.URL.revokeObjectURL(url);
}

// Export expenses as CSV and trigger download
export async function exportCSV(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/export/csv`, {
    method: 'GET',
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error('Failed to export CSV');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'expenses.csv';
  link.click();
  window.URL.revokeObjectURL(url);
}