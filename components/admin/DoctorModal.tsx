"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, User, Mail, UserCheck } from "lucide-react"

interface DoctorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DoctorFormData) => Promise<void>
  doctor?: {
    idUsuario: string
    nombre: string
    correo: string
    status: string
  }
  isEditMode?: boolean
}

export interface DoctorFormData {
  nombre: string
  correo?: string
  rol?: string
  status?: string
}

export default function DoctorModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  doctor,
  isEditMode = false 
}: DoctorModalProps) {
  const [formData, setFormData] = useState<DoctorFormData>({
    nombre: "",
    correo: "",
    rol: "medico",
    status: "invitado"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (doctor && isEditMode) {
      setFormData({
        nombre: doctor.nombre,
        status: doctor.status,
        rol: "medico"
      })
    } else {
      setFormData({
        nombre: "",
        correo: "",
        rol: "medico",
        status: "invitado"
      })
    }
  }, [doctor, isEditMode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.nombre.trim()) {
      setError("El nombre es obligatorio")
      return
    }

    if (!isEditMode && !formData.correo?.trim()) {
      setError("El correo es obligatorio")
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      handleClose()
    } catch (err: any) {
      setError(err.message || "Error al guardar")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      nombre: "",
      correo: "",
      rol: "medico",
      status: "invitado"
    })
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-600 to-purple-700 px-8 py-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isEditMode ? (
                <UserCheck className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isEditMode ? "Editar Médico" : "Invitar Médico"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm font-medium leading-relaxed">{error}</p>
            </div>
          )}
          
          {/* Nombre */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2.5">
              <User className="w-4 h-4 inline mr-2 mb-0.5" />
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Dr. Juan Pérez"
              className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 placeholder:text-slate-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isEditMode || isSubmitting}
            />
            {isEditMode && (
              <p className="text-xs text-gray-500 mt-1">
                El nombre no se puede editar. Solo puedes cambiar el estado.
              </p>
            )}
          </div>

          {/* Correo - solo en modo invitar */}
          {!isEditMode && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                <Mail className="w-4 h-4 inline mr-2 mb-0.5" />
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="doctor@ejemplo.com"
                className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 placeholder:text-slate-400"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Estado - solo en modo editar */}
          {isEditMode && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                <AlertCircle className="w-4 h-4 inline mr-2 mb-0.5" />
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 bg-white"
                disabled={isSubmitting}
              >
                <option value="activo">✓ Activo</option>
                <option value="invitado">⏳ Invitado</option>
                <option value="inactivo">✕ Inactivo</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 text-base bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 active:scale-98 transition-all duration-200 font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 text-base bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 active:scale-98 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
            >
              {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar" : "Enviar Invitación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}