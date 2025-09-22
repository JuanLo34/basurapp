"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, RotateCcw, MapPin, X } from "lucide-react"
import { storage } from "@/lib/storage"

interface InteractiveMapProps {
  center?: [number, number]
  showUserLocation?: boolean
  userAddress?: string
}

const truckRoutes: [number, number][] = [
  [-73.0858, 7.0621], // Inicio en Floridablanca centro
  [-73.087, 7.0635], // Acercándose al colegio
  [-73.088, 7.0645], // Por la Calle 4
  [-73.0885, 7.065], // Llegando al sector
  [-73.0839186559978, 7.064693786161123], // Colegio José Elías Puyana Sede A - coordenadas exactas
]

export function InteractiveMap({ center, showUserLocation = false, userAddress }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets")
  const [isMoving, setIsMoving] = useState(true)
  const [showLocationPopup, setShowLocationPopup] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | undefined>()
  const [savedAddress, setSavedAddress] = useState<string>("")

  useEffect(() => {
    const userEmail = storage.getUserEmail()
    const savedUserAddress = storage.getUserAddress()

    if (userEmail) {
      setIsLoggedIn(true)
    }

    if (savedUserAddress) {
      setSavedAddress(savedUserAddress)
    }
  }, [])

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        mapStyle === "streets"
          ? "https://api.maptiler.com/maps/hybrid/style.json?key=XZJESfRiXjvzKz6iV9Sh"
          : "https://demotiles.maplibre.org/style.json",
      center: center || userCoordinates || [-73.0858, 7.0621], // Default to Floridablanca center
      zoom: center || userCoordinates ? 15 : 13,
      attributionControl: false,
    })

    mapRef.current = map

    return () => {
      map.remove()
    }
  }, [mapStyle, center, showUserLocation, userAddress, userCoordinates])

  const resetRoute = () => {
    if (center && showUserLocation && mapRef.current) {
      mapRef.current.flyTo({ center, zoom: 15 })
    } else if (userCoordinates && mapRef.current) {
      mapRef.current.flyTo({ center: userCoordinates, zoom: 15 })
    } else {
      mapRef.current?.flyTo({ center: [-73.0858, 7.0621], zoom: 13 }) // Reset to Floridablanca center instead of Bucaramanga
    }
  }

  const centerOnUser = () => {
    const coords = center || userCoordinates
    if (coords && mapRef.current) {
      mapRef.current.flyTo({ center: coords, zoom: 18, speed: 1.2 })
      setShowLocationPopup(true)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    storage.clearData()
    setSavedAddress("")
    setUserCoordinates(undefined)
  }

  const displayAddress = userAddress || savedAddress
  const displayCoordinates = center || userCoordinates
  const shouldShowLocation = showUserLocation || (isLoggedIn && displayCoordinates)

  return (
    <div className="relative">
      {isLoggedIn && (
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Mapa Interactivo</h2>
            {storage.getUserName() && <p className="text-sm text-muted-foreground">Usuario: {storage.getUserName()}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            Salir
          </button>
        </div>
      )}

      <Card className="h-96 relative overflow-hidden border-0 shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />

        {shouldShowLocation && displayAddress && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-3 max-w-xs z-30">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-sm">Dirección validada</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{displayAddress}</p>
          </div>
        )}

        {showLocationPopup && displayCoordinates && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg shadow-xl border p-6 max-w-sm mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Tu ubicación</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowLocationPopup(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Coordenadas:</span>
                </div>
                <div className="bg-gray-50 rounded p-3 font-mono text-sm">
                  <div>Latitud: {displayCoordinates[1].toFixed(6)}</div>
                  <div>Longitud: {displayCoordinates[0].toFixed(6)}</div>
                </div>
                {displayAddress && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Dirección:</span>
                    <p className="text-sm text-gray-600 mt-1">{displayAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white rounded-lg shadow-lg border"
          onClick={() => setMapStyle(mapStyle === "streets" ? "satellite" : "streets")}
        >
          <Layers className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="bg-white rounded-lg shadow-lg border" onClick={resetRoute}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        {shouldShowLocation && (
          <Button variant="ghost" size="sm" className="bg-white rounded-lg shadow-lg border" onClick={centerOnUser}>
            <MapPin className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
