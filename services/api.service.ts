/**
 * Servicio API Centralizado con Autenticación
 */

import { adminAuthService } from './auth.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface CreateDoctorDto {
  nombre: string
  edad?: number
  correo: string
  contrasenia: string
  rol: 'medico'
  status?: string
}

export interface UpdateDoctorDto {
  nombre?: string
  edad?: number
  status?: string
}

export interface Doctor {
  idUsuario: string
  nombre: string
  edad?: number
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
          edad: data.edad,
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
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al invitar médico')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error en inviteDoctor:', error)
    throw new Error(error.message || 'Error al invitar médico')
  }
}
//Método para verificar invitación
async verificarInvitacion(token: string) {
  const res = await fetch(
    `${this.baseUrl}/usuarios-autenticacion/verificarToken?token=${token}`
  );
  if (!res.ok) throw new Error("Token inválido");
  return res.json();
}



}

export const apiService = new ApiService()