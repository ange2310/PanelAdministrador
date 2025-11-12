"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, AlertCircle, Loader2,  Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { adminAuthService } from "@/services/auth.service"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Por favor completa todos los campos")
      return
    }

    if (formData.password.length < 10) {
      setError("La contraseña debe tener al menos 10 caracteres")
      return
    }

    setIsLoading(true)

    try {
      await adminAuthService.login(formData.email, formData.password)
      router.push('/users/admin')
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
  <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
    {/* Lado Izquierdo - Imagen */}
    <div 
      className="hidden lg:block relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/AdministratorPicture.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-purple-900/90 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="mb-6">
            <Image
              src="/loading.svg"
              alt="Do U Remember Logo"
              width={80}
              height={80}
              priority
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">Do U Remember</h1>
          <p className="text-xl text-purple-100">Panel de Administración</p>
        </div>
      </div>
    </div>

    {/* Lado Derecho - Formulario */}
    <div className="flex items-center justify-center p-8 bg-gradient-to-br from-pink-100 to-indigo-800">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        {/* Logo móvil */}
        <div className="lg:hidden text-center mb-6">
          <Image
            src="/loading.svg"
            alt="Do U Remember Logo"
            width={60}
            height={60}
            priority
            className="mx-auto mb-4"
          />
        </div>

        <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">
          Iniciar Sesión
        </h2>
        <p className="text-slate-600 text-center mb-8">
          Panel de Administración
        </p>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@ejemplo.com"
                className="w-full pl-12 pr-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-400 bg-white border-2 border-gray-300 rounded-xl outline-none transition-all shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-400"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password - APLICACIÓN DEL OJO */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
              <input
                // El tipo se alterna entre 'password' y 'text'
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••"
                // Importante: 'pr-12' para dejar espacio al icono
                className="w-full pl-12 pr-12 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-400 bg-white border-2 border-gray-300 rounded-xl outline-none transition-all shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-400"
                disabled={isLoading}
              />
              
              {/* Botón para alternar visibilidad (El Ojo) */}
              <button
                type="button" // Previene el envío del formulario
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-purple-600 transition-colors focus:outline-none"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={isLoading}
              >
                {/* Muestra el icono de ojo abierto o cerrado */}
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>

            </div>
            
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Solo usuarios administradores
          </p>
        </div>
      </div>
    </div>
  </div>
)
}