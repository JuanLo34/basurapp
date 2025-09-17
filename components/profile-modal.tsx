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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Mi Perfil</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Usuario BASURAPP</h3>
              <Badge variant="secondary" className="mt-1">
                Cliente Premium
              </Badge>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Correo Electrónico</p>
                {isEditingEmail ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="email"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      className="h-8 text-sm"
                      placeholder="nuevo@email.com"
                    />
                    <Button size="sm" onClick={saveEmail} className="h-8 w-8 p-0">
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditingEmail}
                      className="h-8 w-8 p-0 bg-transparent"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                    <Button size="sm" variant="ghost" onClick={startEditingEmail} className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <MapPin className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium">Dirección Registrada</p>
                {isEditingAddress ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Nueva dirección..."
                    />
                    <Button size="sm" onClick={saveAddress} className="h-8 w-8 p-0">
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditingAddress}
                      className="h-8 w-8 p-0 bg-transparent"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground">{userAddress}</p>
                    <Button size="sm" variant="ghost" onClick={startEditingAddress} className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Truck className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm font-medium">Servicio Activo</p>
                <p className="text-sm text-muted-foreground">Recolección programada</p>
              </div>
            </div>
          </div>

          {/* Animated truck section */}
          <div className="relative h-24 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">¡Gracias por usar BASURAPP!</p>
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
                <Truck className="w-8 h-8 text-green-600 animate-bounce" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
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
            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={startEditingAddress}>
              <MapPin className="w-4 h-4 mr-2" />
              Cambiar Dirección
            </Button>

            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>

            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
              <Home className="w-4 h-4 mr-2" />
              Salir de la App
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
