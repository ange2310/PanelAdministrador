"use client"

import Image from "next/image"
import Link from "next/link"

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 text-2xl font-semibold text-gray-800 hover:text-purple-600 transition-colors duration-200"
          >
            <div className="p-2 bg-purple-50 rounded-lg">
              <Image
                src="/loading.svg"
                alt="Do U Remember Logo"
                width={32}
                height={32}
                priority
                className="text-purple-600"
              />
            </div>
            <span className="hidden sm:block font-medium">Do U Remember</span>
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium">
              Inicio
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium">
              Nosotros
            </Link>
            <Link href="/services" className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium">
              Servicios
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium">
              Contacto
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}