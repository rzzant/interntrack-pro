/**
 * Global State Store (Zustand)
 * Manages auth state, applications, UI state
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  preferences?: { theme: "dark" | "light" };
}

export interface Application {
  _id: string;
  companyName: string;
  role: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  dateApplied: string;
  notes: string;
  location?: string;
  salary?: string;
  jobUrl?: string;
  kanbanOrder?: number;
  daysSinceApplied?: number;
  needsFollowUp?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  token: string | null;
  user: User | null;
  theme: "dark" | "light";
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set, get) => ({
      token: null,
      user: null,
      theme: "dark",

      setAuth: (token, user) => set({ token, user }),

      logout: () => set({ token: null, user: null }),

      updateUser: (user) => set({ user }),

      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        set({ theme: newTheme });

        // Safe for Next.js (client only)
        if (typeof window !== "undefined") {
          document.documentElement.classList.toggle(
            "dark",
            newTheme === "dark"
          );
        }
      },
    }),
    {
      name: "interntrack-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        theme: state.theme,
      }),
    }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────────────────
interface UIState {
  sidebarOpen: boolean;
  selectedApplication: Application | null;
  isModalOpen: boolean;
  modalMode: "view" | "edit" | "create";
  setSidebarOpen: (open: boolean) => void;
  openModal: (app?: Application, mode?: "view" | "edit" | "create") => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  selectedApplication: null,
  isModalOpen: false,
  modalMode: "create",

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModal: (app, mode = "create") =>
    set({
      selectedApplication: app || null,
      isModalOpen: true,
      modalMode: app ? mode : "create",
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      selectedApplication: null,
      modalMode: "create",
    }),
}));