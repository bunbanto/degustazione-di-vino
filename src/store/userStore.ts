import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id?: string | number;
  _id?: string;
  username?: string;
  name?: string;
  email: string;
  role: string;
}

interface UserStore {
  // Current logged in user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Dictionary of all known usernames (userId -> username)
  userNames: Record<string, string>;
  setUserName: (userId: string, username: string) => void;
  getUsername: (userId: string) => string;
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
    }),
    {
      name: "user-storage", // unique name for localStorage
    },
  ),
);
