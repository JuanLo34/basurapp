"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, RotateCcw } from "lucide-react"

const DESTINATION_ROUTES = {
  // Cra. 33 #196-103, Floridablanca, Santander - Following main roads
  "7.094759796940575,-73.10674773737284": [
    [7.089, -73.102], // Starting point on main avenue
    [7.0895, -73.1025], // Following Carrera 33
    [7.09, -73.103], // Continue on main road
    [7.0905, -73.1035], // Turn following street pattern
    [7.091, -73.104], // Main intersection
    [7.0915, -73.1045], // Continue on Carrera 33
    [7.092, -73.105], // Following the main road
    [7.0925, -73.1055], // Approaching destination area
    [7.093, -73.106], // Turn into residential street
    [7.0935, -73.1062], // Following local street
    [7.094, -73.1065], // Almost at destination
    [7.0945, -73.1067], // Final approach
    [7.094759796940575, -73.10674773737284], // Final destination
  ],
  // Cra. 44 #148B43-Floridablanca - Following road network
  "7.076822648358956,-73.09388075855374": [
    [7.072, -73.089], // Starting on main avenue
    [7.0725, -73.0895], // Following Carrera 44
    [7.073, -73.09], // Continue on main road
    [7.0735, -73.0905], // Main intersection
    [7.074, -73.091], // Continue straight
    [7.0745, -73.0915], // Following the avenue
    [7.075, -73.092], // Turn following street grid
    [7.0755, -73.0925], // Residential area approach
    [7.076, -73.093], // Local street
    [7.0765, -73.0935], // Final approach on street
    [7.076822648358956, -73.09388075855374], // Destination
  ],
  // Cra 15b #3-39 - Following street grid pattern
  "7.06568278238497,-73.08014450521267": [
    [7.061, -73.075], // Starting on main road
    [7.0615, -73.0755], // Following Carrera 15
    [7.062, -73.076], // Continue on avenue
    [7.0625, -73.0765], // Main intersection
    [7.063, -73.077], // Turn following grid
    [7.0635, -73.0775], // Continue on street
    [7.064, -73.078], // Following local road
    [7.0645, -73.0785], // Residential approach
    [7.065, -73.079], // Local street
    [7.0655, -73.0795], // Almost there
    [7.0657, -73.08], // Final street
    [7.06568278238497, -73.08014450521267], // Final destination
  ],
}

interface InteractiveMapProps {
  destination?: [number, number]
  onRouteComplete?: () => void
}

const MapTile = ({ src, alt, onError }: { src: string; alt: string; onError: (e: any) => void }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = useCallback(
    (e: any) => {
      setHasError(true)
      onError(e)
    },
    [onError],
  )

  return (
    <div className="w-64 h-64 relative overflow-hidden bg-muted/20">
      <img
        ref={imgRef}
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 will-change-auto ${
          isLoaded && !hasError ? "opacity-100" : "opacity-0"
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        style={{
          imageRendering: "auto",
          backfaceVisibility: "hidden",
        }}
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted/40 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export function InteractiveMap({ destination, onRouteComplete }: InteractiveMapProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets")
  const [isMoving, setIsMoving] = useState(false)
  const [currentRoute, setCurrentRoute] = useState<[number, number][]>([])
  const [isRouteComplete, setIsRouteComplete] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([7.0621, -73.0858])
  const [showTruck, setShowTruck] = useState(false)
  const [zoom, setZoom] = useState(17)
  const [interpolatedPosition, setInterpolatedPosition] = useState<[number, number]>([7.0621, -73.0858])
  const animationRef = useRef<number>()
  const tileCache = useRef<Map<string, HTMLImageElement>>(new Map())

  const tileUrl = useMemo(() => {
    return mapStyle === "streets"
      ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  }, [mapStyle])

  const getTileCoords = useCallback((lat: number, lng: number, zoom: number) => {
    const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))
    const y = Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom),
    )
    return { x, y }
  }, [])

  const getPixelOffset = useCallback((lat: number, lng: number, zoom: number) => {
    const scale = Math.pow(2, zoom)
    const worldX = ((lng + 180) / 360) * scale
    const worldY =
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * scale

    const tileX = Math.floor(worldX)
    const tileY = Math.floor(worldY)

    const offsetX = (worldX - tileX) * 256
    const offsetY = (worldY - tileY) * 256

    return { offsetX, offsetY, tileX, tileY }
  }, [])

  const { offsetX, offsetY, tileX, tileY } = useMemo(
    () => getPixelOffset(interpolatedPosition[0], interpolatedPosition[1], zoom),
    [interpolatedPosition, zoom, getPixelOffset],
  )

  const tileGrid = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => {
      const row = Math.floor(i / 3) - 1 // -1, 0, 1
      const col = (i % 3) - 1 // -1, 0, 1
      const currentTileUrl = tileUrl
        .replace("{z}", zoom.toString())
        .replace("{x}", (tileX + col).toString())
        .replace("{y}", (tileY + row).toString())

      return {
        key: `${tileX + col}-${tileY + row}-${zoom}-${mapStyle}`,
        url: currentTileUrl,
        fallbackUrl: `https://tile.openstreetmap.org/${zoom}/${tileX + col}/${tileY + row}.png`,
        alt: `Map tile ${i}`,
      }
    })
  }, [tileUrl, zoom, tileX, tileY, mapStyle])

  useEffect(() => {
    const handleHideTruck = () => {
      setShowTruck(false)
    }

    window.addEventListener("hideTruck", handleHideTruck)
    return () => {
      window.removeEventListener("hideTruck", handleHideTruck)
    }
  }, [])

  useEffect(() => {
    if (!destination) return

    const destinationKey = `${destination[0]},${destination[1]}`
    const route = DESTINATION_ROUTES[destinationKey as keyof typeof DESTINATION_ROUTES]

    if (!route) return

    setCurrentRoute(route)
    setCurrentIndex(0)
    setIsMoving(true)
    setIsRouteComplete(false)
    setCurrentPosition(route[0])
    setInterpolatedPosition(route[0])
    setShowTruck(true)
    setZoom(17)
  }, [destination])

  useEffect(() => {
    if (!isMoving || currentRoute.length === 0) return

    if (currentIndex >= currentRoute.length - 1) {
      const finalDestination = currentRoute[currentRoute.length - 1]
      setCurrentPosition(finalDestination)
      setInterpolatedPosition(finalDestination)
      setIsMoving(false)
      setIsRouteComplete(true)
      if (onRouteComplete) {
        onRouteComplete()
      }
      return
    }

    const startPos = currentRoute[currentIndex]
    const endPos = currentRoute[currentIndex + 1]
    const duration = 2500
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

      const lat = startPos[0] + (endPos[0] - startPos[0]) * easeProgress
      const lng = startPos[1] + (endPos[1] - startPos[1]) * easeProgress

      setInterpolatedPosition([lat, lng])

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setCurrentIndex(currentIndex + 1)
        setCurrentPosition(endPos)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentIndex, isMoving, currentRoute, onRouteComplete])

  const resetRoute = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setCurrentIndex(0)
    setIsMoving(false)
    setIsRouteComplete(false)
    setCurrentRoute([])
    setCurrentPosition([7.0621, -73.0858])
    setInterpolatedPosition([7.0621, -73.0858])
    setShowTruck(false)
    setZoom(17)
  }, [])

  const handleTileError = useCallback((e: any, fallbackUrl: string) => {
    ;(e.target as HTMLImageElement).src = fallbackUrl
  }, [])

  return (
    <div className="relative">
      <Card className="h-96 relative overflow-hidden border-0 shadow-lg bg-card">
        <div
          className="absolute will-change-transform"
          style={{
            width: "768px",
            height: "768px",
            left: `calc(50% - 384px + ${128 - offsetX}px)`,
            top: `calc(50% - 384px + ${128 - offsetY}px)`,
            transform: "translate3d(0, 0, 0)", // Force hardware acceleration
            backfaceVisibility: "hidden", // Prevent flickering
            WebkitBackfaceVisibility: "hidden", // Safari support
            perspective: "1000px", // Better 3D rendering
          }}
        >
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
            {tileGrid.map((tile) => (
              <MapTile
                key={tile.key}
                src={tile.url}
                alt={tile.alt}
                onError={(e) => handleTileError(e, tile.fallbackUrl)}
              />
            ))}
          </div>
        </div>

        {showTruck && (
          <div
            className="absolute z-30 will-change-transform"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate3d(-50%, -50%, 0)",
              filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.8))",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className={`text-2xl relative transition-transform duration-300 ${isMoving ? "animate-bounce" : ""}`}>
              🚚
              {isMoving && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              )}
            </div>
          </div>
        )}

        {isMoving && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium z-40 shadow-lg backdrop-blur-sm">
            🚚 Camión en ruta... ({currentIndex + 1}/{currentRoute.length}) -{" "}
            {Math.ceil((currentRoute.length - currentIndex - 1) * 2.5)} seg restantes
          </div>
        )}

        {isRouteComplete && showTruck && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium z-40 shadow-lg animate-bounce backdrop-blur-sm">
            ✅ Camión llegó al destino
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs z-40 backdrop-blur-sm">
          Zoom: {zoom} | Pos: {interpolatedPosition[0].toFixed(6)}, {interpolatedPosition[1].toFixed(6)}
        </div>
      </Card>

      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-40">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border hover:bg-white/95 transition-all duration-200"
          onClick={() => setMapStyle(mapStyle === "streets" ? "satellite" : "streets")}
        >
          <Layers className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border hover:bg-white/95 transition-all duration-200"
          onClick={resetRoute}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border hover:bg-white/95 transition-all duration-200"
          onClick={() => setZoom(zoom > 15 ? zoom - 1 : 15)}
        >
          -
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border hover:bg-white/95 transition-all duration-200"
          onClick={() => setZoom(zoom < 20 ? zoom + 1 : 20)}
        >
          +
        </Button>
      </div>
    </div>
  )
}
