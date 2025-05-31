// utils/api.ts (or inline inside component if preferred)
export const loginWithPassport = async (username: string, password: string) => {
  const response = await fetch("http://localhost:5000/api/log-in", {
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
  const response = await fetch("http://localhost:5000/api/log-out", {
    method: "GET",
    credentials: "include", // send cookies
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
};



