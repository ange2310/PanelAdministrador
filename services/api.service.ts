import { adminAuthService } from './auth.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.devcorebits.com'

export interface CreateDoctorDto {
  nombre: string
  fechaNacimiento?: string
  correo: string
  contrasenia: string
  rol: 'medico'
  status?: string
}

export interface UpdateDoctorDto {
  nombre?: string
  fechaNacimiento?: string
  status?: string
}

export interface Doctor {
  idUsuario: string
  nombre: string
  fechaNacimiento?: string
  correo: string
  rol: string
  status: string
  created_at?: string
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_URL
  }

  private getAuthHeaders(): HeadersInit {
    const token = adminAuthService.getAccessToken()
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      let errorMessage = 'Error en la solicitud'
      
      try {
        const errorData = await response.json()
        console.error('Error del servidor:', errorData)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        try {
          const errorText = await response.text()
          console.error('Error del servidor texto:', errorText)
          if (errorText) errorMessage = errorText
        } catch (e2) {
          console.error('No se pudo leer el error')
        }
      }
      
      throw new Error(errorMessage)
    }
    
    return response.json()
  }

  async getAllDoctors(): Promise<Doctor[]> {
    try {
      console.log('Obteniendo lista de médicos...')
      
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/buscarUsuarios`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await this.handleResponse(response)
      const doctors = data.usuarios?.filter((user: any) => user.rol === 'medico') || []
      console.log(`${doctors.length} médicos encontrados`)
      
      return doctors
    } catch (error: any) {
      console.error('Error en getAllDoctors:', error)
      throw error
    }
  }

  async getDoctorById(doctorId: string): Promise<Doctor> {
    try {
      console.log('Obteniendo médico ID:', doctorId)
      
      const response = await fetch(
        `${this.baseUrl}/api/usuarios-autenticacion/buscarUsuario/${doctorId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      )

      const data = await this.handleResponse(response)
      return data.usuarios?.[0]
    } catch (error: any) {
      console.error('Error en getDoctorById:', error)
      throw error
    }
  }

  async updateDoctor(doctorId: string, data: UpdateDoctorDto): Promise<any> {
    console.warn('ADVERTENCIA: El backend no soporta actualización de perfil')
    console.log('Solo se puede cambiar estado a inactivo')
    
    if (data.status === 'inactivo') {
      return this.toggleDoctorStatus(doctorId, 'activo')
    }
    
    throw new Error('El backend solo permite desactivar usuarios, no editar otros campos')
  }

  async deleteDoctor(doctorId: string): Promise<any> {
    console.warn('ADVERTENCIA: El backend no soporta eliminación')
    console.log('En su lugar, desactivando cuenta...')
    
    try {
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/cuentaInactiva`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId: doctorId }),
      })

      const result = await this.handleResponse(response)
      console.log('Cuenta desactivada exitosamente')
      
      return result
    } catch (error: any) {
      console.error('Error en deleteDoctor:', error)
      throw error
    }
  }

  async toggleDoctorStatus(doctorId: string, currentStatus: string): Promise<any> {
    if (currentStatus === 'activo') {
      try {
        console.log('Desactivando cuenta...')
        
        const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/cuentaInactiva`, {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ userId: doctorId }),
        })

        const result = await this.handleResponse(response)
        return result
      } catch (error: any) {
        console.error('Error al cambiar estado:', error)
        throw error
      }
    } else {
      throw new Error('El backend solo permite desactivar usuarios, no reactivarlos')
    }
  }

  async inviteDoctor(data: { nombreCompleto: string; email: string; rol: string }) {
    try {
      console.log('Enviando invitación a:', data.email)
      
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/crearInvitacion`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          nombreCompleto: data.nombreCompleto,
          email: data.email,
          rol: data.rol,
          idMedico: null
        }),
      })

      const result = await this.handleResponse(response)
      console.log('Invitación enviada exitosamente')
      
      return result
    } catch (error: any) {
      console.error('Error en inviteDoctor:', error)
      throw error
    }
  }

  async verificarInvitacion(token: string) {
    try {
      console.log('Verificando token de invitación...')
      
      const response = await fetch(
        `${this.baseUrl}/api/usuarios-autenticacion/verificarToken?token=${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      const data = await this.handleResponse(response)
      console.log('Token válido:', data)

      return {
        email: data.invitacion?.correo || data.invitacion?.email,
        rol: data.invitacion?.rol,
        nombreCompleto: data.invitacion?.nombreCompleto,
      }
    } catch (error: any) {
      console.error('Error en verificarInvitacion:', error)
      throw error
    }
  }

  async registrarMedico(data: {
    nombre: string
    fechaNacimiento?: string
    correo: string
    contrasenia: string
    rol: string
  }) {
    try {
      console.log('Registrando médico:', data.correo)
      
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/signUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await this.handleResponse(response)
      console.log('Médico registrado exitosamente')
      
      return result
    } catch (error: any) {
      console.error('Error en registrarMedico:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()