"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar, Trash2, Bell, Plus, X, Check } from "lucide-react"

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Task {
  id: string
  date: number
  title: string
  description: string
  type: "regular" | "recycling" | "organic" | "maintenance" | "reminder"
  time: string
  priority: "low" | "medium" | "high"
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      date: 15,
      title: "Recolección Regular",
      description: "Basura doméstica",
      type: "regular",
      time: "08:00",
      priority: "high",
    },
    {
      id: "2",
      date: 18,
      title: "Reciclaje",
      description: "Plásticos y cartón",
      type: "recycling",
      time: "09:30",
      priority: "medium",
    },
    {
      id: "3",
      date: 22,
      title: "Recolección Regular",
      description: "Basura doméstica",
      type: "regular",
      time: "08:00",
      priority: "high",
    },
    {
      id: "4",
      date: 25,
      title: "Orgánicos",
      description: "Residuos orgánicos",
      type: "organic",
      time: "07:30",
      priority: "medium",
    },
    {
      id: "5",
      date: 29,
      title: "Recolección Regular",
      description: "Basura doméstica",
      type: "regular",
      time: "08:00",
      priority: "high",
    },
  ])

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "reminder" as Task["type"],
    time: "08:00",
    priority: "medium" as Task["priority"],
  })

  const today = new Date().getDate()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const getTasksForDay = (day: number) => {
    return tasks.filter((task) => task.date === day)
  }

  const getTaskColor = (type: string) => {
    switch (type) {
      case "regular":
        return "bg-green-500"
      case "recycling":
        return "bg-blue-500"
      case "organic":
        return "bg-orange-500"
      case "maintenance":
        return "bg-purple-500"
      case "reminder":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTaskLabel = (type: string) => {
    switch (type) {
      case "regular":
        return "Basura Regular"
      case "recycling":
        return "Reciclaje"
      case "organic":
        return "Orgánicos"
      case "maintenance":
        return "Mantenimiento"
      case "reminder":
        return "Recordatorio"
      default:
        return "Tarea"
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === "next" ? 1 : -1), 1))
  }

  const handleDateClick = (day: number) => {
    setSelectedDate(day)
    setShowTaskForm(true)
  }

  const handleAddTask = () => {
    if (newTask.title.trim() && selectedDate) {
      const task: Task = {
        id: Date.now().toString(),
        date: selectedDate,
        title: newTask.title,
        description: newTask.description,
        type: newTask.type,
        time: newTask.time,
        priority: newTask.priority,
      }
      setTasks([...tasks, task])
      setNewTask({ title: "", description: "", type: "reminder", time: "08:00", priority: "medium" })
      setShowTaskForm(false)
      setSelectedDate(null)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const closeTaskForm = () => {
    setShowTaskForm(false)
    setSelectedDate(null)
    setNewTask({ title: "", description: "", type: "reminder", time: "08:00", priority: "medium" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span>Calendario de Recolección</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 relative">
          {/* Month Navigation - Optimizada para móviles */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="h-8 w-8 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-base sm:text-lg font-semibold">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="h-8 w-8 p-0">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid - Optimizada para móviles */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center">
            {/* Day headers */}
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div key={day} className="p-1 sm:p-2 text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="p-1 sm:p-2"></div>
            ))}

            {/* Calendar days - Optimizados para móviles */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dayTasks = getTasksForDay(day)
              const isToday = day === today && currentMonth === new Date().getMonth()

              return (
                <div
                  key={day}
                  className={`relative p-1 sm:p-2 h-10 sm:h-12 flex items-center justify-center text-xs sm:text-sm transition-all duration-200 hover:bg-muted/50 rounded-lg cursor-pointer ${
                    isToday ? "bg-primary text-primary-foreground font-bold" : ""
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  <span className="relative z-10">{day}</span>

                  {dayTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`absolute inset-0 ${getTaskColor(task.type)} rounded-lg opacity-20 animate-pulse-slow`}
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div
                        className={`absolute inset-0 ${getTaskColor(task.type)} rounded-lg animate-ping opacity-30`}
                      ></div>
                    </div>
                  ))}

                  {dayTasks.length > 0 && (
                    <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 flex space-x-0.5">
                      {dayTasks.slice(0, 2).map((task, index) => (
                        <div
                          key={task.id}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${getTaskColor(task.type)} rounded-full border border-white animate-pulse`}
                        ></div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full border border-white text-xs flex items-center justify-center">
                          +
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Task Form - Completamente optimizado para móviles */}
          {showTaskForm && (
            <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-lg border shadow-lg z-50 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="text-base sm:text-lg font-semibold">
                  {selectedDate && `Tareas para el ${selectedDate} de ${monthNames[currentMonth]}`}
                </h4>
                <Button variant="ghost" size="sm" onClick={closeTaskForm} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Tareas existentes - Optimizadas para móviles */}
              {selectedDate && getTasksForDay(selectedDate).length > 0 && (
                <div className="mb-3 sm:mb-4 space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Tareas existentes:</h5>
                  {getTasksForDay(selectedDate).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className={`w-3 h-3 ${getTaskColor(task.type)} rounded-full flex-shrink-0`}></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.time}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para nueva tarea - Optimizado para móviles */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Agregar nueva tarea:</h5>

                <Input
                  placeholder="Título de la tarea"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="h-9 sm:h-10 text-sm"
                />

                <Textarea
                  placeholder="Descripción (opcional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="h-16 sm:h-20 text-sm resize-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Select
                    value={newTask.type}
                    onValueChange={(value: Task["type"]) => setNewTask({ ...newTask, type: value })}
                  >
                    <SelectTrigger className="h-9 sm:h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Basura Regular</SelectItem>
                      <SelectItem value="recycling">Reciclaje</SelectItem>
                      <SelectItem value="organic">Orgánicos</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="reminder">Recordatorio</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>

                <Select
                  value={newTask.priority}
                  onValueChange={(value: Task["priority"]) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Prioridad Baja</SelectItem>
                    <SelectItem value="medium">Prioridad Media</SelectItem>
                    <SelectItem value="high">Prioridad Alta</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button onClick={handleAddTask} className="flex-1 h-9 sm:h-10 text-sm">
                    <Check className="w-4 h-4 mr-2" />
                    Agregar Tarea
                  </Button>
                  <Button variant="outline" onClick={closeTaskForm} className="h-9 sm:h-10 text-sm bg-transparent">
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Legend - Optimizada para móviles */}
          {!showTaskForm && (
            <div className="space-y-3 pt-3 sm:pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Próximas Recolecciones</span>
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(today)
                    setShowTaskForm(true)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {tasks.slice(0, 3).map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div
                        className={`w-3 h-3 ${getTaskColor(task.type)} rounded-full animate-pulse flex-shrink-0`}
                      ></div>
                      <span className="text-sm truncate">{getTaskLabel(task.type)}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-medium">
                        {task.date} de {monthNames[currentMonth]}
                      </div>
                      <div className="text-xs text-muted-foreground">{task.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full h-9 sm:h-10 bg-transparent text-sm" variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Activar Recordatorios
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
