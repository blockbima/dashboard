// app/layout.tsx
"use client";

import "./globals.css";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RootLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = sessionStorage.getItem("isAuthenticated") === "true";
    if (!auth && pathname !== "/") {
      router.replace("/");
    }
    if (auth && pathname === "/") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    router.push("/");
  };

  return (
    <html lang="en">
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
        <header className="px-6 py-4 bg-gray-800 text-gray-100 flex items-center justify-between">
          {/* Only BlockBima now */}
          <div className="text-lg font-bold">BlockBima</div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
          >
            Logout
          </button>
        </header>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
