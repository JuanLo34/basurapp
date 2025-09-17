"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  MapPin,
  Bell,
  BellOff,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Recycle,
  CalendarDays,
} from "lucide-react"
import { storage } from "@/lib/storage"

interface TodayAgendaProps {
  userAddress: string
  onOpenCalendar: () => void
}

interface AgendaItem {
  id: string
  title: string
  description: string
  time: string
  type: "collection" | "reminder" | "maintenance" | "other"
  priority: "high" | "medium" | "low"
  completed: boolean
  date: string
}

export function TodayAgenda({ userAddress, onOpenCalendar }: TodayAgendaProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null)
  const [showNotificationAlert, setShowNotificationAlert] = useState(false)

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([
    {
      id: "1",
      title: "Recolección de basura",
      description: "Recolección programada de residuos orgánicos e inorgánicos",
      time: "08:00",
      type: "collection",
      priority: "high",
      completed: false,
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: "2",
      title: "Recordatorio: Separar reciclables",
      description: "Separar botellas de plástico y papel para reciclaje",
      time: "19:00",
      type: "reminder",
      priority: "medium",
      completed: false,
      date: new Date().toISOString().split("T")[0],
    },
  ])

  useEffect(() => {
    const savedItems = storage.getAgendaItems()
    const savedNotifications = storage.getNotificationSettings()

    if (savedItems.length > 0) {
      setAgendaItems(savedItems)
    }
    setNotificationsEnabled(savedNotifications)
  }, [])

  useEffect(() => {
    storage.saveAgendaItems(agendaItems)
  }, [agendaItems])

  useEffect(() => {
    storage.saveNotificationSettings(notificationsEnabled)
  }, [notificationsEnabled])

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    time: "",
    type: "other" as const,
    priority: "medium" as const,
    date: new Date().toISOString().split("T")[0],
  })

  const today = new Date()
  const todayItems = agendaItems.filter((item) => item.date === today.toISOString().split("T")[0])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "collection":
        return <Recycle className="w-4 h-4" />
      case "reminder":
        return <Bell className="w-4 h-4" />
      case "maintenance":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "collection":
        return "bg-green-500"
      case "reminder":
        return "bg-blue-500"
      case "maintenance":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-50 dark:bg-red-950/20"
      case "medium":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
      case "low":
        return "border-green-500 bg-green-50 dark:bg-green-950/20"
      default:
        return "border-gray-500 bg-gray-50 dark:bg-gray-950/20"
    }
  }

  const addItem = () => {
    if (newItem.title.trim()) {
      const item: AgendaItem = {
        id: Date.now().toString(),
        ...newItem,
        completed: false,
      }
      setAgendaItems([...agendaItems, item])
      setNewItem({
        title: "",
        description: "",
        time: "",
        type: "other",
        priority: "medium",
        date: new Date().toISOString().split("T")[0],
      })
      setIsAddModalOpen(false)
    }
  }

  const updateItem = (id: string, updates: Partial<AgendaItem>) => {
    setAgendaItems((items) => items.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const deleteItem = (id: string) => {
    setAgendaItems((items) => items.filter((item) => item.id !== id))
  }

  const toggleComplete = (id: string) => {
    updateItem(id, { completed: !agendaItems.find((item) => item.id === id)?.completed })
  }

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    if (enabled) {
      setShowNotificationAlert(true)
      setTimeout(() => {
        setShowNotificationAlert(false)
      }, 3000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Today's Date */}
      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-primary">Agenda de Hoy</p>
            <p className="text-sm text-muted-foreground">{formatDate(today)}</p>
          </div>
        </div>

        {/* Two buttons separated with distinct functionalities */}
        <div className="flex items-center space-x-2">
          {/* Button to open calendar */}
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCalendar}
            className="bg-white hover:bg-green-50 border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 hover:border-green-300"
          >
            <CalendarDays className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:rotate-12" />
            Calendario
          </Button>

          {/* Button to add task */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:rotate-90" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-center">Agregar Nueva Tarea</DialogTitle>
                <p className="text-sm text-muted-foreground text-center">Organiza tu día con tareas personalizadas</p>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Título de la tarea *
                  </Label>
                  <Input
                    id="title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Ej: Sacar la basura, Limpiar patio..."
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Descripción (opcional)
                  </Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Agrega detalles adicionales sobre la tarea..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium">
                      Hora programada
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={newItem.time}
                      onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Categoría
                    </Label>
                    <Select
                      value={newItem.type}
                      onValueChange={(value: any) => setNewItem({ ...newItem, type: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collection">
                          <div className="flex items-center space-x-2">
                            <Recycle className="w-4 h-4 text-green-600" />
                            <span>Recolección</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="reminder">
                          <div className="flex items-center space-x-2">
                            <Bell className="w-4 h-4 text-blue-600" />
                            <span>Recordatorio</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="maintenance">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span>Mantenimiento</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span>Otro</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Nivel de prioridad
                  </Label>
                  <Select
                    value={newItem.priority}
                    onValueChange={(value: any) => setNewItem({ ...newItem, priority: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Alta - Urgente</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Media - Normal</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Baja - Cuando puedas</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={addItem}
                    className="flex-1 h-11 bg-primary hover:bg-primary/90 transition-all duration-200"
                    disabled={!newItem.title.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Tarea
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="h-11 px-6 hover:bg-muted/50 transition-all duration-200"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Address Display */}
      {userAddress && (
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Dirección registrada</p>
              <p className="text-xs text-muted-foreground">{userAddress}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <h3 className="font-medium">Tareas del Día ({todayItems.length})</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {todayItems.filter((item) => item.completed).length} completadas
          </Badge>
        </div>

        <div className="space-y-2">
          {todayItems.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay tareas programadas para hoy</p>
              <p className="text-xs">Agrega una nueva tarea para comenzar</p>
            </div>
          ) : (
            todayItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${getPriorityColor(item.priority)} ${
                  item.completed ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleComplete(item.id)}
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        item.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-muted-foreground hover:border-green-500"
                      }`}
                    >
                      {item.completed && <CheckCircle className="w-3 h-3" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${getTypeColor(item.type)}`}></div>
                        {getTypeIcon(item.type)}
                        <h4 className={`font-medium text-sm ${item.completed ? "line-through" : ""}`}>{item.title}</h4>
                        {item.time && (
                          <Badge variant="outline" className="text-xs">
                            {item.time}
                          </Badge>
                        )}
                      </div>

                      {item.description && (
                        <p className={`text-xs text-muted-foreground ${item.completed ? "line-through" : ""}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 ml-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingItem(item)} className="h-8 w-8 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteItem(item.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notification Toggle */}
      <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {notificationsEnabled ? (
              <Bell className="w-5 h-5 text-accent" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <Label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
                Activar notificaciones
              </Label>
              <p className="text-xs text-muted-foreground">Recibe alertas de tus tareas programadas</p>
            </div>
          </div>
          <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
        </div>
      </div>

      {showNotificationAlert && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 animate-in slide-in-from-top-2 duration-300 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">¡Notificaciones Activadas!</p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Te enviaremos alertas sobre tus tareas y recolecciones programadas
              </p>
            </div>
            <div className="ml-auto">
              <CheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Tarea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-time">Hora</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingItem.time}
                    onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-priority">Prioridad</Label>
                  <Select
                    value={editingItem.priority}
                    onValueChange={(value: any) => setEditingItem({ ...editingItem, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    updateItem(editingItem.id, editingItem)
                    setEditingItem(null)
                  }}
                  className="flex-1"
                >
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
