"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@/components/auth/user-context"
import { Download, FileText, FileSpreadsheet, Map, Database, CheckCircle, Clock } from "lucide-react"

interface ExportDialogProps {
  children: React.ReactNode
}

const exportFormats = [
  {
    id: "pdf",
    name: "PDF Report",
    description: "Comprehensive report with charts and maps",
    icon: FileText,
    extension: ".pdf",
    permissions: ["export-all", "export-state", "export-district", "export-public"],
  },
  {
    id: "excel",
    name: "Excel Spreadsheet",
    description: "Data tables and statistics",
    icon: FileSpreadsheet,
    extension: ".xlsx",
    permissions: ["export-all", "export-state", "export-district"],
  },
  {
    id: "csv",
    name: "CSV Data",
    description: "Raw data in comma-separated format",
    icon: Database,
    extension: ".csv",
    permissions: ["export-all", "export-state", "export-district", "export-public"],
  },
  {
    id: "geojson",
    name: "GeoJSON",
    description: "Geographic data for GIS applications",
    icon: Map,
    extension: ".geojson",
    permissions: ["export-all", "export-state", "export-district"],
  },
  {
    id: "shapefile",
    name: "Shapefile",
    description: "Complete GIS dataset with geometry",
    icon: Map,
    extension: ".zip",
    permissions: ["export-all", "export-state"],
  },
]

const dataCategories = [
  { id: "claims", name: "FRA Claims Data", description: "Individual, Community, and CFR claims" },
  { id: "assets", name: "Land Assets", description: "Farmland, forest cover, water bodies" },
  { id: "demographics", name: "Demographics", description: "Population and tribal statistics" },
  { id: "schemes", name: "Government Schemes", description: "Eligibility and enrollment data" },
  { id: "analytics", name: "Analytics", description: "Progress metrics and trends" },
]

export function ExportDialog({ children }: ExportDialogProps) {
  const { hasPermission } = useUser()
  const [open, setOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["claims"])
  const [dateRange, setDateRange] = useState("all")
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportComplete, setExportComplete] = useState(false)

  const availableFormats = exportFormats.filter((format) =>
    format.permissions.some((permission) => hasPermission(permission)),
  )

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export process
    const steps = [
      "Collecting data...",
      "Processing claims...",
      "Generating charts...",
      "Formatting output...",
      "Finalizing export...",
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setExportProgress(((i + 1) / steps.length) * 100)
    }

    setIsExporting(false)
    setExportComplete(true)

    // Simulate file download
    const selectedFormatData = exportFormats.find((f) => f.id === selectedFormat)
    if (selectedFormatData) {
      const filename = `fra-report-${new Date().toISOString().split("T")[0]}${selectedFormatData.extension}`

      // Create a mock download
      const element = document.createElement("a")
      element.href = "data:text/plain;charset=utf-8," + encodeURIComponent("Mock export data")
      element.download = filename
      element.style.display = "none"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }

    setTimeout(() => {
      setExportComplete(false)
      setOpen(false)
    }, 2000)
  }

  const resetDialog = () => {
    setSelectedFormat("")
    setSelectedCategories(["claims"])
    setDateRange("all")
    setIsExporting(false)
    setExportProgress(0)
    setExportComplete(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetDialog()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data & Reports
          </DialogTitle>
          <DialogDescription>
            Generate and download reports in various formats based on your access level.
          </DialogDescription>
        </DialogHeader>

        {exportComplete ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-chart-1" />
            <h3 className="text-lg font-semibold">Export Complete!</h3>
            <p className="text-muted-foreground text-center">
              Your report has been generated and downloaded successfully.
            </p>
          </div>
        ) : isExporting ? (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center space-y-4">
              <Clock className="h-12 w-12 text-primary animate-spin" />
              <h3 className="text-lg font-semibold">Generating Export...</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Export Format Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Export Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableFormats.map((format) => {
                  const Icon = format.icon
                  return (
                    <Card
                      key={format.id}
                      className={`cursor-pointer transition-all ${
                        selectedFormat === format.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">{format.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{format.description}</div>
                          </div>
                          {selectedFormat === format.id && <CheckCircle className="h-4 w-4 text-primary" />}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Data Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data to Include</h3>
              <div className="space-y-3">
                {dataCategories.map((category) => (
                  <div key={category.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, category.id])
                        } else {
                          setSelectedCategories(selectedCategories.filter((id) => id !== category.id))
                        }
                      }}
                    />
                    <div className="flex-1">
                      <label htmlFor={category.id} className="text-sm font-medium cursor-pointer">
                        {category.name}
                      </label>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Date Range</h3>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="year">Last 12 Months</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Summary */}
            {selectedFormat && (
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Export Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Format:</span>
                    <Badge variant="outline">{exportFormats.find((f) => f.id === selectedFormat)?.name}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Data Categories:</span>
                    <span>{selectedCategories.length} selected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Date Range:</span>
                    <span className="capitalize">{dateRange.replace("_", " ")}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={!selectedFormat || selectedCategories.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Generate Export
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
