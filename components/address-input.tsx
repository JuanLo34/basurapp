"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Check, Search, Navigation, Home, AlertCircle, X } from "lucide-react"
import { storage } from "@/lib/storage"
import { geocodeAddress, type GeocodingResult } from "@/lib/geocoding"

interface AddressInputProps {
  onAddressChange: (address: string, coordinates?: [number, number]) => void
}

export function AddressInput({ onAddressChange }: AddressInputProps) {
  const [address, setAddress] = useState("")
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const locationSuggestions = [
    {
      name: "Colegio José Elías Puyana Sede A",
      address: "Cl. 4 #11-79, Floridablanca, Santander",
      coordinates: [-73.0839186559978, 7.064693786161123] as [number, number],
    },
    {
      name: "Colegio José Elías Puyana Sede C",
      address: "Cl. 34 #9E-91, Floridablanca, Santander",
      coordinates: [-73.08827605248155, 7.079379959102707] as [number, number],
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim()) {
      setIsLoading(true)
      setIsValid(null)
      setShowSuggestions(false)

      try {
        const result = await geocodeAddress(address.trim())
        setGeocodingResult(result)

        if (result.isValid) {
          setIsValid(true)
          onAddressChange(result.formattedAddress, result.coordinates)
          storage.saveUserAddress(result.formattedAddress)
          setIsConfirmed(true)

          setTimeout(() => setIsConfirmed(false), 3000)
        } else {
          setIsValid(false)
          if (result.suggestions && result.suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }
      } catch (error) {
        console.error("Address validation error:", error)
        setIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddress(value)
    setIsValid(null)
    setIsConfirmed(false)
    setShowSuggestions(false)
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setAddress(suggestion)
    setShowSuggestions(false)
    // Auto-submit the suggestion
    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) {
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }
    }, 100)
  }

  const handleLocationSuggestionSelect = (location: (typeof locationSuggestions)[0]) => {
    setAddress(location.address)
    setIsValid(true)
    setGeocodingResult({
      isValid: true,
      formattedAddress: `${location.name}, ${location.address}`,
      coordinates: location.coordinates,
    })
    onAddressChange(`${location.name}, ${location.address}`, location.coordinates)
    storage.saveUserAddress(`${location.name}, ${location.address}`)
    setIsConfirmed(true)
    setTimeout(() => setIsConfirmed(false), 3000)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium flex items-center space-x-2">
            <Home className="w-4 h-4 text-primary" />
            <span>Dirección en Santander, Colombia</span>
          </Label>

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <MapPin className="w-5 h-5 text-primary animate-pulse" />
            </div>

            <Input
              id="address"
              type="text"
              placeholder="Ej: Cl. 4 #11-79, Floridablanca | Calle 45 #23-67, Bucaramanga..."
              value={address}
              onChange={handleInputChange}
              className={`pl-12 pr-12 h-12 border-2 focus:border-primary transition-all duration-300 text-base bg-gradient-to-r from-background to-muted/20 ${
                isValid === false ? "border-red-500 animate-shake" : ""
              }`}
            />

            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValid === true && <Check className="w-5 h-5 text-green-500" />}
              {isValid === false && <AlertCircle className="w-5 h-5 text-red-500" />}
              {isValid === null && <Search className="w-5 h-5 text-muted-foreground" />}
            </div>
          </div>

          {showSuggestions && geocodingResult?.suggestions && (
            <div className="bg-background border border-border rounded-lg shadow-lg p-2 space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground">¿Quisiste decir?</span>
                <Button variant="ghost" size="sm" onClick={() => setShowSuggestions(false)} className="h-6 w-6 p-0">
                  <X className="w-3 h-3" />
                </Button>
              </div>
              {geocodingResult.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-muted rounded transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className={`w-full h-12 font-semibold transition-all duration-500 transform hover:scale-[1.02] ${
            isConfirmed
              ? "bg-green-500 hover:bg-green-600 animate-pulse"
              : isValid === false
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
          ) : isValid === false ? (
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Dirección Inválida</span>
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
              : isValid === false
                ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/30 border-red-200 dark:border-red-800"
                : "bg-gradient-to-r from-muted/30 to-muted/50 border-border/50"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {isValid === false ? "Dirección no encontrada:" : "Dirección registrada:"}
                </p>
                {isConfirmed && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Verificada
                  </Badge>
                )}
                {isValid === false && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Inválida
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                {geocodingResult?.formattedAddress || address}
              </p>
            </div>

            <div className="flex-shrink-0 ml-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isConfirmed ? "bg-green-500" : isValid === false ? "bg-red-500" : "bg-primary"
                }`}
              >
                {isValid === false ? (
                  <AlertCircle className="w-4 h-4 text-white" />
                ) : (
                  <MapPin className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>

          {isConfirmed && (
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300 flex items-center space-x-1">
                <Navigation className="w-3 h-3" />
                <span>Los camiones recolectores pueden ubicar esta dirección</span>
              </p>
              {geocodingResult?.coordinates && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Coordenadas: {geocodingResult.coordinates[1].toFixed(6)}, {geocodingResult.coordinates[0].toFixed(6)}
                </p>
              )}
            </div>
          )}

          {isValid === false && (
            <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
              <p className="text-xs text-red-700 dark:text-red-300 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>No se pudo encontrar esta dirección. Verifica la información e intenta de nuevo.</span>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Ubicaciones Sugeridas</h3>
        </div>
        <div className="space-y-2">
          {locationSuggestions.map((location, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleLocationSuggestionSelect(location)}
              className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    {location.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{location.address}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
        <p className="text-xs text-accent font-medium mb-1">💡 Consejos para una mejor ubicación:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            • <strong>Formato Google Maps:</strong> Cl. 4 #11-79, Floridablanca
          </li>
          <li>
            • <strong>Formato tradicional:</strong> Calle 45 #23-67, Bucaramanga
          </li>
          <li>• Incluye número de casa o apartamento</li>
          <li>• Menciona puntos de referencia cercanos</li>
          <li>• Solo se aceptan direcciones en Santander, Colombia</li>
        </ul>
      </div>
    </div>
  )
}
