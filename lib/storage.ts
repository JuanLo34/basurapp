interface StorageData {
  tasks: any[]
  notifications: boolean
  userAddress: string
  agendaItems: any[]
  userEmail: string
  userName: string
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

  saveUserAddress: (userAddress: string) => {
    storage.setData({ userAddress })
  },

  getUserAddress: (): string => {
    const data = storage.getData()
    return data.userAddress || ""
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
}
