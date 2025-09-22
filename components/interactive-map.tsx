"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, RotateCcw, MapPin, X } from "lucide-react"

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

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        mapStyle === "streets"
          ? "https://api.maptiler.com/maps/hybrid/style.json?key=XZJESfRiXjvzKz6iV9Sh"
          : "https://demotiles.maplibre.org/style.json",
      center: center || [-73.0858, 7.0621], // Default to Floridablanca center
      zoom: center ? 15 : 13,
      attributionControl: false,
    })

    mapRef.current = map

    return () => {
      map.remove()
    }
  }, [mapStyle, center, showUserLocation, userAddress])

  const resetRoute = () => {
    if (center && showUserLocation && mapRef.current) {
      mapRef.current.flyTo({ center, zoom: 15 })
    } else {
      mapRef.current?.flyTo({ center: [-73.0858, 7.0621], zoom: 13 }) // Reset to Floridablanca center instead of Bucaramanga
    }
  }

  const centerOnUser = () => {
    if (center && mapRef.current) {
      mapRef.current.flyTo({ center, zoom: 18, speed: 1.2 })
      setShowLocationPopup(true)
    }
  }

  return (
    <div className="relative">
      <Card className="h-96 relative overflow-hidden border-0 shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />

        {showUserLocation && userAddress && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-3 max-w-xs z-30">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-sm">Dirección validada</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{userAddress}</p>
          </div>
        )}

        {showLocationPopup && center && (
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
                  <div>Latitud: {center[1].toFixed(6)}</div>
                  <div>Longitud: {center[0].toFixed(6)}</div>
                </div>
                {userAddress && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Dirección:</span>
                    <p className="text-sm text-gray-600 mt-1">{userAddress}</p>
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
        {showUserLocation && (
          <Button variant="ghost" size="sm" className="bg-white rounded-lg shadow-lg border" onClick={centerOnUser}>
            <MapPin className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
