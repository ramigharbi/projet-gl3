"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { TopBar } from "../../../components/TopBar";
import { useDocuments } from "../../../context/DocumentContext";
import TextEditor from "../../../components/quill/TextEditor";

export default function DocumentPage() {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const { getDocument, updateDocument, isLoading } = useDocuments();
  const [document, setDocument] = useState(null);
  const [isDocLoading, setIsDocLoading] = useState(true);
  const [selection, setSelection] = useState(null); // Added for TextEditor
  const [comments, setComments] = useState([
    {
      id: "1",
      author: "Adem Saidi",
      content: "Voici un exemple de commentaire sur le document.",
      timestamp: new Date(),
    },
  ]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!isLoading) {
        setIsDocLoading(true);
        try {
          const doc = await getDocument(documentId);
          if (doc) {
            // Convert date strings to Date objects
            setDocument({
              ...doc,
              createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
              updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : null,
              lastModified: doc.updatedAt
                ? new Date(doc.updatedAt)
                : new Date(), // Fall back to current date if no update date
            });
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        } finally {
          setIsDocLoading(false);
        }
      }
    };

    fetchDocument();
  }, [documentId, getDocument, isLoading]);

  const handleDocumentNameChange = async (name) => {
    if (document) {
      try {
        const updatedDoc = await updateDocument(document.id, { title: name });
        setDocument((prev) => ({
          ...prev,
          ...updatedDoc,
          createdAt: new Date(updatedDoc.createdAt),
          updatedAt: new Date(updatedDoc.updatedAt),
          lastModified: new Date(updatedDoc.updatedAt),
        }));
      } catch (error) {
        console.error("Error updating document name:", error);
      }
    }
  };

  const handleAddComment = (content) => {
    const newComment = {
      id: Date.now().toString(),
      author: "Utilisateur actuel",
      content,
      timestamp: new Date(),
    };
    setComments([...comments, newComment]);
  };

  const handleShare = (users) => {
    console.log("Sharing with users:", users);
  };

  // Handler for TextEditor's onSelection prop
  const handleSelectionChange = (newSelection) => {
    setSelection(newSelection);
    // You can do something with the selection here, e.g., show contextual UI
    console.log("Selection in DocumentPage:", newSelection);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const formatDateTime = (date) => {
    if (!date) return "Date inconnue";
    try {
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date invalide";
    }
  };

  if (isLoading || isDocLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
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
        <Typography variant="h6">Document non trouvé</Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={handleBackToHome}
        >
          Retour à l'accueil
        </Button>
      </Box>
    );
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
      <TextEditor />
    </Box>
  );
}
