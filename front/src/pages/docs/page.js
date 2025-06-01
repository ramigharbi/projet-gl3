"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { DocsNavBar } from "../../components/DocsNavBar"
import { TemplateSection } from "../../components/TemplateSection"
import { RecentDocuments } from "../../components/RecentDocuments"
import { useDocuments } from "../../context/DocumentContext"

export default function DocsHomepage() {
  const navigate = useNavigate()
  const { documents, createDocument } = useDocuments()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query) => {
    setSearchQuery(query)
    // Implement search logic here
  }

  const handleCreateDocument = (templateType) => {
    // Create a new document and navigate to it
    const newDoc = createDocument({
      title: "Document sans titre",
      type: "document",
    })
    navigate(`/document/${newDoc.id}`)
  }

  const handleDocumentClick = (documentId) => {
    // Navigate to document editor
    navigate(`/document/${documentId}`)
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <DocsNavBar onSearch={handleSearch} />
      <Box sx={{ maxWidth: "1200px", mx: "auto", px: 3, py: 4 }}>
        <TemplateSection onCreateDocument={handleCreateDocument} />
        <RecentDocuments documents={documents} onDocumentClick={handleDocumentClick} />
      </Box>
    </Box>
  )
}
