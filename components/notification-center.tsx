"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Truck, AlertTriangle, CheckCircle, X, MapPin, Timer, Zap } from "lucide-react"
import { storage } from "@/lib/storage"

interface Notification {
  id: string
  type: "arriving" | "delayed" | "completed" | "route_change" | "weather_alert" | "task_reminder"
  message: string
  time: string
  isNew: boolean
  priority: "high" | "medium" | "low"
  estimatedTime?: string
  location?: string
}

interface NotificationCenterProps {
  onTaskNotification?: (taskId: string, taskTitle: string) => void
}

export function NotificationCenter({ onTaskNotification }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "arriving",
      message: "🚛 Camión recolector #247 se encuentra a 3 cuadras de tu ubicación",
      time: "Hace 2 min",
      isNew: true,
      priority: "high",
      estimatedTime: "8-12 min",
      location: "Av. Principal con Calle 15",
    },
    {
      id: "2",
      type: "route_change",
      message: "📍 Ruta optimizada: El camión tomará la Calle 12 para evitar construcción",
      time: "Hace 5 min",
      isNew: true,
      priority: "medium",
      location: "Sector Norte",
    },
    {
      id: "3",
      type: "weather_alert",
      message: "🌧️ Posible retraso de 10-15 min debido a lluvia ligera en la zona",
      time: "Hace 8 min",
      isNew: true,
      priority: "medium",
    },
    {
      id: "4",
      type: "completed",
      message: "✅ Recolección completada exitosamente en Calle 10. Próxima parada: tu ubicación",
      time: "Hace 15 min",
      isNew: false,
      priority: "low",
      location: "Calle 10, Casa #45",
    },
  ])

  const [currentTime, setCurrentTime] = useState(new Date())
  const [sentTaskNotifications, setSentTaskNotifications] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)

      checkTaskNotifications(now)

      // Simulación de nuevas notificaciones (menos frecuente)
      if (Math.random() > 0.98) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "arriving",
          message: `🚛 Actualización: Camión #247 ahora está a ${Math.floor(Math.random() * 5) + 1} cuadras`,
          time: "Ahora",
          isNew: true,
          priority: "high",
          estimatedTime: `${Math.floor(Math.random() * 10) + 5}-${Math.floor(Math.random() * 10) + 15} min`,
        }

        setNotifications((prev) => [newNotification, ...prev.slice(0, 4)])
      }
    }, 1000) // Actualizar cada segundo para precisión

    return () => clearInterval(timer)
  }, [])

  const checkTaskNotifications = (now: Date) => {
    const currentTimeString = now.toTimeString().slice(0, 5) // HH:MM format
    const currentDateString = now.toISOString().split("T")[0]

    const agendaItems = storage.getAgendaItems()
    const notificationsEnabled = storage.getNotificationSettings()

    if (!notificationsEnabled) return

    agendaItems.forEach((item) => {
      // Verificar si la tarea es para hoy y la hora coincide o es menor a la hora actual
      if (item.date === currentDateString && !item.completed && item.time) {
        const taskTime = item.time
        const currentTime = currentTimeString

        const taskNotificationId = `${item.id}-${item.date}-${item.time}`

        // Comparar si la hora de la tarea es menor o igual a la hora actual
        if (taskTime <= currentTime && !sentTaskNotifications.has(taskNotificationId)) {
          const taskNotification: Notification = {
            id: `task-${item.id}-${Date.now()}`,
            type: "task_reminder",
            message: `⏰ Es hora de: ${item.title}`,
            time: "Ahora",
            isNew: true,
            priority: item.priority,
            location: item.description || undefined,
          }

          setNotifications((prev) => [taskNotification, ...prev.slice(0, 4)])

          setSentTaskNotifications((prev) => new Set([...prev, taskNotificationId]))

          // Callback opcional para manejar la notificación
          if (onTaskNotification) {
            onTaskNotification(item.id, item.title)
          }
        }
      }
    })
  }

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isNew: false } : n)))
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === "high" ? "w-5 h-5" : "w-4 h-4"

    switch (type) {
      case "arriving":
        return <Truck className={`${iconClass} text-blue-600`} />
      case "delayed":
        return <Timer className={`${iconClass} text-orange-600`} />
      case "route_change":
        return <MapPin className={`${iconClass} text-purple-600`} />
      case "weather_alert":
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />
      case "completed":
        return <CheckCircle className={`${iconClass} text-green-600`} />
      case "task_reminder":
        return <Clock className={`${iconClass} text-red-600`} />
      default:
        return <Clock className={`${iconClass} text-gray-600`} />
    }
  }

  const getNotificationColor = (type: string, priority: string) => {
    const baseClasses = priority === "high" ? "ring-2 ring-offset-1" : ""

    switch (type) {
      case "arriving":
        return `border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-950/20 dark:to-blue-900/30 ${priority === "high" ? "ring-blue-300" : ""} ${baseClasses}`
      case "delayed":
        return `border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-950/20 dark:to-orange-900/30 ${priority === "high" ? "ring-orange-300" : ""} ${baseClasses}`
      case "route_change":
        return `border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-950/20 dark:to-purple-900/30 ${priority === "high" ? "ring-purple-300" : ""} ${baseClasses}`
      case "weather_alert":
        return `border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:border-yellow-800 dark:from-yellow-950/20 dark:to-yellow-900/30 ${priority === "high" ? "ring-yellow-300" : ""} ${baseClasses}`
      case "completed":
        return `border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:border-green-800 dark:from-green-950/20 dark:to-green-900/30 ${priority === "high" ? "ring-green-300" : ""} ${baseClasses}`
      case "task_reminder":
        return `border-red-200 bg-gradient-to-r from-red-50 to-red-100 dark:border-red-800 dark:from-red-950/20 dark:to-red-900/30 ${priority === "high" ? "ring-red-300" : ""} ${baseClasses}`
      default:
        return `border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-gray-800 dark:from-gray-950/20 dark:to-gray-900/30 ${baseClasses}`
    }
  }

  const newNotificationsCount = notifications.filter((n) => n.isNew).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">Centro de Alertas</h3>
          {newNotificationsCount > 0 && (
            <Badge variant="destructive" className="text-xs px-2 py-0.5 animate-pulse">
              {newNotificationsCount} nuevas
            </Badge>
          )}
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">En vivo</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-mono tabular-nums">
            {currentTime.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No hay notificaciones nuevas</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 ${getNotificationColor(
                notification.type,
                notification.priority,
              )} ${notification.isNew ? "animate-slide-in" : ""}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.priority === "high" && (
                      <Badge variant="destructive" className="text-xs ml-2 animate-pulse">
                        Urgente
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                    {notification.estimatedTime && (
                      <Badge variant="outline" className="text-xs">
                        ETA: {notification.estimatedTime}
                      </Badge>
                    )}
                  </div>

                  {notification.location && (
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{notification.location}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  {notification.isNew && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="pt-3 border-t border-border/50">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado del servicio:</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-medium">Operativo</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Camiones activos:</span>
            <span className="font-medium">3 en tu zona</span>
          </div>
        </div>
      </div>
    </div>
  )
}
