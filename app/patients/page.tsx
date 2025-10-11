"use client"

import type React from "react"

import { useEffect, useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { usePatientsList, deletePatient, importPatients, exportPatients } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserPlus, Search, Pencil, Trash2, Upload, Download } from "lucide-react"
import { mutate } from "swr"
import { Label } from "@/components/ui/label"

const STATUS = ["Active", "Inactive", "Other"]
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default function PatientsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data: patients, error, isLoading: patientsLoading } = usePatientsList()

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [lastNameLetter, setLastNameLetter] = useState<string>("all")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  // Filter and search logic
  const filteredPatients = useMemo(() => {
    if (!patients) return []

    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
      const matchesSearch =
        searchQuery === "" ||
        fullName.includes(searchQuery.toLowerCase()) ||
        patient.studentNumber?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || patient.status === statusFilter

      const matchesGender = genderFilter === "all" || patient.gender === genderFilter

      const matchesLastNameLetter =
        lastNameLetter === "all" || patient.lastName.toUpperCase().startsWith(lastNameLetter)

      return matchesSearch && matchesStatus && matchesGender && matchesLastNameLetter
    })
  }, [patients, searchQuery, statusFilter, genderFilter, lastNameLetter])

  const handleDeleteClick = (id: number, firstName: string, lastName: string) => {
    setPatientToDelete({ id, name: `${firstName} ${lastName}` })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return

    setIsDeleting(true)
    try {
      await deletePatient(patientToDelete.id)
      mutate(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/patients-list`)
      setDeleteDialogOpen(false)
      setPatientToDelete(null)
    } catch (error) {
      console.error("Failed to delete patient:", error)
      alert("Failed to delete patient. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      await importPatients(file)
      mutate(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/patients-list`)
      alert("Patients imported successfully!")
    } catch (error) {
      console.error("Failed to import patients:", error)
      alert(`Failed to import patients: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleExportClick = async () => {
    setIsExporting(true)
    try {
      await exportPatients()
    } catch (error) {
      console.error("Failed to export patients:", error)
      alert("Failed to export patients. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

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
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={handleImportClick}
              disabled={isImporting}
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Importing..." : "Import"}
            </Button>
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={handleExportClick}
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
            <Button className="gap-2" onClick={() => router.push("/patients/add")}>
              <UserPlus className="h-4 w-4" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or student number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Gender Filter */}
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Last Name</Label>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={lastNameLetter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLastNameLetter("all")}
                    className="h-8 w-12"
                  >
                    All
                  </Button>
                  {ALPHABET.map((letter) => (
                    <Button
                      key={letter}
                      variant={lastNameLetter === letter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLastNameLetter(letter)}
                      className="h-8 w-8 p-0"
                    >
                      {letter}
                    </Button>
                  ))}
                </div>
              </div>
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
                      <TableHead>Student Number</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <Link href={`/patients/${patient.id}`} className="font-medium text-primary hover:underline">
                            {patient.firstName} {patient.lastName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{patient.studentNumber || "—"}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.status}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => router.push(`/patients/${patient.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit patient</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(patient.id, patient.firstName, patient.lastName)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete patient</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the patient record for <strong>{patientToDelete?.name}</strong>. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}