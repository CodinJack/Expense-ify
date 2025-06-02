const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// LOGIN
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/log-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  // Save JWT
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
};

// SIGN UP
export const signup = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/create-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
};

// LOGOUT
export const logout = async () => {
  localStorage.removeItem("token");
};



// expenses
// ADD EXPENSE
export const addExpense = async (amount: number, description: string) => {
  const response = await fetch(`${API_BASE_URL}/transactions/expense`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ amount, description }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to add expense");
  }

  return data;
};

// GET ALL EXPENSES
export const fetchExpenses = async () => {
  const res = await fetch(`${API_BASE_URL}/transactions/expense`, {
    headers: getAuthHeader(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch expenses");
  }

  return data;
};

// DELETE EXPENSE
export const deleteExpense = async (id: number) => {
  const res = await fetch(`${API_BASE_URL}/transactions/expense/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete expense");
  }

  return data;
};



// Get AI-generated summary of expenses
export async function getSummary(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/summary`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }

  const data = await response.json();
  return data.summary;
}

export async function exportPDF(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/export/pdf`, {
    method: 'GET',
    headers: getAuthHeader(),
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

export async function exportCSV(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/export/csv`, {
    method: 'GET',
    headers: getAuthHeader(),
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



export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE_URL}/api/me`, {
    headers: getAuthHeader(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Not authenticated");
  }
  console.log(data);
  return data.user;
}
