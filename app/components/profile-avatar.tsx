"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { profileService } from "@/services/profile.service"

interface ProfileAvatarProps {
  userId: string
  userName: string
  photoUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showStatus?: boolean
  status?: 'activo' | 'inactivo'
}

export function ProfileAvatar({ 
  userId, 
  userName, 
  photoUrl, 
  size = 'md',
  className = '',
  showStatus = false,
  status = 'activo'
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
    if (photoUrl) {
      setImageUrl(photoUrl)
    } else {
      setImageUrl(profileService.getProfilePhotoUrl(userId))
    }
  }, [userId, photoUrl])

  const getInitials = (name: string) => {
    const names = name.trim().split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  }

  const statusSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden relative`}>
        {!imageError ? (
          <img
            src={imageUrl}
            alt={userName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{getInitials(userName)}</span>
        )}
      </div>
      
      {showStatus && (
        <span className={`absolute bottom-0 right-0 ${statusSize[size]} rounded-full border-2 border-white ${
          status === 'activo' ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      )}
    </div>
  )
}