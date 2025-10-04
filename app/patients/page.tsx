"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { usePatientsList } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus, Search } from "lucide-react"

export default function PatientsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data: patients, error, isLoading: patientsLoading } = usePatientsList()

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [programFilter, setProgramFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  // Filter and search logic
  const filteredPatients = useMemo(() => {
    if (!patients) return []

    return patients.filter((patient) => {
      // Search filter (name or student ID)
      const matchesSearch =
        searchQuery === "" ||
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.studentId?.toLowerCase().includes(searchQuery.toLowerCase())

      // Program filter
      const matchesProgram = programFilter === "all" || patient.program === programFilter

      // Gender filter
      const matchesGender = genderFilter === "all" || patient.gender === genderFilter

      return matchesSearch && matchesProgram && matchesGender
    })
  }, [patients, searchQuery, programFilter, genderFilter])

  // Extract unique programs for filter dropdown
  const programs = useMemo(() => {
    if (!patients) return []
    const uniquePrograms = Array.from(new Set(patients.map((p) => p.program)))
    return uniquePrograms.sort()
  }, [patients])

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
              <CardDescription>You do not have permission to view patients.</CardDescription>
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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground mt-1">Manage and view patient records</p>
          </div>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Patient
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Program Filter */}
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Gender Filter */}
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>
              {filteredPatients.length} {filteredPatients.length === 1 ? "patient" : "patients"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-sm text-destructive">
                Failed to load patients
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No patients found
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Known Diseases</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <Link href={`/patients/${patient.id}`} className="font-medium text-primary hover:underline">
                            {patient.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{patient.studentId || "—"}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.program}</TableCell>
                        <TableCell className="text-muted-foreground">{patient.knownDiseases || "None"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}