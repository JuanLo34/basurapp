interface StorageData {
  tasks: any[]
  notifications: boolean
  userAddress: string
  agendaItems: any[]
  userEmail: string
  userName: string
  notificationsList: any[]
}

const STORAGE_KEY = "basurapp_data"

export const storage = {

  


  // Obtener datos del localStorage
  getData: (): Partial<StorageData> => {
    if (typeof window === "undefined") return {}

    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return {}
    }
  },

  // Guardar datos en localStorage
  setData: (data: Partial<StorageData>) => {
    if (typeof window === "undefined") return

    try {
      const existingData = storage.getData()
      const newData = { ...existingData, ...data }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    } catch (error) {
      console.error("Error writing to localStorage:", error)
    }
  },

  // Limpiar todos los datos
  clearData: () => {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  },

  // Métodos específicos para diferentes tipos de datos
  saveTasks: (tasks: any[]) => {
    storage.setData({ tasks })
  },

  getTasks: (): any[] => {
    const data = storage.getData()
    return data.tasks || []
  },

  saveAgendaItems: (agendaItems: any[]) => {
    storage.setData({ agendaItems })
  },

  getAgendaItems: (): any[] => {
    const data = storage.getData()
    return data.agendaItems || []
  },

  saveNotificationSettings: (notifications: boolean) => {
    storage.setData({ notifications })
  },

  getNotificationSettings: (): boolean => {
    const data = storage.getData()
    return data.notifications || false
  },

    saveUserAddress: (address: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userAddress", address)
    }
  },

  getUserAddress: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userAddress")
    }
    return null
  },

  clearUserAddress: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userAddress")
    }
  },

  saveUserData: (email: string, name?: string) => {
    storage.setData({ userEmail: email, userName: name || "" })
  },

  getUserEmail: (): string => {
    const data = storage.getData()
    return data.userEmail || ""
  },

  getUserName: (): string => {
    const data = storage.getData()
    return data.userName || ""
  },

  saveNotifications: (notifications: any[]) => {
    storage.setData({ notificationsList: notifications })
  },

  getNotifications: (): any[] => {
    const data = storage.getData()
    return data.notificationsList || []
  },

  
}

