"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, MapPin, Navigation, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface InteractiveMapProps {
  userAddress: string
}

const truckRoutes = [
  { x: 5, y: 20, action: "pickup", duration: 2000 },
  { x: 15, y: 35, action: "moving", duration: 1500 },
  { x: 25, y: 15, action: "pickup", duration: 2000 },
  { x: 40, y: 45, action: "moving", duration: 1800 },
  { x: 55, y: 25, action: "pickup", duration: 2000 },
  { x: 70, y: 60, action: "moving", duration: 1600 },
  { x: 85, y: 50, action: "destination", duration: 3000 }, // Tu ubicación
  { x: 90, y: 45, action: "leaving", duration: 1000 },
  { x: 95, y: 40, action: "gone", duration: 500 },
]

export function InteractiveMap({ userAddress }: InteractiveMapProps) {
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0)
  const [isMoving, setIsMoving] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [mapStyle, setMapStyle] = useState<"default" | "satellite">("default")
  const [truckStatus, setTruckStatus] = useState("En ruta")

  useEffect(() => {
    if (!isMoving) return

    const currentRoute = truckRoutes[currentRouteIndex]
    const timer = setTimeout(() => {
      switch (currentRoute.action) {
        case "pickup":
          setTruckStatus("Recolectando")
          break
        case "destination":
          setTruckStatus("En tu ubicación")
          break
        case "leaving":
          setTruckStatus("Saliendo")
          break
        case "gone":
          setTruckStatus("Completado")
          break
        default:
          setTruckStatus("En ruta")
      }

      setCurrentRouteIndex((prev) => (prev + 1) % truckRoutes.length)
    }, currentRoute.duration)

    return () => clearTimeout(timer)
  }, [currentRouteIndex, isMoving])

  const currentRoute = truckRoutes[currentRouteIndex]
  const nextRoute = truckRoutes[(currentRouteIndex + 1) % truckRoutes.length]

  const toggleMovement = () => {
    setIsMoving(!isMoving)
  }

  const resetRoute = () => {
    setCurrentRouteIndex(0)
    setTruckStatus("En ruta")
    setZoomLevel(1)
  }

  return (
    <div className="space-y-4">
      <Card className="h-64 relative overflow-hidden border-0 shadow-lg">
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            mapStyle === "satellite"
              ? "bg-gradient-to-br from-green-900 via-green-800 to-green-700"
              : "bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950/20 dark:via-gray-900 dark:to-green-900/20"
          }`}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}
        >
          <div className="absolute inset-0">
            {/* Main highways */}
            <div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-400 dark:bg-gray-600 transform -translate-y-1/2 shadow-md border-t border-b border-gray-500"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-gray-400 dark:bg-gray-600 transform -translate-x-1/2 shadow-md border-l border-r border-gray-500"></div>

            {/* Secondary streets with lane markings */}
            <div className="absolute top-1/4 left-0 right-0 h-2 bg-gray-300 dark:bg-gray-700 shadow-sm">
              <div
                className="absolute top-1/2 left-0 right-0 h-0.5 bg-white dark:bg-gray-400 opacity-60 transform -translate-y-1/2"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent, transparent 8px, currentColor 8px, currentColor 12px)",
                }}
              ></div>
            </div>
            <div className="absolute top-3/4 left-0 right-0 h-2 bg-gray-300 dark:bg-gray-700 shadow-sm">
              <div
                className="absolute top-1/2 left-0 right-0 h-0.5 bg-white dark:bg-gray-400 opacity-60 transform -translate-y-1/2"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent, transparent 8px, currentColor 8px, currentColor 12px)",
                }}
              ></div>
            </div>
            <div className="absolute left-1/4 top-0 bottom-0 w-2 bg-gray-300 dark:bg-gray-700 shadow-sm">
              <div
                className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white dark:bg-gray-400 opacity-60 transform -translate-x-1/2"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 8px, currentColor 8px, currentColor 12px)",
                }}
              ></div>
            </div>
            <div className="absolute left-3/4 top-0 bottom-0 w-2 bg-gray-300 dark:bg-gray-700 shadow-sm">
              <div
                className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white dark:bg-gray-400 opacity-60 transform -translate-x-1/2"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 8px, currentColor 8px, currentColor 12px)",
                }}
              ></div>
            </div>

            {/* Buildings with more detail */}
            <div className="absolute top-6 left-8 w-10 h-16 bg-gray-500 dark:bg-gray-600 rounded-sm shadow-lg">
              <div className="absolute top-1 left-1 right-1 h-2 bg-gray-600 dark:bg-gray-700 rounded-sm"></div>
              <div className="grid grid-cols-2 gap-1 p-1 mt-3">
                <div className="w-2 h-2 bg-yellow-300 rounded-sm opacity-80"></div>
                <div className="w-2 h-2 bg-yellow-300 rounded-sm opacity-60"></div>
                <div className="w-2 h-2 bg-yellow-300 rounded-sm opacity-90"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
              </div>
            </div>

            <div className="absolute top-8 left-24 w-8 h-12 bg-gray-400 dark:bg-gray-700 rounded-sm shadow-md">
              <div className="grid grid-cols-2 gap-0.5 p-0.5 mt-1">
                <div className="w-1.5 h-1.5 bg-yellow-200 rounded-sm opacity-70"></div>
                <div className="w-1.5 h-1.5 bg-yellow-200 rounded-sm opacity-50"></div>
              </div>
            </div>

            <div className="absolute bottom-8 right-20 w-12 h-18 bg-gray-500 dark:bg-gray-600 rounded-sm shadow-lg">
              <div className="absolute top-1 left-1 right-1 h-2 bg-gray-600 dark:bg-gray-700 rounded-sm"></div>
              <div className="grid grid-cols-3 gap-0.5 p-1 mt-3">
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-sm opacity-80"></div>
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-sm opacity-60"></div>
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-sm opacity-90"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-sm opacity-70"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-sm"></div>
              </div>
            </div>

            <div className="absolute top-12 right-12 w-6 h-8 bg-gray-400 dark:bg-gray-700 rounded-sm shadow-md">
              <div className="w-2 h-2 bg-yellow-200 rounded-sm opacity-60 m-1"></div>
            </div>

            {/* Parks and green areas */}
            <div className="absolute bottom-6 left-12 w-16 h-12 bg-green-200 dark:bg-green-800 rounded-lg opacity-70 shadow-sm">
              <div className="absolute top-2 left-2 w-2 h-6 bg-green-600 dark:bg-green-400 rounded-full opacity-80"></div>
              <div className="absolute top-1 right-3 w-2 h-7 bg-green-600 dark:bg-green-400 rounded-full opacity-70"></div>
              <div className="absolute bottom-2 left-6 w-2 h-4 bg-green-600 dark:bg-green-400 rounded-full opacity-90"></div>
            </div>
            <div className="absolute top-4 right-8 w-12 h-8 bg-green-200 dark:bg-green-800 rounded-lg opacity-60 shadow-sm">
              <div className="absolute top-1 left-2 w-1.5 h-4 bg-green-600 dark:bg-green-400 rounded-full opacity-80"></div>
              <div className="absolute top-0 right-2 w-1.5 h-5 bg-green-600 dark:bg-green-400 rounded-full opacity-70"></div>
            </div>

            {/* Traffic lights */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-gray-800 rounded-full shadow-sm">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full opacity-80"></div>
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-yellow-500 rounded-full opacity-40"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full opacity-90 animate-pulse"></div>
            </div>
          </div>

          {/* Tu ubicación */}
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="relative">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse-slow relative z-10">
                <div className="absolute -top-2 -left-2 w-10 h-10 bg-blue-500/20 rounded-full animate-ping"></div>
                <div className="absolute -top-4 -left-4 w-14 h-14 bg-blue-500/10 rounded-full animate-ping animation-delay-1000"></div>
              </div>
              <div className="absolute -top-8 -left-2 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg border">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">Tu ubicación</div>
                  <div className="w-2 h-2 bg-white dark:bg-gray-800 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-r border-b"></div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute transition-all duration-1000 ease-in-out z-20"
            style={{
              left: `${currentRoute.x}%`,
              top: `${currentRoute.y}%`,
              transform: `translate(-50%, -50%) ${currentRoute.x > (truckRoutes[Math.max(currentRouteIndex - 1, 0)]?.x || 0) ? "scaleX(-1)" : "scaleX(1)"}`,
            }}
          >
            <div className="relative">
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg border ${currentRoute.action === "pickup" ? "animate-bounce" : ""}`}
              >
                <Truck
                  className={`w-6 h-6 ${currentRoute.action === "destination" ? "text-blue-600" : "text-green-600"}`}
                />
              </div>
              <div
                className={`absolute -top-2 -right-1 w-3 h-3 rounded-full animate-pulse border-2 border-white ${
                  currentRoute.action === "destination"
                    ? "bg-blue-500"
                    : currentRoute.action === "pickup"
                      ? "bg-orange-500"
                      : "bg-green-500"
                }`}
              ></div>

              {/* Exhaust smoke when moving */}
              {currentRoute.action === "moving" && (
                <>
                  <div className="absolute -left-2 top-1 w-1 h-1 bg-gray-400 rounded-full animate-ping opacity-60"></div>
                  <div className="absolute -left-3 top-0 w-1 h-1 bg-gray-300 rounded-full animate-ping opacity-40 animation-delay-200"></div>
                </>
              )}

              <div className="absolute -top-12 -left-8 text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-lg opacity-90 transition-opacity">
                Camión #247 - {truckStatus}
                <div className="w-2 h-2 bg-gray-800 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-none border-b"
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-none"
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border"
            onClick={() => setMapStyle(mapStyle === "default" ? "satellite" : "default")}
          >
            <Layers className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border"
            onClick={resetRoute}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t p-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={`${
                  currentRoute.action === "destination"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : currentRoute.action === "pickup"
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                }`}
              >
                <Navigation className="w-3 h-3 mr-1" />
                {truckStatus}
              </Badge>
              <span className="text-muted-foreground">
                {currentRoute.action === "destination"
                  ? "Llegó!"
                  : currentRoute.action === "gone"
                    ? "Completado"
                    : `ETA: ${Math.max(15 - currentRouteIndex * 2, 2)} min`}
              </span>
            </div>
            <button onClick={toggleMovement} className="text-muted-foreground hover:text-foreground transition-colors">
              {isMoving ? "⏸️ Pausar" : "▶️ Reanudar"}
            </button>
          </div>
        </div>
      </Card>

      {userAddress && (
        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Destino confirmado</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">{userAddress}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
