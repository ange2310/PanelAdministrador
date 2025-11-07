/**
 * Servicio de Autenticación para Admin
 */

interface AdminSession {
  userId: string
  email: string
  nombre: string
  rol: string
  accessToken: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class AdminAuthService {
  private readonly SESSION_KEY = 'adminSession'

  /**
   * Iniciar sesión
   */
  async login(email: string, password: string): Promise<AdminSession> {
    try {
      console.log('🚀 Iniciando login...')
      
      const response = await fetch(`${API_URL}/api/usuarios-autenticacion/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)

      if (!response.ok) {
        throw new Error('Credenciales inválidas')
      }

      const data = await response.json()
      console.log('✅ Login data:', data)

      if (!data.ok) {
        throw new Error('Error al iniciar sesión')
      }

      // Obtener datos del usuario
      console.log('🔍 Buscando usuario con ID:', data.user_id)
      
      const userResponse = await fetch(
        `${API_URL}/api/usuarios-autenticacion/buscarUsuario/${data.user_id}`,
        {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('📡 User response status:', userResponse.status)
      console.log('📡 User response ok:', userResponse.ok)

      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('❌ Error response:', errorText)
        throw new Error('Error al obtener datos del usuario')
      }

      const userData = await userResponse.json()
      console.log('👤 User data:', userData)
      
      const usuario = userData.usuarios?.[0]
      console.log('👤 Usuario encontrado:', usuario)
      console.log('🔑 ROL del usuario:', usuario.rol)

      if (!usuario) {
        throw new Error('No se encontró el usuario')
      }

      // Verificar que sea administrador
      if (usuario.rol !== 'administrador') {
        throw new Error(`No tienes permisos de administrador. Tu rol actual es: "${usuario.rol}"`)
      }

      const session: AdminSession = {
        userId: data.user_id,
        email: email,
        nombre: usuario.nombre || 'Admin',
        rol: usuario.rol,
        accessToken: data.access_token,
      }

      console.log('💾 Guardando sesión:', session)

      // Guardar sesión
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      }

      console.log('🎉 Login completado exitosamente!')
      return session
    } catch (error: any) {
      console.error('💥 Error en login:', error)
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY)
      window.location.href = '/loginPage'
    }
  }

  /**
   * Obtener sesión actual
   */
  getSession(): AdminSession | null {
    if (typeof window === 'undefined') return null

    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY)
      if (!sessionStr) return null

      return JSON.parse(sessionStr) as AdminSession
    } catch (error) {
      console.error('Error al obtener sesión:', error)
      return null
    }
  }

  /**
   * Obtener token de acceso
   */
  getAccessToken(): string | null {
    const session = this.getSession()
    return session?.accessToken || null
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null
  }
}

export const adminAuthService = new AdminAuthService()

