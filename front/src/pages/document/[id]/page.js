"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Box, Container, Paper, Typography, CircularProgress, Button } from "@mui/material"
import { ArrowBack } from "@mui/icons-material"
import { TopBar } from "../../../components/TopBar"
import { useDocuments } from "../../../context/DocumentContext"

export default function DocumentPage() {
  const { id: documentId } = useParams()
  const navigate = useNavigate()
  const { getDocument, updateDocument, isLoading } = useDocuments()
  const [document, setDocument] = useState(getDocument(documentId))
  const [comments, setComments] = useState([
    {
      id: "1",
      author: "Adem Saidi",
      content: "Voici un exemple de commentaire sur le document.",
      timestamp: new Date(),
    },
  ])

  useEffect(() => {
    if (!isLoading) {
      const doc = getDocument(documentId)
      setDocument(doc)
    }
  }, [documentId, getDocument, isLoading])

  const handleDocumentNameChange = (name) => {
    if (document) {
      updateDocument(document.id, { title: name })
      setDocument({ ...document, title: name })
    }
  }

  const handleAddComment = (content) => {
    const newComment = {
      id: Date.now().toString(),
      author: "Utilisateur actuel",
      content,
      timestamp: new Date(),
    }
    setComments([...comments, newComment])
  }

  const handleShare = (users) => {
    console.log("Sharing with users:", users)
  }

  const handleBackToHome = () => {
    navigate("/")
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!document) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <Typography variant="h6">Document not found</Typography>
        <Button variant="contained" startIcon={<ArrowBack />} onClick={handleBackToHome}>
          Retour à l'accueil
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar
        documentName={document.title}
        onDocumentNameChange={handleDocumentNameChange}
        onShare={handleShare}
        comments={comments}
        onAddComment={handleAddComment}
      />

      {/* Document Content Area */}
      <Box sx={{ flexGrow: 1, backgroundColor: "#f8f9fa", overflow: "auto" }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper
            elevation={1}
            sx={{
              minHeight: "800px",
              p: 6,
              backgroundColor: "white",
              borderRadius: "8px",
            }}
          >
            <Typography variant="h4" gutterBottom>
              {document.title}
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: "pre-wrap" }}>
              {document.content || "Voici le contenu de votre document. Vous pouvez commencer à taper ici..."}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 4, fontStyle: "italic" }}>
              Dernière modification:{" "}
              {document.lastModified.toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}
