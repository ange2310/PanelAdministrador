"use client"

import { useState, useEffect } from "react"
import { 
  UserPlus, 
  Users, 
  Edit, 
  Trash2, 
  Search,
  ChevronDown,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCheck,
  LogOut,
  X
} from "lucide-react"
import { apiService, Doctor } from "@/services/api.service"
import { adminAuthService } from "@/services/auth.service"
import DoctorModal, { DoctorFormData } from "@/components/admin/DoctorModal"
import ConfirmModal from "@/components/admin/ConfirmModal"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { withAuth } from "@/middleware/withAuth"

function AdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"todos" | "activo" | "inactivo">("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  })
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [adminName, setAdminName] = useState("")

  useEffect(() => {
    const session = adminAuthService.getSession()
    if (session) {
      setAdminName(session.nombre)
    }
    loadDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchQuery, filterStatus])

  const loadDoctors = async () => {
    setIsLoading(true)
    try {
      const data = await apiService.getAllDoctors()
      setDoctors(data)
    } catch (error: any) {
      showError(error.message || "Error al cargar médicos")
    } finally {
      setIsLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = [...doctors]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.nombre.toLowerCase().includes(query) ||
        doc.correo.toLowerCase().includes(query)
      )
    }

    if (filterStatus !== "todos") {
      filtered = filtered.filter(doc => doc.status === filterStatus)
    }

    setFilteredDoctors(filtered)
  }

  const handleCreateDoctor = async (data: DoctorFormData) => {
    try {
      await apiService.inviteDoctor({
        nombreCompleto: data.nombre,
        email: data.correo!,
        rol: "medico",
      })
      
      alert("Invitación enviada exitosamente")
    } catch (error) {
      console.error("Error al invitar médico:", error);
      alert("Error al enviar invitación")
    }
  }

  const handleUpdateDoctor = async (data: DoctorFormData) => {
  if (!selectedDoctor) return

  try {
    await apiService.updateDoctor(selectedDoctor.idUsuario, {
      nombre: data.nombre,
      status: data.status
    })
    
    showSuccess("Médico actualizado exitosamente")
    setIsModalOpen(false)
    loadDoctors() // Recargar lista
  } catch (error: any) {
    showError(error.message || "Error al actualizar médico")
  }
}

  const handleDeleteDoctor = async (doctor: Doctor) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Médico",
      message: `¿Estás seguro de eliminar al Dr. ${doctor.nombre}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await apiService.deleteDoctor(doctor.idUsuario)
          showSuccess("Médico eliminado exitosamente")
          loadDoctors() // Recargar lista
        } catch (error: any) {
          showError(error.message || "Error al eliminar médico")
        }
      }
    })
  }

  const handleToggleStatus = async (doctor: Doctor) => {
  const newStatus = doctor.status === 'activo' ? 'inactivo' : 'activo'
  const action = newStatus === 'inactivo' ? 'desactivar' : 'activar'
  
  setConfirmModal({
    isOpen: true,
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Médico`,
    message: `¿Estás seguro de ${action} al Dr. ${doctor.nombre}?`,
    onConfirm: async () => {
      try {
        await apiService.toggleDoctorStatus(doctor.idUsuario, doctor.status)
        showSuccess(`Estado cambiado exitosamente`)
        loadDoctors() // Recargar lista
      } catch (error: any) {
        showError(error.message || "Error al cambiar estado")
      }
    }
  })
}

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: "Cerrar Sesión",
      message: "¿Estás seguro de que deseas cerrar sesión?",
      onConfirm: () => {
        adminAuthService.logout()
      }
    })
  }

  const openEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setSelectedDoctor(null)
    setIsEditMode(false)
    setIsModalOpen(true)
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 5000)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(""), 5000)
  }

  const stats = {
    total: doctors.length,
    active: doctors.filter(d => d.status === 'activo').length,
    inactive: doctors.filter(d => d.status === 'inactivo').length
  }

return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Top Header con título y perfil */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Doctors Management
              </h1>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">Dr. {adminName}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold shadow-sm">
                    {adminName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Mensajes */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
              <button onClick={() => setSuccessMessage("")} className="text-green-600 hover:text-green-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-medium">{errorMessage}</p>
              </div>
              <button onClick={() => setErrorMessage("")} className="text-red-600 hover:text-red-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Cards de Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card New Doctor */}
            <div 
              onClick={openCreateModal}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                  <span className="text-lg font-bold">+</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-1">Nuevo Doctor</h3>
              <p className="text-sm font-semibold text-gray-900 mb-1">Registrar</p>
              <p className="text-xs text-gray-500">Añade a un nuevo doctor al sistema</p>
            </div>

            {/* Card Total Doctors */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-7 h-7 text-purple-600" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.total}</h3>
              <p className="text-sm font-semibold text-gray-900 mb-1">Total de Doctores</p>
              <p className="text-xs text-gray-500">Todos los doctores registrados</p>
            </div>

            {/* Card Active */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.active}</h3>
              <p className="text-sm font-semibold text-gray-900 mb-1">Activos</p>
              <p className="text-xs text-gray-500">Doctores actuales activos</p>
            </div>

            {/* Card Inactive */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                  <Activity className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.inactive}</h3>
              <p className="text-sm font-semibold text-gray-900 mb-1">Inactivos</p>
              <p className="text-xs text-gray-500">Cuentas de doctores inactivos</p>
            </div>
          </div>

          {/* Búsqueda y Filtros */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar doctores por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                />
              </div>

              <div className="flex gap-3">
                <div className="relative min-w-[140px]">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="appearance-none w-full px-5 py-3 pr-10 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white cursor-pointer text-sm font-medium text-gray-700"
                  >
                    <option value="todos">All Status</option>
                    <option value="activo">Active</option>
                    <option value="inactivo">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {(searchQuery || filterStatus !== "todos") && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setFilterStatus("todos")
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all text-sm font-medium whitespace-nowrap"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Doctors Catalog */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Doctors Catalog ({filteredDoctors.length} found)
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-600">Cargando médicos...</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {searchQuery || filterStatus !== "todos" 
                    ? "No se encontraron médicos" 
                    : "No hay médicos registrados"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterStatus !== "todos"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Comienza registrando tu primer médico"}
                </p>
                {!searchQuery && filterStatus === "todos" && (
                  <button
                    onClick={openCreateModal}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors inline-flex items-center gap-2 font-medium"
                  >
                    <UserPlus className="w-5 h-5" />
                    Registrar Primer Médico
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                        Doctor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/3">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDoctors.map((doctor) => (
                      <tr key={doctor.idUsuario} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 w-1/4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                              {doctor.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                Dr. {doctor.nombre}
                              </p>
                              {doctor.fechaNacimiento && (
                                <p className="text-xs text-gray-500">{doctor.fechaNacimiento}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 w-1/3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <p className="text-sm text-gray-900 truncate">{doctor.correo}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 w-1/6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            doctor.status === 'activo'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {doctor.status === 'activo' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 w-1/4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(doctor)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(doctor)}
                              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDoctor(null)
          setIsEditMode(false)
        }}
        onSubmit={isEditMode ? handleUpdateDoctor : handleCreateDoctor}
        doctor={selectedDoctor || undefined}
        isEditMode={isEditMode}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.title.includes("Eliminar")}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  )
}

export default withAuth(AdminDashboard)