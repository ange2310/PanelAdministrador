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
  LogOut
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
      await loadDoctors()
    } catch (error: any) {
      throw new Error(error.message || "Error al actualizar médico")
    }
  }

  const handleDeleteDoctor = async (doctor: Doctor) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Médico",
      message: `¿Estás seguro de que deseas eliminar al Dr. ${doctor.nombre}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await apiService.deleteDoctor(doctor.idUsuario)
          showSuccess("Médico eliminado exitosamente")
          await loadDoctors()
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
      message: `¿Estás seguro de que deseas ${action} al Dr. ${doctor.nombre}?`,
      onConfirm: async () => {
        try {
          await apiService.toggleDoctorStatus(doctor.idUsuario, doctor.status)
          showSuccess(`Médico ${action}do exitosamente`)
          await loadDoctors()
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header con nombre y logout */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Panel de Administración
              </h1>
              <p className="text-slate-600 mt-1">
                Bienvenido, {adminName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>

          {/* Mensajes */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Cards de Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Total Médicos</h3>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Activos</h3>
                <p className="text-2xl font-bold text-slate-800">{stats.active}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Inactivos</h3>
                <p className="text-2xl font-bold text-slate-800">{stats.inactive}</p>
              </div>
            </div>

            <div 
              onClick={openCreateModal}
              className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Registrar</h3>
                <p className="text-sm text-slate-600">Nuevo médico</p>
              </div>
            </div>
          </div>

          {/* Carrusel */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl overflow-hidden relative">
              <div className="relative">
                <div className="flex transition-transform duration-300">
                  <div className="w-full flex-shrink-0 h-48 flex items-center justify-center">
                    <div className="text-center px-6">
                      <h3 className="text-xl font-semibold text-purple-800 mb-2">
                        Gestión de Médicos
                      </h3>
                      <p className="text-purple-700">
                        Administra los perfiles de médicos del sistema
                      </p>
                    </div>
                  </div>
                </div>
                
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Búsqueda y Filtros */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>

              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="appearance-none px-6 py-3 pr-12 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white cursor-pointer font-medium"
                >
                  <option value="todos">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Lista de Médicos */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center border border-slate-200">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600">Cargando médicos...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
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
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-flex items-center gap-2 font-medium"
                >
                  <UserPlus className="w-5 h-5" />
                  Registrar Primer Médico
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.idUsuario}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {doctor.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {doctor.nombre}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          doctor.status === 'activo'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            doctor.status === 'activo' ? 'bg-green-600' : 'bg-gray-600'
                          }`} />
                          {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{doctor.correo}</span>
                    </div>
                    {doctor.edad && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{doctor.edad} años</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(doctor)}
                      className="flex-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(doctor)}
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center text-sm ${
                        doctor.status === 'activo'
                          ? 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          : 'bg-green-50 hover:bg-green-100 text-green-700'
                      }`}
                      title={doctor.status === 'activo' ? 'Desactivar' : 'Activar'}
                    >
                      {doctor.status === 'activo' ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors flex items-center justify-center text-sm"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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