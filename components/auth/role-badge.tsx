"use client"

import { Badge } from "@/components/ui/badge"
import { Shield, Crown, MapPin, Users } from "lucide-react"

interface RoleBadgeProps {
  role: string
  className?: string
}

const roleConfig = {
  "policy-maker": {
    label: "Policy Maker",
    icon: Crown,
    variant: "default" as const,
    color: "text-primary-foreground",
  },
  "state-officer": {
    label: "State Officer",
    icon: Shield,
    variant: "secondary" as const,
    color: "text-secondary-foreground",
  },
  "district-officer": {
    label: "District Officer",
    icon: MapPin,
    variant: "outline" as const,
    color: "text-foreground",
  },
  ngo: {
    label: "NGO User",
    icon: Users,
    variant: "outline" as const,
    color: "text-muted-foreground",
  },
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role as keyof typeof roleConfig]
  if (!config) return null

  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}
