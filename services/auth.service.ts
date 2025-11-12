// services/auth.service.ts
// Servicio de autenticación genérico para usuarios normales

interface UserSession {
  userId: string
  email: string
  nombre: string
  rol: string
  accessToken: string
  refreshToken?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.devcorebits.com'

class AuthService {
  private readonly SESSION_KEY = 'userSession'
  private readonly ACCESS_TOKEN_KEY = 'accessToken'
  private readonly REFRESH_TOKEN_KEY = 'refreshToken'

  /**
   * Obtener token de acceso
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    
    // Intentar obtener de la sesión primero
    const session = this.getSession()
    if (session?.accessToken) return session.accessToken
    
    // Fallback a localStorage directo
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
    
    // También guardar tokens por separado para acceso rápido
    if (session.accessToken) {
      this.setAccessToken(session.accessToken)
    }
    if (session.refreshToken) {
      this.setRefreshToken(session.refreshToken)
    }
  }

  /**
   * Iniciar sesión
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
    
    window.location.href = '/login'
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
    
    // Actualizar sesión con nuevo token
    const session = this.getSession()
    if (session) {
      session.accessToken = data.accessToken
      this.setSession(session)
    }
    
    return data.accessToken
  }
}

export const authService = new AuthService()
export const adminAuthService = authService 