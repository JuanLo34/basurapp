"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddressInput } from "@/components/address-input"
import { InteractiveMap } from "@/components/interactive-map"
import { TodayAgenda } from "@/components/today-agenda"
import { NotificationCenter } from "@/components/notification-center"
import { ProfileModal } from "@/components/profile-modal"
import { CalendarModal } from "@/components/calendar-modal"
import { Trash2, LogOut, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [userAddress, setUserAddress] = useState("")
  const [showProfile, setShowProfile] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center animate-pulse">
              <Trash2 className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                BASURAPP
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Panel de Control</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
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

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                <Button
                  variant="ghost"
                  className="justify-start text-left"
                  onClick={() => {
                    setShowProfile(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  <User className="w-4 h-4 mr-3" />
                  Mi Perfil
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-left text-destructive hover:text-destructive"
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Cerrar Sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {/* Mini App 1: Address Input */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3 relative z-10 px-4 sm:px-6 py-3 sm:py-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center animate-bounce">
                  <span className="text-primary font-bold text-sm sm:text-base">📍</span>
                </div>
                <span>Mi Dirección</span>
              </CardTitle>
              <CardDescription className="text-sm">Ingresa tu dirección para personalizar el servicio</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
              <AddressInput onAddressChange={setUserAddress} />
            </CardContent>
          </Card>

          {/* Mini App 2: Interactive Map */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3 relative z-10 px-4 sm:px-6 py-3 sm:py-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center animate-pulse">
                  <span className="text-accent font-bold text-sm sm:text-base">🗺️</span>
                </div>
                <span>Mapa en Vivo</span>
              </CardTitle>
              <CardDescription className="text-sm">Seguimiento en tiempo real de los camiones</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
              <InteractiveMap userAddress={userAddress} />
            </CardContent>
          </Card>

          {/* Mini App 3: Today's Agenda */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3 relative z-10 px-4 sm:px-6 py-3 sm:py-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg flex items-center justify-center animate-bounce">
                  <span className="text-secondary font-bold text-sm sm:text-base">📅</span>
                </div>
                <span>Agenda de Hoy</span>
              </CardTitle>
              <CardDescription className="text-sm">Horarios y recordatorios de recolección</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
              <TodayAgenda userAddress={userAddress} onOpenCalendar={() => setShowCalendar(true)} />
            </CardContent>
          </Card>

          {/* Mini App 4: Notification Center */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3 relative z-10 px-4 sm:px-6 py-3 sm:py-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-lg flex items-center justify-center animate-pulse">
                  <span className="text-destructive font-bold text-sm sm:text-base">🔔</span>
                </div>
                <span>Notificaciones</span>
              </CardTitle>
              <CardDescription className="text-sm">Alertas y actualizaciones del servicio</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
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
