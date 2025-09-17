"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, Navigation, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface InteractiveMapProps {
  userAddress: string
}

const truckRoutes = [
  { x: 5, y: 20, action: "pickup", duration: 3000 },
  { x: 15, y: 35, action: "moving", duration: 2500 },
  { x: 25, y: 15, action: "pickup", duration: 3000 },
  { x: 40, y: 45, action: "moving", duration: 2800 },
  { x: 55, y: 25, action: "pickup", duration: 2500 },
  { x: 70, y: 60, action: "moving", duration: 3000 },
  { x: 85, y: 50, action: "destination", duration: 3500 }, // Tu ubicación
  { x: 90, y: 45, action: "leaving", duration: 2000 },
  { x: 95, y: 40, action: "gone", duration: 2500 },
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
    <div className="space-y-3 sm:space-y-4">
      <Card className="h-48 sm:h-64 relative overflow-hidden border-0 shadow-lg">
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            mapStyle === "satellite"
              ? "bg-gradient-to-br from-green-900 via-green-800 to-green-700"
              : "bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950/20 dark:via-gray-900 dark:to-green-900/20"
          }`}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}
        >
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
        <div className="absolute right-8 sm:right-12 top-1/2 transform -translate-y-1/2">
          <div className="relative">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full border-2 sm:border-4 border-white shadow-lg animate-pulse-slow relative z-10">
              <div className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 w-7 h-7 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full animate-ping"></div>
              <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-9 h-9 sm:w-14 sm:h-14 bg-blue-500/10 rounded-full animate-ping animation-delay-1000"></div>
            </div>
            <div className="absolute -top-6 sm:-top-8 -left-8 sm:-left-2 text-xs bg-white dark:bg-gray-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded shadow-lg border max-w-20 sm:max-w-none">
              <div className="text-center">
                <div className="font-semibold text-blue-600 text-xs">Tu ubicación</div>
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
              className={`bg-white dark:bg-gray-800 rounded-lg p-0.5 sm:p-1 shadow-lg border ${currentRoute.action === "pickup" ? "animate-bounce" : ""}`}
            >
              <Truck
                className={`w-5 h-5 sm:w-6 sm:h-6 -scale-x-100 ${currentRoute.action === "destination" ? "text-blue-600" : "text-green-600"}`}
            />
            </div>
            <div
              className={`absolute -top-1 sm:-top-2 -right-0.5 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse border border-white sm:border-2 ${
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

            <div className="absolute -top-8 sm:-top-12 -left-6 sm:-left-8 text-xs bg-gray-800 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded shadow-lg opacity-90 transition-opacity max-w-24 sm:max-w-none">
              <div className="hidden sm:block text-xs">Camión #247 - {truckStatus}</div>
              <div className="sm:hidden">{truckStatus}</div>
              <div className="w-2 h-2 bg-gray-800 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Controles */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col space-y-1 sm:space-y-2 z-30">
        

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border"
          onClick={() => setMapStyle(mapStyle === "default" ? "satellite" : "default")}
        >
          <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border"
          onClick={resetRoute}
        >
          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>

      {/* Barra de estado */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t p-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs space-y-1 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className={`text-xs ${
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
          <button
            onClick={toggleMovement}
            className="text-muted-foreground hover:text-foreground transition-colors text-left sm:text-center"
          >
            {isMoving ? "⏸️ Pausar" : "▶️ Reanudar"}
          </button>
        </div>
      </div>
    </div>
  )
}
