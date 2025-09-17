"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddressInput } from "@/components/address-input"
import { InteractiveMap } from "@/components/interactive-map"
import { TodayAgenda } from "@/components/today-agenda"
import { NotificationCenter } from "@/components/notification-center"
import { ProfileModal } from "@/components/profile-modal"
import { CalendarModal } from "@/components/calendar-modal"
import { Trash2, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [userAddress, setUserAddress] = useState("")
  const [showProfile, setShowProfile] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  const handleLogout = () => {
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center animate-pulse">
              <Trash2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                BASURAPP
              </h1>
              <p className="text-sm text-muted-foreground">Panel de Control</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-primary/10"
              onClick={() => setShowProfile(true)}
            >
              <User className="w-4 h-4 mr-2" />
              Perfil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Mini App 1: Address Input */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center animate-bounce">
                  <span className="text-primary font-bold">📍</span>
                </div>
                <span>Mi Dirección</span>
              </CardTitle>
              <CardDescription>Ingresa tu dirección para personalizar el servicio</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <AddressInput onAddressChange={setUserAddress} />
            </CardContent>
          </Card>

          {/* Mini App 2: Interactive Map */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center animate-pulse">
                  <span className="text-accent font-bold">🗺️</span>
                </div>
                <span>Mapa en Vivo</span>
              </CardTitle>
              <CardDescription>Seguimiento en tiempo real de los camiones</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <InteractiveMap userAddress={userAddress} />
            </CardContent>
          </Card>

          {/* Mini App 3: Today's Agenda - Removed onClick from Card and passed onOpenCalendar prop */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg flex items-center justify-center animate-bounce">
                  <span className="text-secondary font-bold">📅</span>
                </div>
                <span>Agenda de Hoy</span>
              </CardTitle>
              <CardDescription>Horarios y recordatorios de recolección</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <TodayAgenda userAddress={userAddress} onOpenCalendar={() => setShowCalendar(true)} />
            </CardContent>
          </Card>

          {/* Mini App 4: Notification Center */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-lg flex items-center justify-center animate-pulse">
                  <span className="text-destructive font-bold">🔔</span>
                </div>
                <span>Notificaciones</span>
              </CardTitle>
              <CardDescription>Alertas y actualizaciones del servicio</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <NotificationCenter />
            </CardContent>
          </Card>
        </div>
      </main>

      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} onLogout={onLogout} />
      <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
    </div>
  )
}
