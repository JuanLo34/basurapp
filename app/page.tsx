"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
      {!isLoggedIn ? <LoginForm onLogin={() => setIsLoggedIn(true)} /> : <Dashboard onLogout={handleLogout} />}
    </main>
  )
}
