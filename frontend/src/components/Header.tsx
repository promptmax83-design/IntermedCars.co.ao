'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const isLoggedIn = api.getToken() !== null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">IC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">IntermedCars</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6">
            <Link href="/vehicles" className="text-gray-600 hover:text-gray-900 font-medium">
              Veiculos
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:text-red-800 font-medium transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
