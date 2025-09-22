// MapTiler Geocoding API integration
const MAPTILER_API_KEY = "XZJESfRiXjvzKz6iV9Sh"

const SANTANDER_BOUNDS = {
  minLng: -74.2,
  maxLng: -72.3,
  minLat: 5.8,
  maxLat: 7.8,
}

const REFERENCE_ADDRESSES = {
  "colegio técnico industrial josé elías puyana": {
    coordinates: [-73.0839186559978, 7.064693786161123] as [number, number],
    formattedAddress: "Colegio Técnico Industrial José Elías Puyana SEDE A, Cl. 4 #11-79, Floridablanca, Santander",
  },
}

export interface GeocodingResult {
  coordinates: [number, number]
  formattedAddress: string
  isValid: boolean
  suggestions?: string[]
}

function isWithinSantander(coordinates: [number, number]): boolean {
  const [lng, lat] = coordinates
  return (
    lng >= SANTANDER_BOUNDS.minLng &&
    lng <= SANTANDER_BOUNDS.maxLng &&
    lat >= SANTANDER_BOUNDS.minLat &&
    lat <= SANTANDER_BOUNDS.maxLat
  )
}

function normalizeAddress(address: string): string {
  return (
    address
      .toLowerCase()
      .trim()
      // Convert Google Maps abbreviations
      .replace(/\bcl\b\.?/g, "calle")
      .replace(/\bcr\b\.?/g, "carrera")
      .replace(/\bkr\b\.?/g, "carrera")
      .replace(/\btv\b\.?/g, "transversal")
      .replace(/\bav\b\.?/g, "avenida")
      .replace(/\bdiag\b\.?/g, "diagonal")
      .replace(/\bapto\b\.?/g, "apartamento")
      .replace(/\bapt\b\.?/g, "apartamento")
      .replace(/\bno\b\.?/g, "#")
      // Remove extra spaces and normalize
      .replace(/\s+/g, " ")
      .trim()
  )
}

function checkReferenceAddress(address: string): GeocodingResult | null {
  const normalized = normalizeAddress(address)

  for (const [key, value] of Object.entries(REFERENCE_ADDRESSES)) {
    if (normalized.includes(key) || key.includes(normalized.split(",")[0])) {
      return {
        coordinates: value.coordinates,
        formattedAddress: value.formattedAddress,
        isValid: true,
      }
    }
  }

  return null
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    const referenceResult = checkReferenceAddress(address)
    if (referenceResult) {
      console.log("[v0] Found reference address:", referenceResult)
      return referenceResult
    }

    const normalizedAddress = normalizeAddress(address)

    const apiUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(normalizedAddress)}.json`
    const params = new URLSearchParams({
      key: MAPTILER_API_KEY,
      limit: "15",
      proximity: "-73.1198,7.1193",
      country: "CO",
      types: "address,poi,place",
      language: "es",
      autocomplete: "false",
    })

    const response = await fetch(`${apiUrl}?${params.toString()}`)

    if (!response.ok) {
      console.log("[v0] API Response status:", response.status, response.statusText)
      const errorText = await response.text()
      console.log("[v0] API Error response:", errorText)
      throw new Error(`Geocoding request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Geocoding response:", data)

    if (data.features && data.features.length > 0) {
      const santanderFeatures = data.features.filter((feature: any) => {
        const coordinates = feature.center as [number, number]
        const placeName = feature.place_name.toLowerCase()
        const context = feature.context || []

        // Check if it's within Santander bounds
        if (!isWithinSantander(coordinates)) return false

        // Check for Santander context or place names
        const hasSantanderContext = context.some(
          (ctx: any) =>
            ctx.text?.toLowerCase().includes("santander") ||
            ctx.text?.toLowerCase().includes("bucaramanga") ||
            ctx.text?.toLowerCase().includes("floridablanca") ||
            ctx.text?.toLowerCase().includes("girón") ||
            ctx.text?.toLowerCase().includes("giron") ||
            ctx.text?.toLowerCase().includes("piedecuesta"),
        )

        const hasSantanderInName =
          placeName.includes("santander") ||
          placeName.includes("bucaramanga") ||
          placeName.includes("floridablanca") ||
          placeName.includes("girón") ||
          placeName.includes("giron") ||
          placeName.includes("piedecuesta") ||
          placeName.includes("lebrija") ||
          placeName.includes("rionegro") ||
          placeName.includes("los santos")

        return hasSantanderContext || hasSantanderInName
      })

      if (santanderFeatures.length > 0) {
        const sortedFeatures = santanderFeatures.sort((a: any, b: any) => {
          // Prioritize exact address matches
          const aIsAddress = a.properties?.kind === "address" || a.place_type?.includes("address")
          const bIsAddress = b.properties?.kind === "address" || b.place_type?.includes("address")

          if (aIsAddress && !bIsAddress) return -1
          if (!aIsAddress && bIsAddress) return 1

          // Then prioritize by relevance score
          const aRelevance = a.relevance || 0
          const bRelevance = b.relevance || 0

          return bRelevance - aRelevance
        })

        const feature = sortedFeatures[0]
        return {
          coordinates: feature.center as [number, number],
          formattedAddress: feature.place_name,
          isValid: true,
          suggestions: sortedFeatures.slice(1, 4).map((f: any) => f.place_name),
        }
      }
    }

    return {
      coordinates: [0, 0],
      formattedAddress: address,
      isValid: false,
      suggestions: [
        "La dirección debe estar ubicada en Santander, Colombia",
        "Intenta con formato: Calle/Carrera + Número + Barrio + Ciudad",
        "Ejemplo: Calle 45 #23-67, Bucaramanga, Santander",
      ],
    }
  } catch (error) {
    console.error("Geocoding error:", error)
    console.log("[v0] Full error details:", error)
    return {
      coordinates: [0, 0],
      formattedAddress: address,
      isValid: false,
      suggestions: ["Error al validar la dirección. Intenta con una dirección más específica."],
    }
  }
}

export async function reverseGeocode(coordinates: [number, number]): Promise<string> {
  try {
    const [lng, lat] = coordinates
    const response = await fetch(`https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_API_KEY}`)

    if (!response.ok) {
      throw new Error("Reverse geocoding request failed")
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name
    }

    return "Ubicación desconocida"
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return "Error al obtener ubicación"
  }
}
