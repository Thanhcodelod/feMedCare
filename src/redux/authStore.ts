import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        localStorage.setItem("auth_token", token);
        const secure = location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; SameSite=Lax${secure}`;
        document.cookie = `user_role=${encodeURIComponent(user.role)}; path=/; SameSite=Lax${secure}`;
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("auth_token");
        document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax;";
        document.cookie = "user_role=; path=/; max-age=0; SameSite=Lax;";
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: "medcare-auth",
      skipHydration: true,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
