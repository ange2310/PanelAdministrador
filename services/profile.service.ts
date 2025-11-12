// services/profile.service.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.devcorebits.com';

export const profileService = {
  /**
   * Obtiene la URL de la foto de perfil de un usuario
   * @param userId - ID del usuario
   * @param timestamp - Timestamp opcional para evitar caché
   * @returns URL de la foto de perfil
   */
  getProfilePhotoUrl(userId: string, timestamp?: number): string {
    const baseUrl = `${API_URL}/api/usuarios/${userId}/foto`;
    return timestamp ? `${baseUrl}?t=${timestamp}` : baseUrl;
  },

  /**
   * Sube una nueva foto de perfil
   * @param userId - ID del usuario
   * @param file - Archivo de imagen
   * @param token - Token de autenticación
   * @returns Promise con la respuesta del servidor
   */
  async uploadProfilePhoto(userId: string, file: File, token: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_URL}/api/usuarios/${userId}/foto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir la foto');
    }

    return response.json();
  },

  /**
   * Elimina la foto de perfil
   * @param userId - ID del usuario
   * @param token - Token de autenticación
   * @returns Promise con la respuesta del servidor
   */
  async deleteProfilePhoto(userId: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/usuarios/${userId}/foto`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar la foto');
    }
  },

  /**
   * Actualiza los datos del perfil
   * @param userId - ID del usuario
   * @param data - Datos a actualizar
   * @param token - Token de autenticación (opcional)
   * @returns Promise con los datos actualizados
   */
  async updateProfile(userId: string, data: {
    nombre?: string;
    telefono?: string;
    direccion?: string;
    fechaNacimiento?: string;
  }, token?: string): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/usuarios/${userId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el perfil');
    }

    return response.json();
  },

  /**
   * Obtiene los datos del perfil
   * @param userId - ID del usuario
   * @returns Promise con los datos del perfil
   */
  async getProfile(userId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/usuarios/${userId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener el perfil');
    }

    return response.json();
  },

  /**
   * Actualiza el correo electrónico del usuario
   * @param data - Objeto con el nuevo email
   * @param token - Token de autenticación
   * @returns Promise con la respuesta
   */
  async updateEmail(data: { email: string }, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/usuarios-autenticacion/actualizar-email`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el correo');
    }

    return response.json();
  },

  /**
   * Actualiza la contraseña del usuario
   * @param data - Objeto con la nueva contraseña
   * @param token - Token de autenticación
   * @returns Promise con la respuesta
   */
  async updatePassword(data: { password: string }, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/usuarios-autenticacion/cambiar-contrasena`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar la contraseña');
    }

    return response.json();
  }
};