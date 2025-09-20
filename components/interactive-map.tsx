"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Navigation, ZoomIn, ZoomOut, MapPin, Clock, AlertCircle, CheckCircle } from "lucide-react";
import maplibregl from "maplibre-gl";

interface InteractiveMapProps {
  userAddress?: string;
}

// Ruta realista por Bucaramanga
const DEFAULT_ROUTE: GeoJSON.LineString = {
  type: "LineString",
  coordinates: [
    [-73.1198, 7.1193], // Parque García Rovira
    [-73.1205, 7.1201], // Calle 35
    [-73.1215, 7.1208], // Carrera 27
    [-73.1225, 7.1215], // Tu ubicación (simulada)
    [-73.1235, 7.1222], // Continuación ruta
    [-73.1245, 7.1230], // Zona residencial
    [-73.1255, 7.1238], // Final de ruta
  ],
};

const USER_LOCATION = [-73.1225, 7.1215]; // Tu ubicación en la ruta

export default function InteractiveMap({ userAddress = "Bucaramanga, Santander" }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const truckMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const animRef = useRef<number | null>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [truckState, setTruckState] = useState<"approaching" | "moving" | "collecting" | "completed">("approaching");
  const [zoom, setZoom] = useState<number>(15);
  const [mapReady, setMapReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("5-8 min");
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [atUserLocation, setAtUserLocation] = useState(false);
  const [collectionComplete, setCollectionComplete] = useState(false);

  const openMap = () => {
    setIsOpen(true);
    setTimeout(() => initializeMap(), 50);
  };

  const closeMap = () => {
    setIsOpen(false);
    cleanupMap();
  };

  const initializeMap = () => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
          },
        ],
        // Estilo Google Maps
        light: {
          anchor: "viewport",
          intensity: 0.15,
        },
      },
      center: DEFAULT_ROUTE.coordinates[0] as [number, number],
      zoom,
      pitch: 0,
      bearing: 0,
    });

    mapRef.current = map;

    // Controles estilo Google Maps
    map.addControl(new maplibregl.NavigationControl({ 
      showCompass: false,
      visualizePitch: false 
    }), "bottom-right");

    map.on("load", () => {
      // Ruta principal
      if (!map.getSource("route")) {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: DEFAULT_ROUTE,
          },
        });

        // Estilo de ruta similar a Google Maps
        map.addLayer({
          id: "route-casing",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#1976D2",
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 8, 18, 20],
            "line-opacity": 0.6,
          },
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#4285F4",
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 5, 18, 15],
            "line-opacity": 1,
          },
        });

        // Línea de progreso
        map.addSource("progress-route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: DEFAULT_ROUTE.coordinates.slice(0, 1),
            },
          },
        });

        map.addLayer({
          id: "progress-line",
          type: "line",
          source: "progress-route",
          paint: {
            "line-color": "#34A853",
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 6, 18, 16],
            "line-opacity": 1,
          },
        });
      }

      // Marcador de usuario
      const userEl = document.createElement("div");
      userEl.innerHTML = `
        <div style="
          width: 20px;
          height: 20px;
          background: #4285F4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -30px;
            left: -25px;
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            color: #333;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            white-space: nowrap;
          ">Tu ubicación</div>
        </div>
      `;

      const userMarker = new maplibregl.Marker({ 
        element: userEl, 
        anchor: "center" 
      })
        .setLngLat(USER_LOCATION as [number, number])
        .addTo(map);

      userMarkerRef.current = userMarker;

      // Camión de basura más realista
      const truckEl = document.createElement("div");
      truckEl.style.width = "50px";
      truckEl.style.height = "30px";
      truckEl.style.transformOrigin = "center";
      truckEl.style.transition = "transform 0.5s ease-out";
      
      const truckSvg = encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'>
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <dropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
            </filter>
          </defs>
          <g filter="url(#shadow)">
            <!-- Cuerpo del camión -->
            <rect x="4" y="8" width="35" height="14" rx="2" fill="#FF6B35" stroke="#E55A2B" stroke-width="1"/>
            <!-- Cabina -->
            <rect x="39" y="10" width="15" height="10" rx="1" fill="#FF6B35" stroke="#E55A2B" stroke-width="1"/>
            <!-- Ventanas -->
            <rect x="41" y="11" width="5" height="4" rx="0.5" fill="#87CEEB" opacity="0.8"/>
            <rect x="47" y="11" width="5" height="4" rx="0.5" fill="#87CEEB" opacity="0.8"/>
            <!-- Ruedas -->
            <circle cx="15" cy="24" r="3" fill="#2C3E50" stroke="#34495E" stroke-width="0.5"/>
            <circle cx="45" cy="24" r="3" fill="#2C3E50" stroke="#34495E" stroke-width="0.5"/>
            <!-- Detalles -->
            <rect x="6" y="10" width="30" height="2" fill="#E55A2B"/>
            <rect x="6" y="16" width="30" height="2" fill="#E55A2B"/>
          </g>
        </svg>
      `);
      
      truckEl.style.backgroundImage = `url("data:image/svg+xml,${truckSvg}")`;
      truckEl.style.backgroundSize = "contain";
      truckEl.style.backgroundRepeat = "no-repeat";
      truckEl.style.backgroundPosition = "center";

      const truckMarker = new maplibregl.Marker({ 
        element: truckEl, 
        anchor: "center" 
      })
        .setLngLat(DEFAULT_ROUTE.coordinates[0] as [number, number])
        .addTo(map);

      truckMarkerRef.current = truckMarker;

      // Funciones de cálculo geográfico
      function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
        const dLng = (coord1[0] - coord2[0]) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      }

      function calculateBearing(coord1: [number, number], coord2: [number, number]): number {
        const dLng = (coord2[0] - coord1[0]) * Math.PI / 180;
        const lat1 = coord1[1] * Math.PI / 180;
        const lat2 = coord2[1] * Math.PI / 180;
        const y = Math.sin(dLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      }

      function interpolateCoordinate(coord1: [number, number], coord2: [number, number], t: number): [number, number] {
        return [
          coord1[0] + (coord2[0] - coord1[0]) * t,
          coord1[1] + (coord2[1] - coord1[1]) * t
        ];
      }

      // Calcular distancia total de la ruta
      const routeCoords = DEFAULT_ROUTE.coordinates as [number, number][];
      let totalDistance = 0;
      for (let i = 0; i < routeCoords.length - 1; i++) {
        totalDistance += calculateDistance(routeCoords[i], routeCoords[i + 1]);
      }

      // Configuración de animación
      const truckSpeedKmh = 20;
      const speedKms = truckSpeedKmh / 3600;
      const durationSeconds = totalDistance / speedKms;
      
      // Crear muestras de la ruta para animación suave
      const steps = 200;
      const samples: [number, number][] = [];
      const bearings: number[] = [];

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const totalProgress = t * (routeCoords.length - 1);
        const segmentIndex = Math.floor(totalProgress);
        const segmentProgress = totalProgress - segmentIndex;
        
        if (segmentIndex >= routeCoords.length - 1) {
          samples.push(routeCoords[routeCoords.length - 1]);
          bearings.push(bearings[bearings.length - 1] || 0);
        } else {
          const interpolated = interpolateCoordinate(
            routeCoords[segmentIndex],
            routeCoords[segmentIndex + 1],
            segmentProgress
          );
          samples.push(interpolated);
          
          // Calcular bearing entre segmentos
          const bearing = calculateBearing(
            routeCoords[segmentIndex],
            routeCoords[segmentIndex + 1]
          );
          bearings.push(bearing);
        }
      }

      // Encontrar índice más cercano a ubicación del usuario
      let userLocationIndex = Math.floor(samples.length * 0.5); // Por defecto en el medio
      let minDistance = Infinity;
      
      samples.forEach((coord, index) => {
        const distance = calculateDistance(coord, USER_LOCATION as [number, number]) * 1000; // convertir a metros
        if (distance < minDistance) {
          minDistance = distance;
          userLocationIndex = index;
        }
      });

      let startTime = performance.now();
      let pauseStart = 0;
      let totalPauseTime = 0;
      let isAtUser = false;
      let collectionStarted = false;

      function easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }

      function animate(now: number) {
        const elapsed = (now - startTime - totalPauseTime) / 1000;
        const rawProgress = Math.min(1, elapsed / durationSeconds);
        const smoothProgress = easeInOutQuad(rawProgress);
        const idx = Math.floor(smoothProgress * (samples.length - 1));

        setProgress(smoothProgress * 100);
        
        // Actualizar línea de progreso
        const progressCoords = DEFAULT_ROUTE.coordinates.slice(0, 
          Math.floor(smoothProgress * DEFAULT_ROUTE.coordinates.length) + 1
        );
        
        if (map.getSource("progress-route")) {
          (map.getSource("progress-route") as maplibregl.GeoJSONSource).setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: progressCoords,
            },
          });
        }

        const coord = samples[idx] as [number, number];
        truckMarker.setLngLat(coord);

        // Rotación suave del camión
        const bearing = bearings[idx] || 0;
        const truckElement = truckMarker.getElement() as HTMLElement;
        truckElement.style.transform = `rotate(${bearing}deg)`;

        // Velocidad actual simulada
        const speed = smoothProgress < 1 ? Math.floor(15 + Math.random() * 10) : 0;
        setCurrentSpeed(speed);

        // Estados del camión
        if (idx >= userLocationIndex - 5 && idx <= userLocationIndex + 5 && !isAtUser) {
          setTruckState("collecting");
          setAtUserLocation(true);
          isAtUser = true;
          collectionStarted = true;
          
          // Pausa para recolección (5 segundos)
          if (pauseStart === 0) {
            pauseStart = now;
          } else if (now - pauseStart > 5000) {
            totalPauseTime += 5000;
            pauseStart = 0;
            setTruckState("moving");
            setCollectionComplete(true);
          } else {
            // Durante la pausa, no avanzar la animación
            animRef.current = requestAnimationFrame(animate);
            return;
          }
        } else if (smoothProgress >= 1) {
          setTruckState("completed");
          setCurrentSpeed(0);
        } else if (collectionStarted && isAtUser) {
          setTruckState("moving");
        } else {
          setTruckState("approaching");
        }

        // Actualizar tiempo estimado
        const remainingTime = Math.max(0, (durationSeconds - elapsed) / 60);
        setEstimatedTime(remainingTime > 1 ? `${Math.ceil(remainingTime)} min` : "< 1 min");

        if (smoothProgress < 1) {
          animRef.current = requestAnimationFrame(animate);
        }
      }

      animRef.current = requestAnimationFrame(animate);
      setMapReady(true);

      // Auto-zoom cuando el camión se acerca
      function onZoom() {
        const z = map.getZoom();
        setZoom(z);
      }

      map.on("zoom", onZoom);

      const cleanup = () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        map.off("zoom", onZoom);
        if (truckMarkerRef.current) truckMarkerRef.current.remove();
        if (userMarkerRef.current) userMarkerRef.current.remove();
        if (mapRef.current) {
          try {
            mapRef.current.remove();
          } catch (e) {
            console.error("Error cleaning up map:", e);
          }
        }
        truckMarkerRef.current = null;
        userMarkerRef.current = null;
        mapRef.current = null;
        setMapReady(false);
      };

      (initializeMap as any)._cleanup = cleanup;
    });
  };

  function cleanupMap() {
    const fn = (initializeMap as any)._cleanup;
    if (fn) fn();
  }

  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, []);

  const getStateInfo = () => {
    switch (truckState) {
      case "approaching":
        return { 
          label: "Acercándose", 
          color: "bg-blue-500", 
          icon: <Truck className="w-3 h-3" />,
          variant: "default" as const
        };
      case "moving":
        return { 
          label: "En ruta", 
          color: "bg-green-500", 
          icon: <Navigation className="w-3 h-3" />,
          variant: "default" as const
        };
      case "collecting":
        return { 
          label: "Recolectando", 
          color: "bg-orange-500", 
          icon: <AlertCircle className="w-3 h-3" />,
          variant: "destructive" as const
        };
      case "completed":
        return { 
          label: "Completado", 
          color: "bg-gray-500", 
          icon: <CheckCircle className="w-3 h-3" />,
          variant: "secondary" as const
        };
    }
  };

  const stateInfo = getStateInfo();

  return (
    <Card className="relative overflow-hidden bg-white shadow-lg border border-gray-200">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            {atUserLocation && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                <CheckCircle className="w-2 h-2 text-white ml-0.5 mt-0.5" />
              </div>
            )}
          </div>
          
          <div>
            <div className="font-semibold text-gray-900">Camión de Basura</div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              {userAddress}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3" />
              ETA: {estimatedTime} • {currentSpeed} km/h
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge variant={stateInfo.variant} className="flex items-center gap-1">
            {stateInfo.icon}
            {stateInfo.label}
          </Badge>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => (isOpen ? closeMap() : openMap())}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Navigation className="w-4 h-4 mr-1" />
            {isOpen ? "Cerrar" : "Ver mapa"}
          </Button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="px-4 pb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Progreso: {Math.round(progress)}%
          {collectionComplete && (
            <span className="text-green-600 ml-2 font-medium">
              ✓ Basura recolectada
            </span>
          )}
        </div>
      </div>

      {/* Vista previa del mapa */}
      <div className="px-4 pb-4">
        <div
          className="w-full h-48 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => (isOpen ? closeMap() : openMap())}
        >
          {!isOpen && (
            <div 
              className="w-full h-full bg-cover bg-center relative"
              style={{
                backgroundImage: `url('https://tile.openstreetmap.org/15/8069/12637.png')`,
                filter: 'sepia(0.1) contrast(1.1)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                Toca para ver el mapa interactivo
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mapa a pantalla completa */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header estilo Google Maps */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Seguimiento en Tiempo Real</div>
                <div className="text-sm text-gray-600">{stateInfo.label} • {currentSpeed} km/h</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => mapRef.current?.zoomIn()}
                className="w-10 h-10 p-0"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => mapRef.current?.zoomOut()}
                className="w-10 h-10 p-0"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={closeMap}
                className="border-gray-300"
              >
                Cerrar
              </Button>
            </div>
          </div>

          {/* Mapa */}
          <div className="flex-1 relative">
            <div ref={mapContainerRef} className="absolute inset-0" />
            
            {/* Info flotante */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${stateInfo.color}`} />
                <span className="font-medium text-sm">{stateInfo.label}</span>
              </div>
              <div className="text-xs text-gray-600">
                ETA: {estimatedTime} | Velocidad: {currentSpeed} km/h
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Progreso de ruta: {Math.round(progress)}%
              </div>
              {atUserLocation && (
                <div className="text-xs text-green-600 font-medium mt-1">
                  ✓ En tu ubicación
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}