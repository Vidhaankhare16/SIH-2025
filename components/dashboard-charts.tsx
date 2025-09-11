"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Users, FileText, TreePine, MapPin } from "lucide-react"

// Sample data for charts
const claimStatusData = [
  { name: "Individual", granted: 65, pending: 15, rejected: 5 },
  { name: "Community", granted: 25, pending: 8, rejected: 2 },
  { name: "CFR", granted: 8, pending: 2, rejected: 0 },
]

const assetDistribution = [
  { name: "Farmland", value: 60, color: "hsl(var(--chart-3))" },
  { name: "Forest Cover", value: 25, color: "hsl(var(--chart-1))" },
  { name: "Water Bodies", value: 8, color: "hsl(var(--chart-2))" },
  { name: "Degraded Land", value: 7, color: "hsl(var(--chart-4))" },
]

const monthlyProgress = [
  { month: "Jan", claims: 45, titles: 38 },
  { month: "Feb", claims: 52, titles: 45 },
  { month: "Mar", claims: 48, titles: 42 },
  { month: "Apr", claims: 61, titles: 55 },
  { month: "May", claims: 55, titles: 48 },
  { month: "Jun", claims: 67, titles: 58 },
]

const schemeEligibility = [
  { scheme: "PM-Kisan", eligible: 85, enrolled: 72 },
  { scheme: "Jal Jeevan", eligible: 95, enrolled: 45 },
  { scheme: "MGNREGA", eligible: 120, enrolled: 98 },
  { scheme: "Forest Rights", eligible: 123, enrolled: 98 },
]

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Key Metrics Cards */}
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-chart-1" />
                <span className="text-sm font-medium">Total Claims</span>
              </div>
              <div className="text-2xl font-bold">123</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-chart-1" />
                <span>+12% from last month</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-chart-2" />
                <span className="text-sm font-medium">Beneficiaries</span>
              </div>
              <div className="text-2xl font-bold">1,680</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-chart-1" />
                <span>+8% tribal population</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-chart-3" />
                <span className="text-sm font-medium">Area (Ha)</span>
              </div>
              <div className="text-2xl font-bold">2,450</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Under FRA coverage</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TreePine className="h-4 w-4 text-chart-4" />
                <span className="text-sm font-medium">Forest Cover</span>
              </div>
              <div className="text-2xl font-bold">612 Ha</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 text-destructive" />
                <span>-3% degradation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Status Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">FRA Claims by Type & Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={claimStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="granted" stackId="a" fill="hsl(var(--chart-1))" name="Granted" />
              <Bar dataKey="pending" stackId="a" fill="hsl(var(--chart-3))" name="Pending" />
              <Bar dataKey="rejected" stackId="a" fill="hsl(var(--chart-4))" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Asset Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Land Asset Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {assetDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {assetDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                <span>
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Progress Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Monthly Progress Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Area
                type="monotone"
                dataKey="claims"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.6}
                name="Claims Filed"
              />
              <Area
                type="monotone"
                dataKey="titles"
                stackId="2"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.6}
                name="Titles Granted"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scheme Eligibility & Enrollment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Government Schemes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {schemeEligibility.map((scheme, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{scheme.scheme}</span>
                <Badge variant="outline" className="text-xs">
                  {scheme.enrolled}/{scheme.eligible}
                </Badge>
              </div>
              <Progress value={(scheme.enrolled / scheme.eligible) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {Math.round((scheme.enrolled / scheme.eligible) * 100)}% enrollment rate
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
