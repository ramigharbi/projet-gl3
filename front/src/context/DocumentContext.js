"use client"
import { createContext, useContext, useState, useEffect } from "react"

// Mock data - replace with actual API calls
const initialDocuments = [
  {
    id: "1",
    title: "Document sans titre",
    type: "document",
    lastModified: new Date("2025-01-01T18:00:00"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: false,
    owner: "current-user",
    content: "This is a blank document. Start typing to add content...",
    createdAt: new Date("2025-01-01T18:00:00"),
    updatedAt: new Date("2025-01-01T18:00:00"),
  },
  {
    id: "2",
    title: "Guerrilla Mail API",
    type: "document",
    lastModified: new Date("2025-04-21"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: true,
    owner: "current-user",
    content:
      "# Guerrilla Mail API Documentation\n\nThis document contains the API documentation for the Guerrilla Mail service.\n\n## Overview\nGuerrilla Mail provides temporary email addresses for testing purposes.",
    createdAt: new Date("2025-04-20"),
    updatedAt: new Date("2025-04-21"),
  },
  {
    id: "3",
    title: "PU",
    type: "document",
    lastModified: new Date("2025-03-18"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: true,
    owner: "current-user",
    content:
      "# Project Update\n\nThis document contains the latest project updates and milestones.\n\n## Recent Progress\n- Completed user interface design\n- Implemented core functionality\n- Started testing phase",
    createdAt: new Date("2025-03-15"),
    updatedAt: new Date("2025-03-18"),
  },
  {
    id: "4",
    title: "Optimisation_.docx",
    type: "word",
    lastModified: new Date("2025-03-14"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: true,
    owner: "current-user",
    content:
      "# Optimization Strategies\n\nThis document outlines various optimization strategies for improving system performance.\n\n## Performance Metrics\n- Load time reduction\n- Memory usage optimization\n- Database query optimization",
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-03-14"),
  },
  {
    id: "5",
    title: "SAIDI CHAYMA",
    type: "document",
    lastModified: new Date("2025-02-10"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: false,
    owner: "current-user",
    content:
      "# CV - SAIDI CHAYMA\n\n## Contact Information\nEmail: chayma.saidi@example.com\nPhone: +33 1 23 45 67 89\n\n## Experience\n- Software Developer at Tech Company (2023-Present)\n- Junior Developer at Startup (2022-2023)",
    createdAt: new Date("2025-02-05"),
    updatedAt: new Date("2025-02-10"),
  },
  {
    id: "6",
    title: "Compte rendu mini-projet",
    type: "document",
    lastModified: new Date("2025-01-15"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: false,
    owner: "current-user",
    content:
      "# Mini-Project Report\n\n## Project Overview\nThis report summarizes the mini-project completed during the semester.\n\n## Objectives\n- Implement a web application\n- Use modern development practices\n- Document the development process\n\n## Results\nThe project was completed successfully with all requirements met.",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "1748798335703",
    title: "New Document",
    type: "document",
    lastModified: new Date(),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: false,
    owner: "current-user",
    content: "This is a new document created from a template. You can start editing here...",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const DocumentContext = createContext(undefined)

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize documents on mount
  useEffect(() => {
    // Simulate API call
    const initializeDocuments = async () => {
      try {
        // In a real app, you would fetch documents from an API
        // const response = await fetch('/api/documents')
        // const data = await response.json()
        // setDocuments(data)

        // For now, use mock data
        setDocuments(initialDocuments)
      } catch (error) {
        console.error("Failed to load documents:", error)
        setDocuments(initialDocuments) // Fallback to mock data
      } finally {
        setIsLoading(false)
      }
    }

    initializeDocuments()
  }, [])

  const getDocument = (id) => {
    return documents.find((doc) => doc.id === id)
  }

  const updateDocument = (id, updates) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) => (doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc)),
    )
  }

  const createDocument = (document) => {
    const newDocument = {
      id: Date.now().toString(),
      title: document.title || "Document sans titre",
      type: document.type || "document",
      lastModified: new Date(),
      thumbnail: document.thumbnail || "/placeholder.svg?height=300&width=200",
      isShared: document.isShared || false,
      owner: "current-user",
      content: document.content || "Start typing to add content to your document...",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setDocuments((prevDocuments) => [newDocument, ...prevDocuments])
    return newDocument
  }

  return (
    <DocumentContext.Provider value={{ documents, getDocument, updateDocument, createDocument, isLoading }}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider")
  }
  return context
}
