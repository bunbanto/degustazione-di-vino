"use client";

import { useEffect, useState, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

interface WithAuthProps {
  // Додаткові пропси, які можуть бути передані
}

/**
 * HOC для захисту компонентів, що вимагають авторизації
 * Перенаправляє на /login, якщо користувач не авторизований
 */
export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const { currentUser } = useUserStore();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        // Немає токена - перенаправляємо на login
        router.push("/login");
        return;
      }

      // Є токен - вважаємо авторизованим
      setIsAuthenticated(true);
      setIsLoading(false);
    }, [router, currentUser]);

    // Поки перевіряємо авторизацію - показуємо loading
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-rose-50 dark:from-dark-900 dark:to-dark-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-rose-600 dark:text-rose-400">
              Перевірка авторизації...
            </p>
          </div>
        </div>
      );
    }

    // Якщо не авторизований, не рендеримо компонент (redirect в useEffect)
    if (!isAuthenticated) {
      return null;
    }

    // Авторизований - рендеримо компонент
    return <WrappedComponent {...props} />;
  };
}

/**
 * Хук для перевірки авторизації
 * Повертає { isAuthenticated, isLoading, currentUser }
 */
export function useAuth() {
  const { currentUser } = useUserStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        setIsAuthenticated(true);
        // Синхронізуємо userStore з localStorage
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
    };

    checkAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    currentUser,
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  };
}

/**
 * Компонент для захисту маршрутів - обгортка для children
 * Використовувати в layout або безпосередньо на сторінках
 */
export function AuthGuard({
  children,
  redirectTo = "/login",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-rose-50 dark:from-dark-900 dark:to-dark-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-rose-600 dark:text-rose-400">
            Перевірка авторизації...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default withAuth;
