"use client"

export default function AdminFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Información de Contacto */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Información de Contacto</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>+57 310 101 1010</p>
                <p>contacto@douremember.com</p>
                <p>UAO, CALI</p>
              </div>
            </div>

            {/* Horarios de Atención */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Horarios de Atención</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>
                <p>Sábados: 9:00 AM - 2:00 PM</p>
                <p>Domingos: Cerrado</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Aplicación Proyecto Informático - Universidad Autónoma de Occidente © 2025.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}