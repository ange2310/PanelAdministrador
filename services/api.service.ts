/**
 * Servicio API Centralizado con Autenticación
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
   * Crear nuevo médico
   */
  async createDoctor(data: CreateDoctorDto): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/crearUsuario`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          nombre: data.nombre,
          fechaNacimiento: data.fechaNacimiento,
          status: data.status || 'activo',
          correo: data.correo,
          contrasenia: data.contrasenia,
          rol: 'medico', // Siempre médico
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear médico')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error en createDoctor:', error)
      throw new Error(error.message || 'Error al crear médico')
    }
  }

  /**
   * Listar todos los médicos
   */
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/buscarUsuarios`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Error al listar médicos')
      }

      const data = await response.json()
      
      // Filtrar solo los médicos
      const doctors = data.usuarios?.filter((user: any) => user.rol === 'medico') || []
      return doctors
    } catch (error: any) {
      console.error('Error en getAllDoctors:', error)
      throw error
    }
  }

  /**
   * Obtener médico por ID
   */
  async getDoctorById(doctorId: string): Promise<Doctor> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/usuarios-autenticacion/buscarUsuario/${doctorId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error('Error al obtener médico')
      }

      const data = await response.json()
      return data.usuarios?.[0]
    } catch (error: any) {
      console.error('Error en getDoctorById:', error)
      throw error
    }
  }

  /**
   * Actualizar médico
   */
  async updateDoctor(doctorId: string, data: UpdateDoctorDto): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/usuarios-autenticacion/actualizarPerfil/${doctorId}`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al actualizar médico')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error en updateDoctor:', error)
      throw error
    }
  }

  /**
   * Eliminar médico
   */
  async deleteDoctor(doctorId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/usuarios-autenticacion/borrarPerfil/${doctorId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al eliminar médico')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error en deleteDoctor:', error)
      throw error
    }
  }

  /**
   * Cambiar estado del médico
   */
  async toggleDoctorStatus(doctorId: string, currentStatus: string): Promise<any> {
    const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo'
    return this.updateDoctor(doctorId, { status: newStatus })
  }
  //Método de invitar doctor
  async inviteDoctor(data: { nombreCompleto: string; email: string; rol: string }) {
  try {
    const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/crearInvitacion`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        nombreCompleto: data.nombreCompleto,
        email:data.email,
        rol: data.rol,
        idMedico:null //es null porque el admin invita médicos
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      //const error = await response.json()
      throw new Error(result.message || 'Error al invitar médico')
    }
    return result

    //return await response.json()
  } catch (error: any) {
    console.error('Error en inviteDoctor:', error)
    throw new Error(error.message || 'Error al invitar médico')
  }
}
//Método para verificar invitación
async verificarInvitacion(token: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/usuarios-autenticacion/verificarToken?token=${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Acept' : 'application/json',
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Token inválido o expirado')
      }

      const data = await response.json()
      console.log('Token valido:', data)

      return{
        email: data.invitacon.correo,
        rol:data.invitacion.rol,
        nombreCompleto: data.invitacion.nombreCompleto,
        //idMedico: data.invitacion.idMedico ||undefined
      }

      
    } catch (error: any) {
      console.error('Error en verificarInvitacion:', error)
      throw new Error(error.message || 'Token inválido')
    }
  }

/**
   * Registrar médico (completar registro después de invitación)
   */
  async registrarMedico(data: {
    nombre: string
    fechaNacimiento?: string
    correo: string
    contrasenia: string
    rol: string
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/signUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al completar registro')
      }

      return result
    } catch (error: any) {
      console.error('Error en registrarMedico:', error)
      throw new Error(error.message || 'Error al completar registro')
    }
  }

}

export const apiService = new ApiService()