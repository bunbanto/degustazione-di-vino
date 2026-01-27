import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id?: string | number;
  _id?: string;
  username?: string;
  name?: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface UserStore {
  // Current logged in user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Dictionary of all known usernames (userId -> username)
  userNames: Record<string, string>;
  setUserName: (userId: string, username: string) => void;
  getUsername: (userId: string) => string;

  // Check if user is authenticated
  checkAuth: () => boolean;

  // Logout
  logout: () => void;
}

// Create store with persistence to localStorage
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      userNames: {},

      setCurrentUser: (user) => {
        set({ currentUser: user });
        // Also add current user to userNames dictionary
        if (user) {
          const userId = user.id?.toString() || user._id?.toString() || "";
          const username = user.username || user.name || "";
          if (userId && username) {
            set((state) => ({
              userNames: {
                ...state.userNames,
                [userId]: username,
              },
            }));
          }
        }
      },

      setUserName: (userId, username) => {
        set((state) => ({
          userNames: {
            ...state.userNames,
            [userId]: username,
          },
        }));
      },

      getUsername: (userId) => {
        const state = get();
        const userIdStr = userId.toString();
        if (state.userNames[userIdStr]) {
          return state.userNames[userIdStr];
        }
        // Fallback: show last 4 characters of userId
        return `Користувач ${userIdStr.slice(-4)}`;
      },

      checkAuth: () => {
        if (typeof window === "undefined") return false;

        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            // Sync user to store
            set({ currentUser: user });
            return true;
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
            return false;
          }
        }

        return false;
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        set({ currentUser: null });
      },
    }),
    {
      name: "user-storage", // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
