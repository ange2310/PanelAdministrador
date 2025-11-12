"use client"

import { useState } from "react"
import { X, Loader2, User, Mail, Calendar, Key, AlertCircle } from "lucide-react"
//import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { profileService } from "@/services/profile.service"
import 

interface UserProfile {
  idUsuario: string
  nombre: string
  correo: string
  fechaNacimiento?: string
  rol: string
  status: string
}

interface ProfileEditModalProps {
  open: boolean
  onClose: () => void
  profile: UserProfile
  onSuccess: () => void
}

export function ProfileEditModal({ open, onClose, profile, onSuccess }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    nombre: profile.nombre,
    fechaNacimiento: profile.fechaNacimiento || '',
    correo: profile.correo,
    nuevaContrasena: '',
    confirmarContrasena: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones
    if (!formData.nombre.trim()) {
      setError("El nombre es requerido")
      return
    }

    if (formData.nuevaContrasena && formData.nuevaContrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsSubmitting(true)

    try {
      const token = await authService.getAccessTokenAsync()
      if (!token) throw new Error('No hay token de autenticación')

      // Actualizar información básica si cambió
      if (formData.nombre !== profile.nombre || formData.fechaNacimiento !== profile.fechaNacimiento) {
        await profileService.updateProfile(profile.idUsuario, {
          nombre: formData.nombre,
          fechaNacimiento: formData.fechaNacimiento || undefined
        }, token)
      }

      // Actualizar correo si cambió
      if (formData.correo !== profile.correo) {
        await profileService.updateEmail({ email: formData.correo }, token)
      }

      // Actualizar contraseña si se proporcionó
      if (formData.nuevaContrasena) {
        await profileService.updatePassword({ password: formData.nuevaContrasena }, token)
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err)
      setError(err.message || 'Error al actualizar perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 border-0">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Información Personal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
                Información Personal
              </h3>
              
              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Correo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si cambias tu correo, deberás verificarlo nuevamente
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Cambiar Contraseña */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
                Cambiar Contraseña (Opcional)
              </h3>
              
              <div className="space-y-4">
                {/* Nueva Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-4 h-4 inline mr-1" />
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.nuevaContrasena}
                    onChange={(e) => setFormData({ ...formData, nuevaContrasena: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                    disabled={isSubmitting}
                    placeholder="Dejar en blanco para no cambiar"
                    minLength={6}
                  />
                </div>

                {/* Confirmar Contraseña */}
                {formData.nuevaContrasena && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Key className="w-4 h-4 inline mr-1" />
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      value={formData.confirmarContrasena}
                      onChange={(e) => setFormData({ ...formData, confirmarContrasena: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                      disabled={isSubmitting}
                      placeholder="Confirmar nueva contraseña"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              variant="outline"
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}