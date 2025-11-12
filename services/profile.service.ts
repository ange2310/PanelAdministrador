// services/profile.service.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.devcorebits.com';

export const profileService = {
  /**
   * Obtiene la URL de la foto de perfil de un usuario
   * @param userId - ID del usuario
   * @returns URL de la foto de perfil
   */
  getProfilePhotoUrl(userId: string): string {
    return `${API_URL}/api/usuarios/${userId}/foto`;
  },

  /**
   * Sube una nueva foto de perfil
   * @param userId - ID del usuario
   * @param file - Archivo de imagen
   * @returns Promise con la respuesta del servidor
   */
  async uploadProfilePhoto(userId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_URL}/api/usuarios/${userId}/foto`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
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
   * @returns Promise con la respuesta del servidor
   */
  async deleteProfilePhoto(userId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/usuarios/${userId}/foto`, {
      method: 'DELETE',
      credentials: 'include',
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
   * @returns Promise con los datos actualizados
   */
  async updateProfile(userId: string, data: {
    nombre?: string;
    telefono?: string;
    direccion?: string;
  }): Promise<any> {
    const response = await fetch(`${API_URL}/api/usuarios/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
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
  }
};