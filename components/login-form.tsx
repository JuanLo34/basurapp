"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Leaf, Recycle } from "lucide-react"
import { storage } from "@/lib/storage"
import Image from "next/image"

interface LoginFormProps {
  onLogin: () => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    storage.saveUserData(email)

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1500)
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Se ha enviado un enlace de recuperación a tu email")
    setShowForgotPassword(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 animate-float">
          <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-accent/30" />
        </div>
        <div className="absolute top-20 sm:top-40 right-10 sm:right-20 animate-float" style={{ animationDelay: "1s" }}>
          <Recycle className="w-8 h-8 sm:w-12 sm:h-12 text-secondary/40" />
        </div>
      </div>

      <Card className="w-full max-w-sm sm:max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6 py-4 sm:py-6">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
            <Image
              src="../public/logo-basurapp.jpeg"
              alt="BASURAPP Logo"
              width={64}
              height={64}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BASURAPP
            </CardTitle>
            <CardDescription className="text-base sm:text-lg mt-2">Gestión inteligente de residuos</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 sm:h-12 border-2 focus:border-accent transition-colors text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 sm:h-12 border-2 focus:border-accent transition-colors text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>

              <Separator className="my-4" />

              <Button
                type="button"
                variant="ghost"
                className="w-full text-accent hover:text-accent/80 hover:bg-accent/10"
                onClick={() => setShowForgotPassword(true)}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Recuperar Contraseña</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ingresa tu email para recibir un enlace de recuperación
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recovery-email" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className="h-11 sm:h-12 border-2 focus:border-accent transition-colors text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold bg-accent hover:bg-accent/90 transition-all duration-300"
              >
                Enviar Enlace
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setShowForgotPassword(false)}
              >
                Volver al inicio de sesión
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
