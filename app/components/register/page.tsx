"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { apiService } from "@/services/api.service";

// Tipos para el formulario
interface FormData {
  name: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface InputProps {
  label: string;
  type: string;
  icon?: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder: string;
  disabled: boolean;
}

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline";
  onClick?: () => void;
  disabled: boolean;
  className?: string;
  children: React.ReactNode;
}

// Componente Input reutilizable
const Input = ({ label, type, icon: Icon, value, onChange, error, placeholder, disabled }: InputProps) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-200">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-800 border ${
          error ? 'border-red-500' : 'border-gray-700'
        } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
      />
    </div>
    {error && <p className="text-sm text-red-400">{error}</p>}
  </div>
);

// Componente Button reutilizable
const Button = ({ type = "button", variant = "primary", onClick, disabled, className = "", children }: ButtonProps) => {
  const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "bg-transparent border-2 border-gray-700 hover:border-gray-600 text-white"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Utilidad para combinar clases
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default function RegistroInvitado() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const [estado, setEstado] = useState<"verificando" | "ok" | "invalido">("verificando");
  const [email, setEmail] = useState("");
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setEstado("invalido");
      return;
    }

    const verificar = async () => {
      try {
        const data = await apiService.verificarInvitacion(token);
        console.log("Invitación válida ✅", data);
        setEmail(data.email || "");
        setFormData(prev => ({ 
          ...prev, 
          email: data.email || "",
          role: data.rol || ""
        }));
        setEstado("ok");
      } catch (error) {
        console.error(error);
        setEstado("invalido");
      }
    };

    verificar();
  }, [token]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Información personal";
      case 2: return "Selección de rol";
      case 3: return "Seguridad";
      default: return "";
    }
  };

  const validateStep = () => {
    const newErrors: FormErrors = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
      if (!formData.email.trim()) newErrors.email = "El correo es requerido";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Correo electrónico inválido";
      }
    }
    
    if (currentStep === 2) {
      if (!formData.role) newErrors.general = "Debes seleccionar un rol";
    }
    
    if (currentStep === 3) {
      if (!formData.password) newErrors.password = "La contraseña es requerida";
      else if (formData.password.length < 10) {
        newErrors.password = "Mínimo 10 caracteres";
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = "Debe incluir una mayúscula";
      } else if (!/[!@#$%^&*]/.test(formData.password)) {
        newErrors.password = "Debe incluir un símbolo";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/usuarios-autenticacion/completarRegistro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          nombre: formData.name,
          correo: formData.email,
          contrasenia: formData.password,
          rol: formData.role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al completar el registro');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear la cuenta";
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Estado: Verificando invitación
  if (estado === "verificando") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando invitación...</p>
        </div>
      </div>
    );
  }

  // Estado: Invitación inválida
  if (estado === "invalido") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Invitación Inválida</h2>
          <p className="text-gray-400 mb-6">El enlace de invitación no es válido o ha expirado.</p>
          <Button onClick={() => router.push("/")} disabled={false} className="w-full">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  // Estado: Formulario de registro
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-4">
              <User className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Completa tu Registro</h2>
            <p className="text-gray-400">Paso {currentStep} de {totalSteps}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all",
                    step <= currentStep ? "bg-blue-500" : "bg-gray-700"
                  )}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-2">
              {getStepTitle()}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-500 font-medium">¡Cuenta creada exitosamente!</p>
                <p className="text-green-400 text-sm mt-1">Tu registro ha sido completado.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.general && !success && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Form Steps */}
          <div className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <Input
                  label="Nombre completo"
                  type="text"
                  icon={User}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) {
                      const newErrors = { ...errors };
                      delete newErrors.name;
                      setErrors(newErrors);
                    }
                  }}
                  error={errors.name}
                  placeholder="Juan Pérez"
                  disabled={isLoading || success}
                />

                <Input
                  label="Correo electrónico"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      const newErrors = { ...errors };
                      delete newErrors.email;
                      setErrors(newErrors);
                    }
                  }}
                  error={errors.email}
                  placeholder="tu@correo.com"
                  disabled={isLoading || success || !!email}
                />
              </div>
            )}

            {/* Step 2: Role Selection */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-200">
                    Selecciona tu rol
                  </label>
                  <div className="grid gap-3">
                    {[
                      { value: "paciente", label: "Paciente", desc: "Recibo atención médica" },
                      { value: "cuidador", label: "Cuidador", desc: "Cuido de un paciente" },
                      { value: "medico", label: "Médico", desc: "Proporciono atención" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, role: option.value });
                          if (errors.general) {
                            const newErrors = { ...errors };
                            delete newErrors.general;
                            setErrors(newErrors);
                          }
                        }}
                        disabled={isLoading || success}
                        className={cn(
                          "p-4 border-2 rounded-lg text-left transition-all",
                          "hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
                          formData.role === option.value
                            ? "border-blue-500 bg-blue-500/5"
                            : "border-gray-700 bg-gray-800"
                        )}
                      >
                        <div className="font-medium text-white">{option.label}</div>
                        <div className="text-sm text-gray-400">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <Input
                  label="Contraseña"
                  type="password"
                  icon={Lock}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) {
                      const newErrors = { ...errors };
                      delete newErrors.password;
                      setErrors(newErrors);
                    }
                  }}
                  error={errors.password}
                  placeholder="••••••••"
                  disabled={isLoading || success}
                />

                <Input
                  label="Confirmar contraseña"
                  type="password"
                  icon={Lock}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) {
                      const newErrors = { ...errors };
                      delete newErrors.confirmPassword;
                      setErrors(newErrors);
                    }
                  }}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  disabled={isLoading || success}
                />

                <div className="bg-gray-700/50 p-4 rounded-lg text-xs text-gray-300">
                  <p className="font-medium mb-2 text-white">Requisitos de contraseña:</p>
                  <ul className="space-y-1 pl-4">
                    <li className="list-disc">Mínimo 10 caracteres</li>
                    <li className="list-disc">Una letra mayúscula</li>
                    <li className="list-disc">Un símbolo (!@#$%^&*)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading || success}
                className="flex-1"
              >
                Atrás
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading || success}
                className="flex-1"
              >
                Continuar
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || success}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creando cuenta...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    ¡Listo!
                  </>
                ) : (
                  "Completar Registro"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}