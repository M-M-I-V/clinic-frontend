"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  FileText,
  Download,
  Upload,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ImageIcon,
} from "lucide-react"
import Image from "next/image"

export default function HelpPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  interface Screenshot {
  title: string
  description: string
  image: string
  }
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null)
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" })
  const [contactSubmitted, setContactSubmitted] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
      return
    }

    if (!isLoading && user && !["MD", "DMD", "NURSE"].includes(user.role)) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !["MD", "DMD", "NURSE"].includes(user.role)) {
    return null
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setContactSubmitted(true)
    setTimeout(() => {
      setContactForm({ name: "", email: "", message: "" })
      setContactSubmitted(false)
    }, 3000)
  }

  const quickStartGuides = [
    {
      title: "Add a New Patient",
      description: "Learn how to add a new patient to the system",
      steps: [
        "Click the 'Add Patient' button on the Patients page",
        "Fill in the patient's personal information (first name, last name, student number, birth date, gender)",
        "Enter physical measurements (height in cm, weight in kg)",
        "Select the patient's category (Student, Staff, Faculty) and status",
        "Indicate if medical and dental exams have been completed",
        "Add emergency contact information",
        "Fill in medical information (special medical conditions, communicable diseases)",
        "Click 'Save Patient' to complete",
      ],
      icon: Users,
    },
    {
      title: "Add a Medical Visit",
      description: "Record a medical visit for a patient (MD and NURSE only)",
      steps: [
        "Navigate to the Visits page",
        "Click 'Add Medical Visit' button",
        "Search and select the patient",
        "Enter the visit date and time",
        "Document the chief complaint and vital signs",
        "Add physical examination findings",
        "Record any diagnoses and treatment provided",
        "Save the visit record",
      ],
      icon: FileText,
    },
    {
      title: "Add a Dental Visit",
      description: "Record a dental visit for a patient (DMD only)",
      steps: [
        "Navigate to the Visits page",
        "Click 'Add Dental Visit' button",
        "Search and select the patient",
        "Enter the visit date and time",
        "Document dental findings and tooth conditions",
        "Record procedures performed",
        "Add any diagnoses and treatment provided",
        "Save the visit record",
      ],
      icon: FileText,
    },
    {
      title: "Search and Filter Patients",
      description: "Find patients using search and filter options",
      steps: [
        "Go to the Patients page",
        "Use the search bar to search by first name, last name, or student number",
        "Filter by gender (Male/Female) using the gender dropdown",
        "Filter by category (Student, Staff, Faculty) using the category dropdown",
        "Click on a letter (A-Z) to filter by the first letter of the last name",
        "Click 'All' to clear the last name filter",
        "Click on a patient's name to view their full profile",
      ],
      icon: Users,
    },
    {
      title: "Edit Patient Information",
      description: "Update patient records",
      steps: [
        "Go to the Patients page",
        "Find the patient you want to edit",
        "Click the edit icon (pencil) in the Actions column",
        "Update the patient's information as needed",
        "Click 'Update Patient' to save changes",
        "You can edit personal info, medical info, emergency contacts, and more",
      ],
      icon: FileText,
    },
    {
      title: "View Patient Profile",
      description: "View complete patient information",
      steps: [
        "Go to the Patients page",
        "Click on the patient's name to open their profile",
        "View all personal information, medical details, and emergency contacts",
        "See physical measurements and medical/dental exam status",
        "Click 'Edit' button to make changes to the patient's information",
      ],
      icon: Users,
    },
    {
      title: "Import Patient Records",
      description: "Bulk import patient records from a CSV file",
      steps: [
        "Go to the Patients page",
        "Click the 'Import' button",
        "Select a CSV file with the correct format",
        "The system will validate and import the records",
        "Check the import status for any errors",
        "New patients will appear in the list",
      ],
      icon: Upload,
    },
    {
      title: "Export Patient Records",
      description: "Export patient records to a CSV file",
      steps: [
        "Go to the Patients page",
        "Click the 'Export' button",
        "The system will generate a CSV file with all patient records",
        "The file will automatically download to your computer",
        "You can open it in Excel or any spreadsheet application",
      ],
      icon: Download,
    },
    {
      title: "Import Visit Records",
      description: "Bulk import visit records from a CSV file",
      steps: [
        "Go to the Visits page",
        "Click the 'Import' button",
        "Select a CSV file with visit data",
        "The system will validate and import the records",
        "Check the import status for any errors",
        "New visits will appear in the list",
      ],
      icon: Upload,
    },
    {
      title: "Export Visit Records",
      description: "Export visit records to a CSV file",
      steps: [
        "Go to the Visits page",
        "Click the 'Export' button",
        "The system will generate a CSV file with all visit records",
        "The file will automatically download to your computer",
        "You can filter by visit type (Medical/Dental) before exporting",
      ],
      icon: Download,
    },
    {
      title: "View Dashboard",
      description: "Access the system overview and key metrics",
      steps: [
        "Click 'Dashboard' in the navigation menu",
        "View today's visits count and visits this month",
        "See quick action buttons for common tasks",
        "Check the top diagnoses chart for the current month",
        "View the visits trend chart for the last 30 days",
      ],
      icon: FileText,
    },
  ]

  const faqs = [
    {
      question: "Who can access the system?",
      answer:
        "The system is accessible to users with MD (Doctor), DMD (Dentist), NURSE, and ADMIN roles. Each role has specific permissions for viewing and managing patient records.",
    },
    {
      question: "Who can add or edit patient records?",
      answer:
        "Only users with MD, DMD, or NURSE roles can add or edit patient records. ADMIN users can manage user accounts and permissions.",
    },
    {
      question: "What information is required when adding a patient?",
      answer:
        "Required fields include: First Name, Last Name, Gender, Category (Student/Staff/Faculty), and Contact Number. Other fields like Student Number, Birth Date, and medical information are optional.",
    },
    {
      question: "Can I edit a patient's information after adding them?",
      answer:
        "Yes, you can edit any patient's information by clicking the edit icon in the patient list or the edit button on the patient profile page. Only MD, DMD, and NURSE roles can make edits.",
    },
    {
      question: "What is the difference between Medical and Dental visits?",
      answer:
        "Medical visits are recorded by MD and NURSE roles and include general health examinations, vital signs, and diagnoses. Dental visits are recorded by DMD (dentist) roles and include dental examinations, tooth conditions, and dental procedures.",
    },
    {
      question: "Who can add medical visits?",
      answer: "Only users with MD (Doctor) or NURSE roles can add medical visits.",
    },
    {
      question: "Who can add dental visits?",
      answer: "Only users with DMD (Dentist) role can add dental visits.",
    },
    {
      question: "How do I search for a specific patient?",
      answer:
        "Use the search bar on the Patients page to search by first name, last name, or student number. You can also filter by gender, category, or the first letter of the last name.",
    },
    {
      question: "Can I delete a patient record?",
      answer:
        "Yes, you can delete a patient by clicking the delete icon in the patient list. A confirmation dialog will appear to prevent accidental deletion. Only MD, DMD, and NURSE roles can delete records.",
    },
    {
      question: "How do I view a patient's complete information?",
      answer:
        "Click on the patient's name in the patient list to view their profile page, which displays all their information including personal details, physical measurements, medical information, emergency contacts, and visit history.",
    },
    {
      question: "What is the CSV format for importing patient records?",
      answer:
        "The CSV file should include columns: Student Number, Last Name, First Name, Middle Initial, Birth Date, Gender, Height (cm), Weight (kg), Category, Status, Medical Done, Dental Done, Contact Number, Emergency Contact Name, Emergency Contact Number, Emergency Contact Relationship, Special Medical Condition, Communicable Disease, and Remarks.",
    },
    {
      question: "How do I filter visits by type?",
      answer:
        "On the Visits page, use the filter tabs at the top to view 'All' visits, only 'Medical' visits, or only 'Dental' visits.",
    },
    {
      question: "What should I do if I encounter an error?",
      answer:
        "Check the error message for details about what went wrong. Common issues include invalid file formats for imports, missing required fields, or network connectivity problems. Contact support if the issue persists.",
    },
  ]

  const screenshots = [
    {
      title: "Dashboard Overview",
      description: "View key metrics and quick actions",
      image: "/screenshots/dashboard.png",
    },
    {
      title: "Patient List View",
      description: "View all patients with search and filter options",
      image: "/screenshots/patient-list.png",
    },
    {
      title: "Add Patient Form",
      description: "Comprehensive form for adding new patients",
      image: "/screenshots/add-patient.png",
    },
    {
      title: "Patient Profile",
      description: "Complete patient information and details",
      image: "/screenshots/patient-profile.png",
    },
    {
      title: "Visits List",
      description: "View all medical and dental visits",
      image: "/screenshots/visits-list.png",
    },
    {
      title: "Add Medical Visit",
      description: "Form for recording medical visits",
      image: "/screenshots/medical-visit.png",
    },
    {
      title: "Add Dental Visit",
      description: "Form for recording dental visits",
      image: "/screenshots/dental-visit.png",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions and learn how to use the system
          </p>
        </div>

        {/* Quick Start Guides */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Quick Start Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickStartGuides.map((guide, index) => {
              const Icon = guide.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          {guide.title}
                        </CardTitle>
                        <CardDescription>{guide.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2 text-sm">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex gap-3">
                          <span className="font-semibold text-primary min-w-6">{stepIndex + 1}.</span>
                          <span className="text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Screenshots */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            Screenshots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {screenshots.map((screenshot, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => setSelectedScreenshot(screenshot)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{screenshot.title}</CardTitle>
                  <CardDescription>{screenshot.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative group rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
                    <Image
                      src={screenshot.image}
                      alt={screenshot.title}
                      width={800}
                      height={450}
                      className="object-cover w-full h-48 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <p className="text-white text-sm flex items-center gap-1">
                        View screenshot <ChevronRight className="h-3 w-3" />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Contact Support */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>Reach out to us for any questions or issues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <Mail className="h-5 w-5 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">support@mcst-clinic.edu</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="h-5 w-5 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">
                      MCST Health Services Office
                      <br />
                      Main Campus
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>We&apos;ll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <Input
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <Textarea
                      placeholder="Describe your issue or question..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {contactSubmitted ? "Message Sent!" : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Screenshot Modal */}
      <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selectedScreenshot?.title}</DialogTitle>
            <DialogDescription>{selectedScreenshot?.description}</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg overflow-hidden border border-border">
            <Image
              src={selectedScreenshot?.image || "/screenshots/placeholder.png"}
              alt={selectedScreenshot?.title || "Screenshot"}
              width={1200}
              height={800}
              className="object-contain w-full h-auto"
            />
          </div>
        </DialogContent>

      </Dialog>
    </div>
  )
}