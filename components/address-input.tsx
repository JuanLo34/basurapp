"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Check, Search, Navigation, Home } from "lucide-react"
import { storage } from "@/lib/storage"

interface AddressInputProps {
  onAddressChange: (address: string) => void
}

export function AddressInput({ onAddressChange }: AddressInputProps) {
  const [address, setAddress] = useState("")
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim()) {
      setIsLoading(true)

      setTimeout(() => {
        onAddressChange(address)
        storage.saveUserAddress(address)
        setIsConfirmed(true)
        setIsLoading(false)

        setTimeout(() => setIsConfirmed(false), 3000)
      }, 1000)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddress(value)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium flex items-center space-x-2">
            <Home className="w-4 h-4 text-primary" />
            <span>Dirección completa</span>
          </Label>

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <MapPin className="w-5 h-5 text-primary animate-pulse" />
            </div>

            <Input
              id="address"
              type="text"
              placeholder="Ingresa tu dirección completa..."
              value={address}
              onChange={handleInputChange}
              className="pl-12 pr-12 h-12 border-2 focus:border-primary transition-all duration-300 text-base bg-gradient-to-r from-background to-muted/20"
            />

            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className={`w-full h-12 font-semibold transition-all duration-500 transform hover:scale-[1.02] ${
            isConfirmed
              ? "bg-green-500 hover:bg-green-600 animate-pulse"
              : "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          }`}
          disabled={!address.trim() || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Validando dirección...</span>
            </div>
          ) : isConfirmed ? (
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 animate-bounce" />
              <span>¡Dirección Confirmada!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Confirmar Dirección</span>
            </div>
          )}
        </Button>
      </form>

      {address && (
        <div
          className={`p-4 rounded-lg border transition-all duration-300 ${
            isConfirmed
              ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 border-green-200 dark:border-green-800"
              : "bg-gradient-to-r from-muted/30 to-muted/50 border-border/50"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-sm font-medium text-muted-foreground">Dirección registrada:</p>
                {isConfirmed && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Verificada
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-foreground leading-relaxed">{address}</p>
            </div>

            <div className="flex-shrink-0 ml-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isConfirmed ? "bg-green-500" : "bg-primary"
                }`}
              >
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {isConfirmed && (
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300 flex items-center space-x-1">
                <Navigation className="w-3 h-3" />
                <span>Los camiones recolectores pueden ubicar esta dirección</span>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
        <p className="text-xs text-accent font-medium mb-1">💡 Consejos para una mejor ubicación:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Incluye número de casa o apartamento</li>
          <li>• Menciona puntos de referencia cercanos</li>
          <li>• Especifica el barrio o sector</li>
        </ul>
      </div>
    </div>
  )
}
