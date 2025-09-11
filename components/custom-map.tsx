"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ClipboardList, Layers, Map, Satellite, BarChart3, TrendingUp } from "lucide-react"
import { VillageActionPlan } from "@/components/export/village-action-plan"
import { useUser } from "@/components/auth/user-context"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface VillageData {
  name: string
  state: string
  district: string
  block: string
  claims: {
    total: number
    granted: number
    pending: number
    individual: number
    community: number
    cfr: number
  }
  assets: {
    farmland: string
    forest: string
    water: string
    degraded: string
  }
  population: number
  tribalPopulation: number
}

interface CustomMapProps {
  villageData: VillageData
}

export function CustomMap({ villageData }: CustomMapProps) {
  const { user, hasPermission } = useUser()
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [mapType, setMapType] = useState<"satellite" | "street">("satellite")
  const [showLayers, setShowLayers] = useState({
    fraClaims: true,
    landAssets: true,
    waterBodies: false,
    heatmap: true,
    clusters: true,
  })
  const [isClient, setIsClient] = useState(false)
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)
  const clusterGroupRef = useRef<any>(null)
  const layersRef = useRef<any>({})

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current || mapLoaded) return

    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          link.crossOrigin = "anonymous"
          document.head.appendChild(link)
        }

        // Load Leaflet JS
        if (!(window as any).L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            script.crossOrigin = "anonymous"
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        const L = (window as any).L

        // Initialize map
        leafletMapRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 12)

        // Add base tile layer
        const satelliteLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          },
        )

        const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        })

        layersRef.current.satellite = satelliteLayer
        layersRef.current.street = streetLayer

        satelliteLayer.addTo(leafletMapRef.current)

        // Add village marker with chart popup
        const villageMarker = L.marker([20.5937, 78.9629]).addTo(leafletMapRef.current)
        villageMarker.bindPopup(`
          <div class="p-3 min-w-[300px]">
            <h3 class="font-semibold text-sm mb-3">${villageData.name}</h3>
            <div class="space-y-2 text-xs mb-3">
              <div>District: ${villageData.district}</div>
              <div>Block: ${villageData.block}</div>
              <div>Total Claims: ${villageData.claims.total}</div>
              <div>Population: ${villageData.population.toLocaleString()}</div>
            </div>
            <canvas id="village-chart" width="250" height="150"></canvas>
            <button class="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded w-full" onclick="window.showAreaDetails('village')">
              View Details
            </button>
          </div>
        `)

        // Add styled polygons with hover effects
        const forestArea = L.polygon(
          [
            [20.58, 78.94],
            [20.585, 78.938],
            [20.588, 78.942],
            [20.583, 78.945],
          ],
          {
            color: "#16a34a",
            fillColor: "#16a34a",
            weight: 2,
            fillOpacity: 0.3,
          },
        ).addTo(leafletMapRef.current)

        forestArea.on("mouseover", function (e) {
          this.setStyle({ weight: 4, fillOpacity: 0.5, dashArray: "10, 5" })
        })
        forestArea.on("mouseout", function (e) {
          this.setStyle({ weight: 2, fillOpacity: 0.3, dashArray: null })
        })
        forestArea.on("click", () => setSelectedArea("forest"))

        const farmlandArea = L.polygon(
          [
            [20.605, 78.98],
            [20.61, 78.978],
            [20.612, 78.986],
            [20.607, 78.988],
          ],
          {
            color: "#ca8a04",
            fillColor: "#ca8a04",
            weight: 2,
            fillOpacity: 0.3,
          },
        ).addTo(leafletMapRef.current)

        farmlandArea.on("mouseover", function (e) {
          this.setStyle({ weight: 4, fillOpacity: 0.5, dashArray: "8, 4" })
        })
        farmlandArea.on("mouseout", function (e) {
          this.setStyle({ weight: 2, fillOpacity: 0.3, dashArray: null })
        })
        farmlandArea.on("click", () => setSelectedArea("farmland"))

        const villageArea = L.polygon(
          [
            [20.592, 78.961],
            [20.597, 78.959],
            [20.599, 78.964],
            [20.594, 78.966],
          ],
          {
            color: "#dc2626",
            fillColor: "#dc2626",
            weight: 3,
            fillOpacity: 0.2,
            dashArray: "5, 5",
          },
        ).addTo(leafletMapRef.current)

        villageArea.on("mouseover", function (e) {
          this.setStyle({ weight: 5, fillOpacity: 0.4, dashArray: "15, 10" })
        })
        villageArea.on("mouseout", function (e) {
          this.setStyle({ weight: 3, fillOpacity: 0.2, dashArray: "5, 5" })
        })
        villageArea.on("click", () => setSelectedArea("village"))

        layersRef.current.forest = forestArea
        layersRef.current.farmland = farmlandArea
        layersRef.current.village = villageArea

        setMapLoaded(true)
        console.log("[v0] Map initialized successfully")
      } catch (error) {
        console.error("[v0] Failed to load Leaflet:", error)
      }
    }

    loadLeaflet()
  }, [isClient, villageData])

  useEffect(() => {
    if (!mapLoaded || !leafletMapRef.current) return

    const loadPlugins = async () => {
      const L = (window as any).L

      // Load heatmap plugin
      if (showLayers.heatmap && !heatLayerRef.current) {
        try {
          if (!L.heatLayer) {
            await new Promise((resolve, reject) => {
              const script = document.createElement("script")
              script.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"
              script.onload = resolve
              script.onerror = reject
              document.head.appendChild(script)
            })
          }

          const heatmapData = [
            [20.615, 78.945, 0.8],
            [20.618, 78.948, 0.6],
            [20.621, 78.952, 0.7],
            [20.616, 78.955, 0.5],
            [20.619, 78.949, 0.9],
            [20.622, 78.954, 0.4],
            [20.617, 78.956, 0.6],
            [20.62, 78.951, 0.8],
          ]

          heatLayerRef.current = L.heatLayer(heatmapData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {
              0.0: "#3B82F6",
              0.5: "#F59E0B",
              1.0: "#EF4444",
            },
          }).addTo(leafletMapRef.current)
        } catch (error) {
          console.log("[v0] Heatmap plugin loading failed:", error)
        }
      }

      // Load clustering plugin
      if (showLayers.clusters && !clusterGroupRef.current) {
        try {
          if (!L.markerClusterGroup) {
            const link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"
            document.head.appendChild(link)

            const linkDefault = document.createElement("link")
            linkDefault.rel = "stylesheet"
            linkDefault.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css"
            document.head.appendChild(linkDefault)

            await new Promise((resolve, reject) => {
              const script = document.createElement("script")
              script.src = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"
              script.onload = resolve
              script.onerror = reject
              document.head.appendChild(script)
            })
          }

          clusterGroupRef.current = L.markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 50,
          })

          const pattaHolders = [
            { lat: 20.57, lng: 78.975, name: "Ram Singh", claims: 2 },
            { lat: 20.572, lng: 78.978, name: "Sita Devi", claims: 1 },
            { lat: 20.575, lng: 78.982, name: "Mohan Lal", claims: 3 },
            { lat: 20.568, lng: 78.985, name: "Geeta Bai", claims: 1 },
            { lat: 20.573, lng: 78.979, name: "Ravi Kumar", claims: 2 },
            { lat: 20.576, lng: 78.984, name: "Sunita Sharma", claims: 1 },
            { lat: 20.569, lng: 78.986, name: "Prakash Yadav", claims: 4 },
            { lat: 20.574, lng: 78.981, name: "Kamala Devi", claims: 2 },
          ]

          pattaHolders.forEach((holder) => {
            const marker = L.marker([holder.lat, holder.lng]).bindPopup(`
              <div class="p-2">
                <h4 class="font-semibold text-sm">${holder.name}</h4>
                <p class="text-xs text-gray-600">Claims: ${holder.claims}</p>
                <button class="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded" onclick="window.showAreaDetails('patta-${holder.name}')">
                  View Details
                </button>
              </div>
            `)
            clusterGroupRef.current.addLayer(marker)
          })

          leafletMapRef.current.addLayer(clusterGroupRef.current)
        } catch (error) {
          console.log("[v0] Clustering plugin loading failed:", error)
        }
      }
    }

    loadPlugins()
  }, [mapLoaded, showLayers.heatmap, showLayers.clusters])

  useEffect(() => {
    if (!leafletMapRef.current || !layersRef.current.satellite || !layersRef.current.street) return

    if (mapType === "satellite") {
      leafletMapRef.current.removeLayer(layersRef.current.street)
      leafletMapRef.current.addLayer(layersRef.current.satellite)
    } else {
      leafletMapRef.current.removeLayer(layersRef.current.satellite)
      leafletMapRef.current.addLayer(layersRef.current.street)
    }
  }, [mapType, mapLoaded])

  useEffect(() => {
    if (!leafletMapRef.current) return

    if (heatLayerRef.current) {
      if (showLayers.heatmap) {
        leafletMapRef.current.addLayer(heatLayerRef.current)
      } else {
        leafletMapRef.current.removeLayer(heatLayerRef.current)
      }
    }

    if (clusterGroupRef.current) {
      if (showLayers.clusters) {
        leafletMapRef.current.addLayer(clusterGroupRef.current)
      } else {
        leafletMapRef.current.removeLayer(clusterGroupRef.current)
      }
    }
  }, [showLayers.heatmap, showLayers.clusters, mapLoaded])

  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).showAreaDetails = (area: string) => {
        setSelectedArea(area)
      }
    }
  }, [])

  if (!isClient) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* Map Type Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur rounded-lg p-2 shadow-lg">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={mapType === "satellite" ? "default" : "outline"}
              onClick={() => setMapType("satellite")}
              className="h-8 px-2"
            >
              <Satellite className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={mapType === "street" ? "default" : "outline"}
              onClick={() => setMapType("street")}
              className="h-8 px-2"
            >
              <Map className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Layer Controls */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4" />
            <h3 className="text-sm font-medium">Map Layers</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showLayers.fraClaims}
                onChange={(e) => setShowLayers((prev) => ({ ...prev, fraClaims: e.target.checked }))}
                className="rounded"
              />
              FRA Claims
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showLayers.landAssets}
                onChange={(e) => setShowLayers((prev) => ({ ...prev, landAssets: e.target.checked }))}
                className="rounded"
              />
              Land Assets
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showLayers.heatmap}
                onChange={(e) => setShowLayers((prev) => ({ ...prev, heatmap: e.target.checked }))}
                className="rounded"
              />
              <TrendingUp className="h-3 w-3" />
              Density Heatmap
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showLayers.clusters}
                onChange={(e) => setShowLayers((prev) => ({ ...prev, clusters: e.target.checked }))}
                className="rounded"
              />
              <BarChart3 className="h-3 w-3" />
              Patta Holders
            </label>
          </div>
        </div>
      </div>

      <div ref={mapRef} className="h-full w-full z-0" />

      {/* Info Popup */}
      {selectedArea && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[1000]">
          <div className="bg-white dark:bg-card rounded-lg shadow-xl border p-4 min-w-80 max-w-md">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-sm">
                {selectedArea === "village"
                  ? villageData.name
                  : selectedArea === "forest"
                    ? "Forest Area"
                    : selectedArea === "farmland"
                      ? "Agricultural Land"
                      : selectedArea.startsWith("patta-")
                        ? `Patta Holder: ${selectedArea.replace("patta-", "")}`
                        : "Selected Area"}
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setSelectedArea(null)} className="h-6 w-6 p-0">
                ×
              </Button>
            </div>

            {selectedArea === "village" && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Total Claims:</span>
                    <span className="font-medium ml-1">{villageData.claims.total}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Granted:</span>
                    <span className="font-medium ml-1 text-chart-1">{villageData.claims.granted}</span>
                  </div>
                </div>
                {user?.role !== "ngo" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Pending:</span>
                      <span className="font-medium ml-1 text-chart-3">{villageData.claims.pending}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Population:</span>
                      <span className="font-medium ml-1">{villageData.population.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                <Separator />
                <div className="space-y-1">
                  <div className="text-muted-foreground">Land Assets:</div>
                  <div className="flex justify-between">
                    <span>Farmland: {villageData.assets.farmland}</span>
                    <span>Forest: {villageData.assets.forest}</span>
                  </div>
                </div>
                {hasPermission("view-analytics") && (
                  <>
                    <Separator />
                    <VillageActionPlan villageData={villageData}>
                      <Button size="sm" className="w-full gap-2 mt-2">
                        <ClipboardList className="h-3 w-3" />
                        Generate Action Plan
                      </Button>
                    </VillageActionPlan>
                  </>
                )}
              </div>
            )}

            {selectedArea === "forest" && (
              <div className="space-y-2 text-xs">
                <div className="text-muted-foreground">Forest Cover: 25% of total area</div>
                <div className="text-muted-foreground">CFR Claims: 8 community claims</div>
                <Badge variant="outline" className="text-xs">
                  Protected Forest
                </Badge>
              </div>
            )}

            {selectedArea === "farmland" && (
              <div className="space-y-2 text-xs">
                <div className="text-muted-foreground">Agricultural Land: 60% of total area</div>
                <div className="text-muted-foreground">IFR Claims: 85 individual claims</div>
                <Badge variant="outline" className="text-xs">
                  Cultivated Land
                </Badge>
              </div>
            )}

            {selectedArea.startsWith("patta-") && (
              <div className="space-y-2 text-xs">
                <div className="text-muted-foreground">Individual Forest Rights Holder</div>
                <div className="text-muted-foreground">Claims Status: Approved</div>
                <div className="text-muted-foreground">Land Area: 2.5 hectares</div>
                <Badge variant="outline" className="text-xs">
                  Active Patta
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
