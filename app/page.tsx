"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardCharts } from "@/components/dashboard-charts"
import { LoginForm } from "@/components/auth/login-form"
import { UserProvider, useUser } from "@/components/auth/user-context"
import { RoleBadge } from "@/components/auth/role-badge"
import { ExportDialog } from "@/components/export/export-dialog"
import { CustomMap } from "@/components/custom-map"
import {
  MapPin,
  Users,
  FileText,
  TreePine,
  Droplets,
  BarChart3,
  Filter,
  Download,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  PieChart,
  LogOut,
  AlertTriangle,
} from "lucide-react"

// Sample data for demonstration
const sampleVillageData = {
  name: "Adilabad Village",
  state: "Telangana",
  district: "Adilabad",
  block: "Sirpur",
  claims: {
    total: 123,
    granted: 98,
    pending: 25,
    individual: 85,
    community: 30,
    cfr: 8,
  },
  assets: {
    farmland: "60%",
    forest: "25%",
    water: "8%",
    degraded: "7%",
  },
  population: 2450,
  tribalPopulation: 1680,
}

const samplePolygon = [
  [19.6945, 78.089],
  [19.6955, 78.092],
  [19.6935, 78.093],
  [19.6925, 78.09],
]

function DashboardContent() {
  const { user, logout, hasPermission } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("map")

  if (!user) {
    return <LoginForm onLogin={() => {}} />
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Navigation */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TreePine className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">FRA Atlas & DSS</h1>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <nav className="flex items-center gap-2">
            {hasPermission("upload-records") && (
              <Button variant="ghost" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Records
              </Button>
            )}
            <Button variant="ghost" size="sm" className="gap-2">
              <MapPin className="h-4 w-4" />
              Asset Mapping
            </Button>
            {(hasPermission("export-all") ||
              hasPermission("export-state") ||
              hasPermission("export-district") ||
              hasPermission("export-public")) && (
              <ExportDialog>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Reports & Exports
                </Button>
              </ExportDialog>
            )}
            {hasPermission("view-analytics") && (
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                DSS Panel
              </Button>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right text-sm">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
          <RoleBadge role={user.role} />
          <Button variant="outline" size="sm" onClick={logout} className="gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Role-based access warning for NGO users */}
      {user.role === "ngo" && (
        <Alert className="m-4 mb-0 flex-shrink-0">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have limited access as an NGO user. Some features and detailed data may not be available.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "w-80" : "w-12"} transition-all duration-300 border-r border-border bg-sidebar flex flex-col flex-shrink-0`}
        >
          <div className="p-4 border-b border-sidebar-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full justify-start gap-2"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {sidebarOpen && "Collapse Panel"}
            </Button>
          </div>

          {sidebarOpen && (
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
              {hasPermission("view-analytics") && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="map" className="gap-2">
                      <MapPin className="h-4 w-4" />
                      Map View
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                      <PieChart className="h-4 w-4" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {/* Filters & Search */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters & Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Location</label>
                    <div className="text-sm">
                      {user.role === "district-officer" ? "Adilabad District" : "Telangana → Adilabad → Sirpur"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Claim Type</label>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        IFR
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        CR
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        CFR
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Progress Dashboard - Limited for NGO users */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.role !== "ngo" ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Claims Digitized</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-chart-1 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Titles Granted</span>
                          <span className="font-medium">79%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-chart-2 h-2 rounded-full" style={{ width: "79%" }}></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Detailed progress data is not available for NGO users.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-chart-1">123</div>
                      <div className="text-xs text-muted-foreground">Total Claims</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-chart-3">2.4K</div>
                      <div className="text-xs text-muted-foreground">Hectares</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Development Needs - Only for authorized users */}
              {hasPermission("view-analytics") && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <div className="flex items-start gap-2">
                        <Droplets className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <p className="font-medium">Water Infrastructure Needed</p>
                          <p className="text-muted-foreground mt-1">
                            60% farmland detected with no irrigation. Recommend Jal Jeevan Mission borewells.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <div className="flex items-start gap-2">
                        <TreePine className="h-4 w-4 text-chart-1 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <p className="font-medium">Afforestation Opportunity</p>
                          <p className="text-muted-foreground mt-1">
                            Community forest overlaps degraded land. Suggest afforestation schemes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsContent value="map" className="h-full m-0">
              <CustomMap villageData={sampleVillageData} />

              {/* Bottom Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur border-t border-border flex items-center justify-between px-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>123</strong> FRA claims visualized in this view
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>2,450</strong> people in selected area
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-chart-1"></div>
                    <span>Granted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-chart-3"></div>
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-chart-2"></div>
                    <span>Water Assets</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-chart-4"></div>
                    <span>Degraded Forest</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {hasPermission("view-analytics") && (
              <TabsContent value="analytics" className="h-full m-0 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
                      <p className="text-muted-foreground">
                        Comprehensive insights into FRA implementation and progress
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExportDialog>
                        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                          <Download className="h-4 w-4" />
                          Export Report
                        </Button>
                      </ExportDialog>
                    </div>
                  </div>
                  <DashboardCharts />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default function WebGISDashboard() {
  return (
    <UserProvider>
      <DashboardApp />
    </UserProvider>
  )
}

function DashboardApp() {
  const { user, login } = useUser()

  if (!user) {
    return <LoginForm onLogin={login} />
  }

  return <DashboardContent />
}
