"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User, Mail, MapPin, Truck, LogOut, Edit, Check, X, Home } from "lucide-react"
import { storage } from "@/lib/storage"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

export function ProfileModal({ isOpen, onClose, onLogout }: ProfileModalProps) {
  const [userEmail, setUserEmail] = useState("")
  const [userAddress, setUserAddress] = useState("")
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [tempEmail, setTempEmail] = useState("")
  const [tempAddress, setTempAddress] = useState("")
  const [showTruckAnimation, setShowTruckAnimation] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const savedEmail = storage.getUserEmail()
      const savedAddress = storage.getUserAddress()

      setUserEmail(savedEmail || "usuario@basurapp.com")
      setUserAddress(savedAddress || "Calle Principal #123, Sector Norte")

      const timer = setTimeout(() => {
        setShowTruckAnimation(true)
      }, 500)

      return () => clearTimeout(timer)
    } else {
      setShowTruckAnimation(false)
    }
  }, [isOpen])

  useEffect(() => {
    const checkAddressUpdate = () => {
      const currentAddress = storage.getUserAddress()
      if (currentAddress && currentAddress !== userAddress) {
        setUserAddress(currentAddress)
      }
    }

    const interval = setInterval(checkAddressUpdate, 1000)
    return () => clearInterval(interval)
  }, [userAddress])

  const startEditingEmail = () => {
    setTempEmail(userEmail)
    setIsEditingEmail(true)
  }

  const startEditingAddress = () => {
    setTempAddress(userAddress)
    setIsEditingAddress(true)
  }

  const saveEmail = () => {
    if (tempEmail.trim() && tempEmail.includes("@")) {
      setUserEmail(tempEmail)
      storage.saveUserData(tempEmail)
      setIsEditingEmail(false)
    }
  }

  const saveAddress = () => {
    if (tempAddress.trim()) {
      setUserAddress(tempAddress)
      storage.saveUserAddress(tempAddress)
      setIsEditingAddress(false)
    }
  }

  const cancelEditingEmail = () => {
    setTempEmail("")
    setIsEditingEmail(false)
  }

  const cancelEditingAddress = () => {
    setTempAddress("")
    setIsEditingAddress(false)
  }

  const handleLogout = () => {
    onLogout()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md mx-3 sm:mx-auto">
        <DialogHeader className="px-1 sm:px-0">
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span>Mi Perfil</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
          {/* Profile Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold">Usuario BASURAPP</h3>
              <Badge variant="secondary" className="mt-1 text-xs">
                Cliente Premium
              </Badge>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Correo Electrónico</p>
                {isEditingEmail ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="email"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      className="h-8 text-sm flex-1"
                      placeholder="nuevo@email.com"
                    />
                    <Button size="sm" onClick={saveEmail} className="h-8 w-8 p-0 shrink-0">
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditingEmail}
                      className="h-8 w-8 p-0 bg-transparent shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground truncate pr-2">{userEmail}</p>
                    <Button size="sm" variant="ghost" onClick={startEditingEmail} className="h-6 w-6 p-0 shrink-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Dirección Registrada</p>
                {isEditingAddress ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      className="h-8 text-sm flex-1"
                      placeholder="Nueva dirección..."
                    />
                    <Button size="sm" onClick={saveAddress} className="h-8 w-8 p-0 shrink-0">
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditingAddress}
                      className="h-8 w-8 p-0 bg-transparent shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground truncate pr-2">{userAddress}</p>
                    <Button size="sm" variant="ghost" onClick={startEditingAddress} className="h-6 w-6 p-0 shrink-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              <div>
                <p className="text-sm font-medium">Servicio Activo</p>
                <p className="text-sm text-muted-foreground">Recolección programada</p>
              </div>
            </div>
          </div>

          {/* Animated truck section */}
          <div className="relative h-20 sm:h-24 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-2">
                <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
                  ¡Gracias por usar BASURAPP!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">Cuidando el medio ambiente juntos</p>
              </div>
            </div>

            {/* Enhanced animated truck */}
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-4000 ease-in-out ${
                showTruckAnimation ? "left-full -translate-x-full" : "-left-12"
              }`}
            >
              <div className="relative">
                <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 animate-bounce" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                {/* Exhaust smoke effect */}
                <div className="absolute -left-2 top-1 w-1 h-1 bg-gray-400 rounded-full animate-ping opacity-60"></div>
                <div className="absolute -left-3 top-0 w-1 h-1 bg-gray-300 rounded-full animate-ping opacity-40 animation-delay-200"></div>
              </div>
            </div>

            {/* Road with lane markings */}
            <div className="absolute bottom-2 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600"></div>
            <div
              className="absolute bottom-2 left-0 right-0 h-0.5 bg-white dark:bg-gray-400 opacity-60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)",
              }}
            ></div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent h-10 sm:h-auto"
              onClick={startEditingAddress}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Cambiar Dirección
            </Button>

            <Button variant="destructive" className="w-full justify-start h-10 sm:h-auto" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start bg-transparent h-10 sm:h-auto"
              onClick={handleLogout}
            >
              <Home className="w-4 h-4 mr-2" />
              Salir de la App
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
