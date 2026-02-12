"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, UserPlus, Stethoscope, ClipboardPlus} from "lucide-react"
import { useKPIs, useTopDiagnoses, useVisitsTrend } from "@/lib/api"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data: kpis, error: kpisError, isLoading: kpisLoading } = useKPIs()
  const { data: topDiagnoses, error: diagnosesError, isLoading: diagnosesLoading } = useTopDiagnoses()
  const { data: visitsTrend, error: trendError, isLoading: trendLoading } = useVisitsTrend()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check if user has required role (MD, DMD, or NURSE)
  const hasAccess = ["MD", "DMD", "NURSE"].includes(user.role)

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You do not have permission to view the dashboard.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.username}!</h1>
          <p className="text-muted-foreground">Here&apos;s an overview of your patient record management system.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Visits</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : kpisError ? (
                <div className="text-sm text-destructive">Failed to load</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{kpis?.todaysVisits || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Scheduled appointments today</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Visits This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : kpisError ? (
                <div className="text-sm text-destructive">Failed to load</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{kpis?.visitsThisMonth || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total visits in current month</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent"
                onClick={() => router.push("/patients/add")}
              >
                <UserPlus className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">New Patient</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent"
                onClick={() => router.push("/visits/medical/add")}
              >
                <Stethoscope className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">New Medical Visit</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent"
                onClick={() => router.push("/visits/dental/add")}
              >
                <ClipboardPlus className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">New Dental Visit</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Diagnoses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Diagnoses This Month</CardTitle>
              <CardDescription>Most common diagnoses in the current month</CardDescription>
            </CardHeader>
            <CardContent>
              {diagnosesLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : diagnosesError ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-destructive">
                  Failed to load chart data
                </div>
              ) : !topDiagnoses || topDiagnoses.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                  No diagnosis data available
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: {
                      label: "Count",
                      color: "oklch(0.5 0.2 180)",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topDiagnoses} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="diagnosis"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        className="text-xs fill-muted-foreground"
                      />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="oklch(0.5 0.2 180)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Visits Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Visits Trend</CardTitle>
              <CardDescription>Daily visits over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : trendError ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-destructive">
                  Failed to load chart data
                </div>
              ) : !visitsTrend || visitsTrend.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                  No trend data available
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: {
                      label: "Visits",
                      color: "oklch(0.5 0.2 180)",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visitsTrend} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        className="text-xs fill-muted-foreground"
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getMonth() + 1}/${date.getDate()}`
                        }}
                      />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        labelFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleDateString()
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="oklch(0.5 0.2 180)"
                        strokeWidth={2}
                        dot={{ fill: "oklch(0.5 0.2 180)", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}