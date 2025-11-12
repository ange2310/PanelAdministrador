// services/auth.service.ts
/**
 * Servicio de Autenticación
 * Incluye servicios para usuarios normales y administradores
 */

interface UserSession {
  userId: string
  email: string
  nombre: string
  rol: string
  accessToken: string
  refreshToken?: string
}

interface AdminSession {
  userId: string
  email: string
  nombre: string
  rol: string
  accessToken: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.devcorebits.com'

// ==========================================
// SERVICIO DE AUTENTICACIÓN GENERAL
// ==========================================
class AuthService {
  private readonly SESSION_KEY = 'userSession'
  private readonly ACCESS_TOKEN_KEY = 'accessToken'
  private readonly REFRESH_TOKEN_KEY = 'refreshToken'

  /**
   * Obtener token de acceso
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    
    const session = this.getSession()
    if (session?.accessToken) return session.accessToken
    
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  /**
   * Obtener token de acceso de forma asíncrona
   */
  async getAccessTokenAsync(): Promise<string | null> {
    return this.getAccessToken()
  }

  /**
   * Guardar token de acceso
   */
  setAccessToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token)
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    
    const session = this.getSession()
    if (session?.refreshToken) return session.refreshToken
    
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * Guardar refresh token
   */
  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
  }

  /**
   * Obtener sesión actual
   */
  getSession(): UserSession | null {
    if (typeof window === 'undefined') return null

    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY)
      if (!sessionStr) return null

      return JSON.parse(sessionStr) as UserSession
    } catch (error) {
      console.error('Error al obtener sesión:', error)
      return null
    }
  }

  /**
   * Guardar sesión
   */
  setSession(session: UserSession): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
    
    if (session.accessToken) {
      this.setAccessToken(session.accessToken)
    }
    if (session.refreshToken) {
      this.setRefreshToken(session.refreshToken)
    }
  }

  /**
   * Iniciar sesión (usuarios normales)
   */
  async login(email: string, password: string): Promise<UserSession> {
    try {
      const response = await fetch(`${API_URL}/api/usuarios-autenticacion/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Credenciales inválidas')
      }

      const data = await response.json()

      if (!data.ok) {
        throw new Error('Error al iniciar sesión')
      }

      // Obtener datos del usuario
      const userResponse = await fetch(
        `${API_URL}/api/usuarios-autenticacion/buscarUsuario/${data.user_id}`,
        {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!userResponse.ok) {
        throw new Error('Error al obtener datos del usuario')
      }

      const userData = await userResponse.json()
      const usuario = userData.usuarios?.[0]

      if (!usuario) {
        throw new Error('No se encontró el usuario')
      }

      const session: UserSession = {
        userId: data.user_id,
        email: email,
        nombre: usuario.nombre || 'Usuario',
        rol: usuario.rol,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      }

      this.setSession(session)
      return session
    } catch (error: any) {
      console.error('Error en login:', error)
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(this.SESSION_KEY)
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    
    window.location.href = '/app/login'
  }

  /**
   * Limpiar tokens
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null
  }

  /**
   * Refrescar token de acceso
   */
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No hay refresh token')
    }

    const response = await fetch(`${API_URL}/api/usuarios-autenticacion/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      this.clearTokens()
      throw new Error('Error al refrescar token')
    }

    const data = await response.json()
    this.setAccessToken(data.accessToken)
    
    const session = this.getSession()
    if (session) {
      session.accessToken = data.accessToken
      this.setSession(session)
    }
    
    return data.accessToken
  }
}

// ==========================================
// SERVICIO DE AUTENTICACIÓN PARA ADMINISTRADORES
// ==========================================
class AdminAuthService {
  private readonly SESSION_KEY = 'adminSession'

  /**
   * Iniciar sesión como administrador
   */
  async login(email: string, password: string): Promise<AdminSession> {
    try {
      console.log('🚀 Iniciando login de administrador...')
      console.log('📧 Email:', email)
      console.log('🔗 API URL:', API_URL)
      console.log('🌐 Endpoint completo:', `${API_URL}/api/usuarios-autenticacion/login`)
      
      const response = await fetch(`${API_URL}/api/usuarios-autenticacion/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error('Credenciales inválidas')
      }

      const data = await response.json()
      console.log('✅ Login data recibida')

      if (!data.ok) {
        throw new Error('Error al iniciar sesión')
      }

      // Obtener datos del usuario
      console.log('🔍 Obteniendo datos del usuario...')
      
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

      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('❌ Error al obtener usuario:', errorText)
        throw new Error('Error al obtener datos del usuario')
      }

      const userData = await userResponse.json()
      const usuario = userData.usuarios?.[0]
      
      console.log('👤 Usuario encontrado')
      console.log('🔑 Rol del usuario:', usuario?.rol)

      if (!usuario) {
        throw new Error('No se encontró el usuario')
      }

      // ⚠️ VALIDACIÓN CRÍTICA: Verificar que sea administrador
      if (usuario.rol !== 'administrador') {
        console.error('❌ Acceso denegado. Rol:', usuario.rol)
        throw new Error(`No tienes permisos de administrador. Tu rol actual es: "${usuario.rol}"`)
      }

      const session: AdminSession = {
        userId: data.user_id,
        email: email,
        nombre: usuario.nombre || 'Admin',
        rol: usuario.rol,
        accessToken: data.access_token,
      }

      console.log('💾 Guardando sesión de administrador')

      // Guardar sesión
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      }

      console.log('🎉 Login de administrador completado exitosamente')
      return session
    } catch (error: any) {
      console.error('💥 Error en login de administrador:', error)
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  /**
   * Cerrar sesión de administrador
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY)
      window.location.href = '/'
    }
  }

  /**
   * Obtener sesión actual de administrador
   */
  getSession(): AdminSession | null {
    if (typeof window === 'undefined') return null

    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY)
      if (!sessionStr) return null

      return JSON.parse(sessionStr) as AdminSession
    } catch (error) {
      console.error('Error al obtener sesión de administrador:', error)
      return null
    }
  }

  /**
   * Obtener token de acceso de administrador
   */
  getAccessToken(): string | null {
    const session = this.getSession()
    return session?.accessToken || null
  }

  /**
   * Verificar si está autenticado como administrador
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null
  }
}

// ==========================================
// EXPORTACIONES
// ==========================================
export const authService = new AuthService()
export const adminAuthService = new AdminAuthService()