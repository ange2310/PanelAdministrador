"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, User, Mail } from "lucide-react"

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {isEditMode ? "Editar Médico" : "Invitar Médico"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Dr. Juan Pérez"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* Correo - solo en modo invitar */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="doctor@ejemplo.com"
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Estado - solo en modo editar */}
          {isEditMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                disabled={isSubmitting}
              >
                <option value="activo">Activo</option>
                <option value="invitado">Invitado</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar" : "Enviar Invitación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
