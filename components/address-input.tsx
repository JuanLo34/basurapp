"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Check, Search, Navigation, Home, AlertTriangle } from "lucide-react"
import { storage } from "@/lib/storage"

interface AddressInputProps {
  onAddressChange: (address: string, coordinates?: [number, number]) => void
}

const VALID_ADDRESSES = [
  {
    address: "Cra. 33 #196-103, Floridablanca, Santander",
    coordinates: [7.094759796940575, -73.10674773737284] as [number, number],
  },
  {
    address: "Cra. 44 #148B43-Floridablanca",
    coordinates: [7.076822648358956, -73.09388075855374] as [number, number],
  },
  {
    address: "Cra 15b #3-39",
    coordinates: [7.06568278238497, -73.08014450521267] as [number, number],
  },
  {
    address: "Colegio Técnico Industrial José Elías Puyana",
    coordinates: [7.0647020463691135,-73.08392003248365] as [number, number],
  }
]

export function AddressInput({ onAddressChange }: AddressInputProps) {
  const [address, setAddress] = useState("")
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<"valid" | "invalid" | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim()) {
      setIsLoading(true)
      setValidationResult(null)

      setTimeout(() => {
        const validAddress = VALID_ADDRESSES.find(
          (valid) =>
            valid.address.toLowerCase().includes(address.toLowerCase().trim()) ||
            address.toLowerCase().trim().includes(valid.address.toLowerCase()),
        )

        if (validAddress) {
          // Address is valid
          setValidationResult("valid")
          onAddressChange(validAddress.address, validAddress.coordinates)
          storage.saveUserAddress(validAddress.address)
          setIsConfirmed(true)
          setAddress(validAddress.address) // Set the exact valid address
        } else {
          // Address is invalid
          setValidationResult("invalid")
          setIsConfirmed(false)
        }

        setIsLoading(false)

        // Reset validation result after 5 seconds
        setTimeout(() => {
          setValidationResult(null)
          if (validationResult === "invalid") {
            setIsConfirmed(false)
          }
        }, 5000)
      }, 1000)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddress(value)
    if (validationResult) {
      setValidationResult(null)
      setIsConfirmed(false)
    }
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
              : validationResult === "invalid"
                ? "bg-red-500 hover:bg-red-600"
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
          ) : validationResult === "invalid" ? (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Dirección No Válida</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Confirmar Dirección</span>
            </div>
          )}
        </Button>
      </form>

      {validationResult === "invalid" && (
        <div className="p-4 rounded-lg border bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/30 border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Dirección no válida</p>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400">
            Esta dirección no está en nuestra zona de cobertura. Por favor, verifica e intenta con una dirección válida.
          </p>
        </div>
      )}

      {address && isConfirmed && (
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
        <p className="text-xs text-accent font-medium mb-1">📍 Direcciones disponibles:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>Cra. 33 #196-103, Floridablanca, Santander</li>
          <li>Cra. 44 #148B43-Floridablanca</li>
          <li>Cra 15b #3-39</li>
          <li>Colegio Técnico Industrial José Elías Puyana</li>
        </ul>
      </div>
    </div>
  )
}
