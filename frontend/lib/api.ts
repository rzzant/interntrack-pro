const BASE_URL = "http://localhost:5001/api";

// ─── TYPES ────────────────────────────────────────────────
type ApiResponse<T> = {
  status: string;
  data: T;
  pagination?: any;
};

type AuthResponse = {
  token: string;
  data: {
    user: any;
  };
};

// ─── HELPER: Get Token ────────────────────────────────────
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("interntrack-auth");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
};

// ─── HELPER: Fetch Wrapper (IMPORTANT) ────────────────────
const apiFetch = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
    credentials: "include", // 🔥 important for cookies
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Something went wrong");
  }

  return json;
};

// ─── AUTH API ─────────────────────────────────────────────
export const authAPI = {
  login: async (data: { email: string; password: string }) => {
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ─── APPLICATIONS API ─────────────────────────────────────
export const applicationsAPI = {
  getAll: async () => {
    const res = await apiFetch<ApiResponse<{ applications: any[] }>>(
      "/applications"
    );

    return {
      ...res.data,
      pagination: res.pagination,
    };
  },

  create: async (data: any) => {
    const res = await apiFetch<ApiResponse<{ application: any }>>(
      "/applications",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await apiFetch<ApiResponse<{ application: any }>>(
      `/applications/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    return res.data;
  },

  updateStatus: async (id: string, data: any) => {
    const res = await apiFetch<ApiResponse<{ application: any }>>(
      `/applications/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

    return res.data;
  },

  delete: async (id: string) => {
    await apiFetch(`/applications/${id}`, {
      method: "DELETE",
    });
  },
};

// ─── STATS API ────────────────────────────────────────────
export const statsAPI = {
  get: async () => {
    const res = await apiFetch<ApiResponse<any>>(
      "/applications/stats"
    );

    return res.data;
  },
};