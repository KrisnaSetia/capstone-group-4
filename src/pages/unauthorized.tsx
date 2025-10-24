import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { ROLE_NAMES } from "@/lib/auth";

interface User {
  userId: number;
  username: string;
  email: string;
  roles: number;
}

const UnauthorizedPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Ups! Ini bukan halaman Anda | ITS-OK</title>
        <meta name="description" content="Halaman persetujuan sesi psikolog" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 text-red-500">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Akses Ditolak
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>

            {user && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>User:</strong> {user.username} ({user.email})
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Role:</strong>{" "}
                  {ROLE_NAMES[user.roles as keyof typeof ROLE_NAMES]}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kembali
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Jika Anda yakin ini adalah kesalahan, silakan hubungi
              administrator sistem.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnauthorizedPage;
