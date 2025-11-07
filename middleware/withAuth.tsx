"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { adminAuthService } from "@/services/auth.service"
import { Loader2 } from "lucide-react"

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const router = useRouter()

    useEffect(() => {
      if (!adminAuthService.isAuthenticated()) {
        router.push('/login')
      }
    }, [router])

    if (!adminAuthService.isAuthenticated()) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Verificando autenticación...</p>
          </div>
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}