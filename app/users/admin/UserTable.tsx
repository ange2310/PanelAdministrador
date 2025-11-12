"use client"

import { useState, useEffect } from "react"
import { 
  Search,
  ChevronDown,
  Mail,
  Loader2,
  X,
  Trash2,
  User,
  Users,
  CheckCircle,
  XCircle
} from "lucide-react"
import { apiService } from "@/services/api.service"
import ConfirmModal from "@/components/admin/ConfirmModal"

interface UserProfile {
  idUsuario: string
  nombre: string
  correo: string
  rol: string
  status: string
  fechaNacimiento?: string
  avatarUrl?: string
}

export default function UsersTable() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("todos")
  const [filterStatus, setFilterStatus] = useState<"todos" | "activo" | "inactivo">("todos")
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, filterRole, filterStatus])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await apiService.getAllUsers()
      setUsers(data)
    } catch (error: any) {
      showError(error.message || "Error al cargar usuarios")
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user => 
        user.nombre.toLowerCase().includes(query) ||
        user.correo.toLowerCase().includes(query) ||
        user.rol.toLowerCase().includes(query)
      )
    }

    if (filterRole !== "todos") {
      filtered = filtered.filter(user => user.rol === filterRole)
    }

    if (filterStatus !== "todos") {
      filtered = filtered.filter(user => user.status === filterStatus)
    }

    setFilteredUsers(filtered)
  }

  const handleDeactivateUser = async (user: UserProfile) => {
    setConfirmModal({
      isOpen: true,
      title: "Desactivar Usuario",
      message: `Se desactivará permanentemente la cuenta de ${user.nombre}. Esta acción no se puede revertir.`,
      onConfirm: async () => {
        try {
          await apiService.deactivateUser(user.idUsuario)
          showSuccess("Usuario desactivado exitosamente")
          loadUsers()
        } catch (error: any) {
          showError(error.message || "Error al desactivar usuario")
        }
      }
    })
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 5000)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(""), 5000)
  }

  const getRoleBadgeColor = (rol: string) => {
    switch(rol) {
      case 'medico': return 'bg-blue-100 text-blue-700'
      case 'paciente': return 'bg-green-100 text-green-700'
      case 'cuidador': return 'bg-purple-100 text-purple-700'
      case 'administrador': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'activo').length,
    inactive: users.filter(u => u.status === 'inactivo').length,
    medicos: users.filter(u => u.rol === 'medico').length,
    pacientes: users.filter(u => u.rol === 'paciente').length,
    cuidadores: users.filter(u => u.rol === 'cuidador').length,
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.total}</h3>
          <p className="text-sm font-semibold text-gray-900 mb-1">Total Usuarios</p>
          <p className="text-xs text-gray-500">Todos los roles</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.medicos}</h3>
          <p className="text-sm font-semibold text-gray-900 mb-1">Médicos</p>
          <p className="text-xs text-gray-500">Profesionales registrados</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.pacientes}</h3>
          <p className="text-sm font-semibold text-gray-900 mb-1">Pacientes</p>
          <p className="text-xs text-gray-500">Usuarios registrados</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.inactive}</h3>
          <p className="text-sm font-semibold text-gray-900 mb-1">Desactivados</p>
          <p className="text-xs text-gray-500">Cuentas inactivas</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative min-w-[140px]">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="appearance-none w-full px-5 py-3 pr-10 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white cursor-pointer text-sm font-medium text-gray-700"
              >
                <option value="todos">Todos los Roles</option>
                <option value="medico">Médicos</option>
                <option value="paciente">Pacientes</option>
                <option value="cuidador">Cuidadores</option>
                <option value="administrador">Administradores</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[140px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="appearance-none w-full px-5 py-3 pr-10 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white cursor-pointer text-sm font-medium text-gray-700"
              >
                <option value="todos">Todos los Estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {(searchQuery || filterRole !== "todos" || filterStatus !== "todos") && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setFilterRole("todos")
                  setFilterStatus("todos")
                }}
                className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all text-sm font-medium whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Todos los Usuarios ({filteredUsers.length} encontrados)
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.idUsuario} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.nombre}</p>
                          {user.fechaNacimiento && <p className="text-xs text-gray-500">{user.fechaNacimiento}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-900 truncate">{user.correo}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.rol)}`}>
                        {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.status === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'activo' && user.rol !== 'administrador' ? (
                          <button
                            onClick={() => handleDeactivateUser(user)}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                            title="Desactivar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Desactivar
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 italic px-3 py-2">
                            {user.rol === 'administrador' ? 'Protegido' : 'Desactivado'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={true}
        confirmText="Desactivar"
        cancelText="Cancelar"
      />
    </div>
  )
}