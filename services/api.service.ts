/**
 * Servicio API Centralizado con Autenticación
 * ADAPTADO al backend actual (no implementado completamente)
 */

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

  /**
   * Obtener headers con autenticación
   */
  private getAuthHeaders(): HeadersInit {
    const token = adminAuthService.getAccessToken()
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  /**
   * Manejar errores de respuesta
   */
  private async handleResponse(response: Response) {
    if (!response.ok) {
      let errorMessage = 'Error en la solicitud'
      
      try {
        const errorData = await response.json()
        console.error('❌ Error del servidor:', errorData)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        try {
          const errorText = await response.text()
          console.error('❌ Error del servidor (texto):', errorText)
          if (errorText) errorMessage = errorText
        } catch (e2) {
          console.error('❌ No se pudo leer el error')
        }
      }
      
      throw new Error(errorMessage)
    }
    
    return response.json()
  }

  /**
   * ✅ Listar todos los médicos - FUNCIONA
   */
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      console.log('📋 Obteniendo lista de médicos...')
      
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/buscarUsuarios`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await this.handleResponse(response)
      
      // Filtrar solo los médicos
      const doctors = data.usuarios?.filter((user: any) => user.rol === 'medico') || []
      console.log(`✅ ${doctors.length} médicos encontrados`)
      
      return doctors
    } catch (error: any) {
      console.error('💥 Error en getAllDoctors:', error)
      throw error
    }
  }

  /**
   * ✅ Obtener médico por ID - FUNCIONA
   */
  async getDoctorById(doctorId: string): Promise<Doctor> {
    try {
      console.log('🔍 Obteniendo médico ID:', doctorId)
      
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
      console.error('💥 Error en getDoctorById:', error)
      throw error
    }
  }

 /**
 * Actualizar médico - AHORA FUNCIONAL
 */
async updateDoctor(doctorId: string, data: UpdateDoctorDto): Promise<any> {
  try {
    console.log('Actualizando médico ID:', doctorId, 'con datos:', data)
    
    const response = await fetch(
      `${this.baseUrl}/api/usuarios-autenticacion/actualizarPerfil/${doctorId}`,
      {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    )

    const result = await this.handleResponse(response)
    console.log('Médico actualizado exitosamente')
    
    return result
  } catch (error: any) {
    console.error('Error en updateDoctor:', error)
    throw error
  }
}

/**
 * Eliminar médico - AHORA FUNCIONAL
 */
async deleteDoctor(doctorId: string): Promise<any> {
  try {
    console.log('Eliminando médico ID:', doctorId)
    
    const response = await fetch(
      `${this.baseUrl}/api/usuarios-autenticacion/borrarPerfil/${doctorId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      }
    )

    const result = await this.handleResponse(response)
    console.log('Médico eliminado exitosamente')
    
    return result
  } catch (error: any) {
    console.error('Error en deleteDoctor:', error)
    throw error
  }
}

/**
 * Cambiar estado del médico - FUNCIONAL
 */
async toggleDoctorStatus(doctorId: string, currentStatus: string): Promise<any> {
  const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo'
  console.log(`Cambiando estado de ${currentStatus} a ${newStatus}`)
  
  return this.updateDoctor(doctorId, { status: newStatus })
}

  /**
   * ✅ Invitar doctor - FUNCIONA CORRECTAMENTE
   */
  async inviteDoctor(data: { nombreCompleto: string; email: string; rol: string }) {
    try {
      console.log('📧 Enviando invitación a:', data.email)
      
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
      console.log('✅ Invitación enviada exitosamente')
      
      return result
    } catch (error: any) {
      console.error('💥 Error en inviteDoctor:', error)
      throw error
    }
  }

  /**
   * ✅ Verificar invitación - FUNCIONA CORRECTAMENTE
   */
  async verificarInvitacion(token: string) {
    try {
      console.log('🔍 Verificando token de invitación...')
      
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
      console.log('✅ Token válido:', data)

      return {
        email: data.invitacion?.correo || data.invitacion?.email,
        rol: data.invitacion?.rol,
        nombreCompleto: data.invitacion?.nombreCompleto,
      }
    } catch (error: any) {
      console.error('💥 Error en verificarInvitacion:', error)
      throw error
    }
  }

  /**
   * ✅ Registrar médico - FUNCIONA CORRECTAMENTE
   */
  async registrarMedico(data: {
    nombre: string
    fechaNacimiento?: string
    correo: string
    contrasenia: string
    rol: string
  }) {
    try {
      console.log('📝 Registrando médico:', data.correo)
      
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/signUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await this.handleResponse(response)
      console.log('✅ Médico registrado exitosamente')
      
      return result
    } catch (error: any) {
      console.error('💥 Error en registrarMedico:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()
