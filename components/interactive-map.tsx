"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl, { LngLatLike, Marker } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, RotateCcw } from "lucide-react"

interface InteractiveMapProps {
  userAddress: string
}

const truckRoutes: [number, number][] = [
  [-74.0836, 4.6097], // Bogotá
  [-74.08, 4.62],
  [-74.06, 4.63],
  [-74.05, 4.635],
  [-74.04, 4.64],     // destino
]

export function InteractiveMap({ userAddress }: InteractiveMapProps) {
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
          ? "https://demotiles.maplibre.org/style.json"
          : "https://api.maptiler.com/maps/hybrid/style.json?key=YOUR_API_KEY",
      center: truckRoutes[0] as LngLatLike,
      zoom: 13,
    })

    mapRef.current = map

    const marker = new maplibregl.Marker({
      color: "green",
      element: (() => {
        const el = document.createElement("div")
        el.innerHTML = "🚚"
        el.style.fontSize = "24px"
        return el
      })(),
    })
      .setLngLat(truckRoutes[0] as LngLatLike)
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

      const nextPos = truckRoutes[nextIndex] as LngLatLike
      markerRef.current?.setLngLat(nextPos)
      mapRef.current?.flyTo({ center: nextPos, zoom: 15, speed: 0.8 })
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentIndex, isMoving])

  const resetRoute = () => {
    setCurrentIndex(0)
    markerRef.current?.setLngLat(truckRoutes[0])
    mapRef.current?.flyTo({ center: truckRoutes[0], zoom: 13 })
    setIsMoving(true)
  }

  return (
    <div className="relative space-y-3">
      <Card className="h-80 sm:h-96 relative overflow-hidden border-0 shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />
      </Card>

      {/* Controles */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border"
          onClick={() => setMapStyle(mapStyle === "streets" ? "satellite" : "streets")}
        >
          <Layers className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border"
          onClick={resetRoute}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
