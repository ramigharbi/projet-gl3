"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { DocsNavBar } from "../../components/DocsNavBar"
import { TemplateSection } from "../../components/TemplateSection"
import { RecentDocuments } from "../../components/RecentDocuments"
import { useDocuments } from "../../context/DocumentContext"
import axios from "axios"

export default function DocsHomepage({ onLogout }) {
  const navigate = useNavigate()
  const { documents, setDocuments, createDocument } = useDocuments()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get("/api/documents/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        setDocuments(response.data)
      } catch (error) {
        console.error("Failed to fetch documents", error)
        if (error.response?.status === 401) {
          onLogout()
        }
      }
    }
    fetchDocuments()
  }, [onLogout, setDocuments])

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleCreateDocument = async (templateType) => {
    try {
      // Create a new document and wait for the response
      const newDoc = await createDocument({
        title: "Document sans titre",
        type: templateType,
      })
      // Only navigate once we have the document
      if (newDoc && newDoc.id) {
        navigate(`/document/${newDoc.id}`)
      }
    } catch (error) {
      console.error("Failed to create document:", error)
    }
  }

  const handleDocumentClick = (documentId) => {
    // Navigate to document editor
    navigate(`/document/${documentId}`)
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <DocsNavBar onSearch={handleSearch} onLogout={onLogout} />
      <Box sx={{ maxWidth: "1200px", mx: "auto", px: 3, py: 4 }}>
        <TemplateSection onCreateDocument={handleCreateDocument} />
        <RecentDocuments documents={documents} onDocumentClick={handleDocumentClick} />
      </Box>
    </Box>
  )
}
