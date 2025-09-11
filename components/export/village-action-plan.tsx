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
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { FileText, Download, CheckCircle, Clock, Droplets, TreePine, Users, Coins, MapPin } from "lucide-react"

interface VillageActionPlanProps {
  villageData: {
    name: string
    state: string
    district: string
    block: string
    claims: any
    assets: any
    population: number
    tribalPopulation: number
  }
  children: React.ReactNode
}

const recommendedSchemes = [
  {
    name: "Jal Jeevan Mission",
    description: "Provide tap water connections to rural households",
    eligibility: 95,
    priority: "High",
    icon: Droplets,
    color: "text-chart-2",
  },
  {
    name: "PM-Kisan",
    description: "Direct income support to farmer families",
    eligibility: 85,
    priority: "Medium",
    icon: Coins,
    color: "text-chart-3",
  },
  {
    name: "MGNREGA",
    description: "Employment guarantee and rural infrastructure",
    eligibility: 120,
    priority: "High",
    icon: Users,
    color: "text-chart-1",
  },
  {
    name: "Afforestation Program",
    description: "Community forest restoration and management",
    eligibility: 30,
    priority: "Medium",
    icon: TreePine,
    color: "text-chart-4",
  },
]

export function VillageActionPlan({ villageData, children }: VillageActionPlanProps) {
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)

  const handleGeneratePlan = async () => {
    setIsGenerating(true)
    setProgress(0)

    // Simulate plan generation
    const steps = [
      "Analyzing village data...",
      "Identifying development needs...",
      "Matching government schemes...",
      "Calculating budget estimates...",
      "Generating action plan...",
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setProgress(((i + 1) / steps.length) * 100)
    }

    setIsGenerating(false)
    setComplete(true)

    // Simulate PDF download
    const filename = `${villageData.name.replace(/\s+/g, "-")}-action-plan-${new Date().toISOString().split("T")[0]}.pdf`

    const element = document.createElement("a")
    element.href = "data:application/pdf;base64," + btoa("Mock PDF content for Village Development Action Plan")
    element.download = filename
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    setTimeout(() => {
      setComplete(false)
      setOpen(false)
    }, 2000)
  }

  const resetDialog = () => {
    setIsGenerating(false)
    setProgress(0)
    setComplete(false)
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Village Development Action Plan
          </DialogTitle>
          <DialogDescription>AI-generated comprehensive development plan for {villageData.name}</DialogDescription>
        </DialogHeader>

        {complete ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-chart-1" />
            <h3 className="text-lg font-semibold">Action Plan Generated!</h3>
            <p className="text-muted-foreground text-center">
              The Village Development Action Plan has been created and downloaded.
            </p>
          </div>
        ) : isGenerating ? (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center space-y-4">
              <Clock className="h-12 w-12 text-primary animate-spin" />
              <h3 className="text-lg font-semibold">Generating Action Plan...</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Village Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Village Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-chart-1">{villageData.claims.total}</div>
                    <div className="text-xs text-muted-foreground">FRA Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-chart-2">{villageData.population.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Population</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-chart-3">
                      {villageData.tribalPopulation.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Tribal Population</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-chart-4">2.4K</div>
                    <div className="text-xs text-muted-foreground">Hectares</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium">Land Assets Distribution</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Farmland: {villageData.assets.farmland}</div>
                    <div>Forest Cover: {villageData.assets.forest}</div>
                    <div>Water Bodies: {villageData.assets.water}</div>
                    <div>Degraded Land: {villageData.assets.degraded}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI-Driven Development Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {recommendedSchemes.map((scheme, index) => {
                    const Icon = scheme.icon
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Icon className={`h-5 w-5 ${scheme.color} mt-0.5`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{scheme.name}</h4>
                            <Badge variant={scheme.priority === "High" ? "default" : "secondary"} className="text-xs">
                              {scheme.priority} Priority
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{scheme.description}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Eligible families:</span>
                            <span className="font-medium">{scheme.eligibility}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Plan Contents Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Action Plan Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Executive Summary & Village Profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>FRA Implementation Status & Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Land Asset Mapping & Utilization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Government Scheme Recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Budget Estimates & Timeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Implementation Roadmap</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGeneratePlan} className="gap-2">
                <Download className="h-4 w-4" />
                Generate Action Plan PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
