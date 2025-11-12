"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Edit, 
  Camera,
  Key,
  Shield,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react"
import { adminAuthService } from "@/services/auth.service"
import { profileService } from "@/services/profile.service"
import { ProfileEditModal } from "@/app/components/profile-edit-modal"
import { Button } from "@/components/ui/button"

interface UserProfile {
  idUsuario: string
  nombre: string
  correo: string
  fechaNacimiento?: string
  rol: string
  status: string
  photoUrl?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now())

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      // Usar getSession() en lugar de await getSession()
      const session = adminAuthService.getSession()
      
      if (!session) {
        router.push('/authentication/login')
        return
      }

      const token = session.accessToken
      if (!token) throw new Error('No hay token')

      // Obtener datos del usuario
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios-autenticacion/buscarUsuario/${session.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error('Error al cargar perfil')

      const data = await response.json()
      const userData = data.usuarios?.[0]

      if (userData) {
        setProfile({
          idUsuario: userData.idUsuario,
          nombre: userData.nombre,
          correo: userData.correo,
          fechaNacimiento: userData.fechaNacimiento,
          rol: userData.rol,
          status: userData.status,
          photoUrl: profileService.getProfilePhotoUrl(userData.idUsuario, photoTimestamp)
        })
      }
    } catch (error: any) {
      console.error('Error al cargar perfil:', error)
      showError('Error al cargar información del perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showError('Por favor selecciona una imagen válida (JPG, PNG, GIF)')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('La imagen no debe superar 5MB')
      return
    }

    setIsUploadingPhoto(true)
    
    try {
      // Usar getAccessToken() sin await
      const token = adminAuthService.getAccessToken()
      if (!token) throw new Error('No hay token')

      await profileService.uploadProfilePhoto(profile.idUsuario, file, token)
      
      // Actualizar timestamp para forzar recarga de imagen
      setPhotoTimestamp(Date.now())
      showSuccess('Foto de perfil actualizada correctamente')
      
      // Recargar perfil
      setTimeout(() => loadProfile(), 500)
    } catch (error: any) {
      console.error('Error al subir foto:', error)
      showError(error.message || 'Error al subir foto de perfil')
    } finally {
      setIsUploadingPhoto(false)
      // Limpiar input
      event.target.value = ''
    }
  }

  const handleDeletePhoto = async () => {
    if (!profile) return
    
    if (!confirm('¿Estás seguro de que deseas eliminar tu foto de perfil?')) {
      return
    }

    setIsDeletingPhoto(true)
    
    try {
      const token = adminAuthService.getAccessToken()
      if (!token) throw new Error('No hay token')

      await profileService.deleteProfilePhoto(profile.idUsuario, token)
      
      setPhotoTimestamp(Date.now())
      showSuccess('Foto de perfil eliminada correctamente')
      await loadProfile()
    } catch (error: any) {
      console.error('Error al eliminar foto:', error)
      showError(error.message || 'Error al eliminar foto de perfil')
    } finally {
      setIsDeletingPhoto(false)
    }
  }

  const handleUpdateProfile = async () => {
    showSuccess('Perfil actualizado correctamente')
    
    // Refrescar datos de sesión
    //await adminAuthService.refreshUserData()
    
    await loadProfile()
    setIsEditModalOpen(false)
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setErrorMessage("")
    setTimeout(() => setSuccessMessage(""), 5000)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setSuccessMessage("")
    setTimeout(() => setErrorMessage(""), 5000)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada'
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const calculateAge = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return null
    try {
      const birthDate = new Date(fechaNacimiento)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch {
      return null
    }
  }

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'medico': return 'bg-blue-100 text-blue-700'
      case 'paciente': return 'bg-purple-100 text-purple-700'
      case 'cuidador': return 'bg-green-100 text-green-700'
      case 'administrador': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getInitials = (name: string) => {
    const names = name.trim().split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold mb-2">Error al cargar perfil</p>
          <Button onClick={() => router.back()} variant="outline">
            Volver
          </Button>
        </div>
      </div>
    )
  }

  const age = calculateAge(profile.fechaNacimiento)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Mensajes */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Header con Botón Volver */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          
          {/* Header del Perfil */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-8 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              
              {/* Foto de Perfil */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-4xl overflow-hidden relative">
                    <img
                      src={profile.photoUrl}
                      alt={profile.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.style.display = 'none'
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = 'flex'
                        }
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                      {getInitials(profile.nombre)}
                    </span>
                  </div>
                </div>
                
                {/* Botones Foto */}
                <div className="absolute bottom-0 right-0 flex gap-1">
                  <label
                    htmlFor="photo-upload"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-lg border-2 border-purple-600"
                    title="Cambiar foto"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-purple-600" />
                    )}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handlePhotoChange}
                    disabled={isUploadingPhoto || isDeletingPhoto}
                    className="hidden"
                  />
                  
                  <button
                    onClick={handleDeletePhoto}
                    disabled={isUploadingPhoto || isDeletingPhoto}
                    className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg border-2 border-white disabled:opacity-50"
                    title="Eliminar foto"
                  >
                    {isDeletingPhoto ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Información Principal */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.nombre}
                </h1>
                <p className="text-purple-100 mb-4">{profile.correo}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getRoleBadgeColor(profile.rol)}`}>
                    {profile.rol.charAt(0).toUpperCase() + profile.rol.slice(1)}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    profile.status === 'activo' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {profile.status === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Botón Editar */}
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-white text-purple-600 hover:bg-purple-50 rounded-xl shadow-lg"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          </div>

          {/* Información Detallada */}
          <div className="p-8 space-y-6">
            
            {/* Información Personal */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Información Personal
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Correo Electrónico</p>
                      <p className="text-sm font-semibold text-gray-900 break-all">{profile.correo}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Fecha de Nacimiento</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(profile.fechaNacimiento)}
                        {age && <span className="text-gray-500 ml-2">({age} años)</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Seguridad
              </h2>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Contraseña</p>
                      <p className="text-xs text-gray-500">••••••••••</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                  >
                    Cambiar
                  </Button>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Información de Cuenta
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 mb-1">ID de Usuario</p>
                      <p className="text-sm font-mono text-gray-900">{profile.idUsuario}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Tipo de Cuenta</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{profile.rol}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {isEditModalOpen && (
        <ProfileEditModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onSuccess={handleUpdateProfile}
        />
      )}
    </div>
  )
}