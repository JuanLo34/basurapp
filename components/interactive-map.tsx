"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl, { Marker } from "maplibre-gl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, RotateCcw } from "lucide-react"

// Coordenadas para Colegio José Elías Puyana Sede A, Floridablanca, Santander
const truckRoutes: [number, number][] = [
  [-73.0858, 7.0621], // Inicio en Floridablanca centro
  [-73.0870, 7.0635], // Acercándose al colegio
  [-73.0880, 7.0645], // Por la Calle 4
  [-73.0885, 7.0650], // Llegando al sector
  [-73.0890, 7.0655], // Colegio José Elías Puyana Sede A - Calle 4 No. 11-79
]

export function InteractiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<Marker | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets")
  const [isMoving, setIsMoving] = useState(true)

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        mapStyle === "streets" 
          ? "https://api.maptiler.com/maps/hybrid/style.json?key=XZJESfRiXjvzKz6iV9Sh"
          : "https://demotiles.maplibre.org/style.json",
      center: truckRoutes[0],
      zoom: 13,
    })

    mapRef.current = map

    // 🚚 Camión (emoji como icono) (en mantenimiento)
    const el = document.createElement("div")
    el.innerHTML = ""
    el.style.fontSize = "28px"

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(truckRoutes[0])
      .addTo(map)

    markerRef.current = marker

    return () => {
      map.remove()
    }
  }, [mapStyle])

  useEffect(() => {
    if (!isMoving) return
    if (currentIndex >= truckRoutes.length - 1) return

    const timer = setTimeout(() => {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)

      const nextPos = truckRoutes[nextIndex]
      markerRef.current?.setLngLat(nextPos)
      mapRef.current?.flyTo({ center: nextPos, zoom: 15, speed: 0.8 })
    }, 2500)

    return () => clearTimeout(timer)
  }, [currentIndex, isMoving])

  const resetRoute = () => {
    setCurrentIndex(0)
    markerRef.current?.setLngLat(truckRoutes[0])
    mapRef.current?.flyTo({ center: truckRoutes[0], zoom: 13 })
    setIsMoving(true)
  }

  return (
    <div className="relative">
      <Card className="h-96 relative overflow-hidden border-0 shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />
      </Card>

      {/* Controles */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white rounded-lg shadow-lg border"
          onClick={() => setMapStyle(mapStyle === "streets" ? "satellite" : "streets")}
        >
          <Layers className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-white rounded-lg shadow-lg border"
          onClick={resetRoute}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
