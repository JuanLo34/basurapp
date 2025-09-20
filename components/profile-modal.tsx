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
      setUserAddress(savedAddress || "Calle Principal #123")

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
      <DialogContent className="w-[95vw] max-w-[340px] mx-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center space-x-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            <span>Mi Perfil</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Header - Más compacto */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Usuario BASURAPP</h3>
              <Badge variant="secondary" className="text-xs">Premium</Badge>
            </div>
          </div>

          {/* User Information - Más compacto */}
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-start space-x-2 p-2 bg-muted/30 rounded-lg">
              <Mail className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1">Email</p>
                {isEditingEmail ? (
                  <div className="flex items-center space-x-1">
                    <Input
                      type="email"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      className="h-7 text-xs flex-1"
                    />
                    <Button size="sm" onClick={saveEmail} className="h-7 w-7 p-0">
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditingEmail}
                      className="h-7 w-7 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate pr-1 flex-1">{userEmail}</p>
                    <Button size="sm" variant="ghost" onClick={startEditingEmail} className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-2 p-2 bg-muted/30 rounded-lg">
              <MapPin className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1">Dirección</p>
                {isEditingAddress ? (
                  <div className="flex items-center space-x-1">
                    <Input
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      className="h-7 text-xs flex-1"
                    />
                    <Button size="sm" onClick={saveAddress} className="h-7 w-7 p-0">
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditingAddress}
                      className="h-7 w-7 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate pr-1 flex-1">{userAddress}</p>
                    <Button size="sm" variant="ghost" onClick={startEditingAddress} className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Service Status */}
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              <Truck className="w-4 h-4 text-secondary flex-shrink-0" />
              <div>
                <p className="text-xs font-medium">Servicio Activo</p>
                <p className="text-xs text-muted-foreground">Recolección programada</p>
              </div>
            </div>
          </div>

          {/* Animated truck section - Más pequeño */}
          <div className="relative h-16 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center px-2">
              <div className="text-center">
                <p className="text-xs font-medium text-green-800 dark:text-green-200">¡Gracias por usar BASURAPP!</p>
                <p className="text-xs text-green-600 dark:text-green-400">Cuidando el ambiente</p>
              </div>
            </div>

            {/* Truck animation */}
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-4000 ease-in-out ${
                showTruckAnimation ? "left-full -translate-x-full" : "-left-10"
              }`}
            >
              <Truck className="w-6 h-6 text-green-600 animate-bounce" />
            </div>

            {/* Road */}
            <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
          </div>

          {/* Action Buttons - Más compactos */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start h-9 text-sm"
              onClick={startEditingAddress}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Cambiar Dirección
            </Button>

            <Button variant="destructive" className="w-full justify-start h-9 text-sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-9 text-sm"
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