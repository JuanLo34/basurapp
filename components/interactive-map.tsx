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
      zoom: 15,
    })

    mapRef.current = map

    // Añadir línea de ruta al mapa
    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: truckRoutes
          }
        }
      })

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.8
        }
      })
    })

    // 🚚 Camión mejorado con mejor renderizado
    const el = document.createElement("div")
    el.innerHTML = "🚚"
    el.style.fontSize = "32px"
    el.style.textAlign = "center"
    el.style.lineHeight = "1"
    el.style.userSelect = "none"
    el.style.pointerEvents = "none"
    el.style.filter = "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))"
    el.style.transform = "translate(-50%, -100%)"

    const marker = new maplibregl.Marker({ 
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(truckRoutes[0])
      .addTo(map)

    markerRef.current = marker

    return () => {
      map.remove()
    }
  }, [mapStyle])

  useEffect(() => {
    if (!isMoving) return
    if (currentIndex >= truckRoutes.length - 1) {
      setIsMoving(false)
      return
    }

    const timer = setTimeout(() => {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)

      const nextPos = truckRoutes[nextIndex]
      
      // Animación suave del marcador
      if (markerRef.current) {
        markerRef.current.setLngLat(nextPos)
      }
      
      // Seguir el marcador con la cámara de forma suave
      mapRef.current?.easeTo({ 
        center: nextPos, 
        zoom: 16,
        duration: 2000,
        easing: (t) => t * (2 - t) // easing suave
      })
    }, 2800) // Tiempo aumentado para mejor visualización

    return () => clearTimeout(timer)
  }, [currentIndex, isMoving])

  const resetRoute = () => {
    setCurrentIndex(0)
    setIsMoving(false) // Pausar primero
    
    // Resetear posición después de un pequeño delay
    setTimeout(() => {
      markerRef.current?.setLngLat(truckRoutes[0])
      mapRef.current?.easeTo({ 
        center: truckRoutes[0], 
        zoom: 15,
        duration: 1500
      })
      
      // Reiniciar movimiento después del reset
      setTimeout(() => {
        setIsMoving(true)
      }, 500)
    }, 100)
  }

  return (
    <div className="relative">
      <Card className="h-96 relative overflow-hidden border-0 shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />
      </Card>

      {/* Controles mejorados */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/90 backdrop-blur rounded-lg shadow-lg border hover:bg-white"
          onClick={() => setMapStyle(mapStyle === "streets" ? "satellite" : "streets")}
          title={`Cambiar a vista ${mapStyle === "streets" ? "satélite" : "calles"}`}
        >
          <Layers className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/90 backdrop-blur rounded-lg shadow-lg border hover:bg-white"
          onClick={resetRoute}
          title="Reiniciar ruta"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/90 backdrop-blur rounded-lg shadow-lg border hover:bg-white"
          onClick={() => setIsMoving(!isMoving)}
          title={isMoving ? "Pausar" : "Continuar"}
        >
          {isMoving ? "⏸️" : "▶️"}
        </Button>
      </div>

      {/* Información de progreso */}
      <div className="absolute bottom-4 left-4 z-30">
        <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg border px-4 py-2">
          <p className="text-sm font-medium text-gray-800">
            Punto {currentIndex + 1} de {truckRoutes.length}
          </p>
          <div className="mt-2 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 ease-out rounded-full"
              style={{ 
                width: `${((currentIndex + 1) / truckRoutes.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}