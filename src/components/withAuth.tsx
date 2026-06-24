"use client";

import { useEffect, useState, ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { withLang, getLangFromPath } from "@/i18n/routeUtils";
import { authAPI } from "@/services/api";

/**
 * HOC для захисту компонентів, що вимагають авторизації.
 * Підтверджує сесію через /auth/profile, а не лише наявністю token у localStorage.
 */
export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const pathname = usePathname();
    const lang = getLangFromPath(pathname);

    const { setCurrentUser } = useUserStore();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const run = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push(withLang("/login", lang));
          return;
        }

        try {
          const profileResp = await authAPI.getProfile();
          const profileData = (profileResp as any)?.user || profileResp;

          if (profileData) {
            const userData = {
              id: profileData.id || profileData._id,
              _id: profileData._id,
              name: profileData.name || profileData.username || "",
              username: profileData.username || profileData.name || "",
              email: profileData.email,
              role: profileData.role,
              createdAt: profileData.createdAt,
              cardCount: profileData.cardCount ?? 0,
              favoritesCount: profileData.favoritesCount ?? 0,
            };

            setCurrentUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          }

          setIsAuthenticated(true);
          setIsLoading(false);
        } catch {
          // axios interceptor в api.ts вже почистить localStorage і зробить redirect
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      };

      run();
    }, [router, setCurrentUser, lang]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-rose-50 dark:from-dark-900 dark:to-dark-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mx-auto mb-4" />
            <p className="text-rose-600 dark:text-rose-400">
              Перевірка авторизації...
            </p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) return null;

    return <WrappedComponent {...props} />;
  };
}

/**
 * Хук для перевірки авторизації.
 * (Основна коректність забезпечується interceptor'ом в api.ts та withAuth через /auth/profile.)
 */
export function useAuth() {
  const { currentUser } = useUserStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      setIsAuthenticated(true);
      try {
        const user = JSON.parse(userStr);
        useUserStore.getState().setCurrentUser(user);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    currentUser,
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  };
}

/**
 * Компонент для захисту маршрутів.
 */
export function AuthGuard({
  children,
  redirectTo = "/login",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const lang = getLangFromPath(pathname);

  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(withLang(redirectTo, lang));
    }
  }, [isAuthenticated, isLoading, router, redirectTo, lang]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-rose-50 dark:from-dark-900 dark:to-dark-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mx-auto mb-4" />
          <p className="text-rose-600 dark:text-rose-400">
            Перевірка авторизації...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

export default withAuth;
