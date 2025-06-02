"use client";
import { MantineProvider, Group, Paper, Stack, Box } from "@mantine/core";
import "@mantine/core/styles.css";
import { useCommentsUnified } from "../../../hooks/useCommentsUnified";
import { editorTheme } from "../../../components/theme";
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { TopBar } from "../../../components/TopBar";
import { useDocuments } from "../../../context/DocumentContext";
import { CommentSection } from "../../../components/CommentSection";
import { DocHeader } from "../../../components/DocHeader";
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

  const { commentsMap, loading, addComment, deleteComment } =
      useCommentsUnified(documentId);
  
      const [selectedRange, setSelectedRange] = useState(null);
      const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("User");
  
  const commentsArray = useMemo(() => {
    if (!commentsMap) return [];
    if (typeof commentsMap.values !== "function") return [];
    const arr = Array.from(commentsMap.values());
    return arr;
  }, [commentsMap]);

  const handleAddComment = async () => {
    if (!selectedRange || !commentText.trim() || !authorName.trim()) {
      alert(
        "Please select text that can be commented on, and enter both a comment and your name."
      );
      return;
    }
    if (
      typeof selectedRange.start !== "number" ||
      typeof selectedRange.end !== "number" ||
      selectedRange.start === selectedRange.end
    ) {
      alert(
        "Invalid text selection range. Please select a non-empty text portion."
      );
      return;
    }
    try {
      await addComment(selectedRange, commentText, authorName);
      setCommentText("");
    } catch (error) {
      if (error && error.graphQLErrors) {
        console.error(
          "[Editor.js] GraphQL Errors:",
          error.graphQLErrors,
          error
        );
        alert(
          "Failed to add comment: " +
            error.graphQLErrors.map((e) => e.message).join("; ")
        );
      } else if (error && error.message) {
        console.error("[Editor.js] Error message:", error.message, error);
        alert("Failed to add comment TEST: " + error.message);
      } else {
        console.error("[Editor.js] Unknown error:", error);
        alert("Failed to add comment. See console for details.");
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment(commentId);
      } catch (error) {
        alert("Failed to delete comment. See console for details.");
      }
    }
  };


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
      <MantineProvider theme={editorTheme}>

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
        </MantineProvider>
    );
  }

  if (!document) {
    return (
      <MantineProvider theme={editorTheme}>

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
        </MantineProvider>
    );
  }

  return (
    <MantineProvider theme={editorTheme}>

      <style>
              {`
                @keyframes pulse {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.8; transform: scale(1.05); }
                }
                
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                }
                
                @keyframes slideInUp {
                  from {
                    opacity: 0;
                    transform: translateY(30px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                .comment-card {
                  animation: slideInUp 0.6s ease-out;
                }
                  .float-animation {
                  animation: float 3s ease-in-out infinite;
                }
                
                .pulse-animation {
                  animation: pulse 2s ease-in-out infinite;
                }
                
                @media (max-width: 768px) {
                  .editor-container {
                    flex-direction: column !important;
                  }
                  
                  .editor-main {
                    max-width: 100% !important;
                  }
                  
                  .comments-panel {
                    width: 100% !important;
                    min-width: unset !important;
                    max-height: 60vh !important;
                  }
                }
                
                @media (max-width: 480px) {
                  .main-container {
                    padding: 1rem !important;
                  }
                }
              `}
            </style>
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar
        documentName={document.title}
        onDocumentNameChange={handleDocumentNameChange}
        onShare={handleShare}
        comments={comments}
        onAddComment={handleAddComment}
      />

      </Box>
            
            <Box
              className="main-container"
              style={{
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                minHeight: "100vh",
                padding: "2rem",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)",
                  pointerEvents: "none",
                },
              }}
            >
              <Group
                className="editor-container"
                align="flex-start"
                wrap="nowrap"
                gap="xl"
                style={{ position: "relative", zIndex: 1 }}
              >
                <Stack
                  className="editor-main"
                  style={{ flexGrow: 1, maxWidth: "calc(100% - 400px - 2rem)" }}
                >
                  <DocHeader docId={documentId} />
      
                  <Paper
                    withBorder
                    radius="xl"
                    shadow="2xl"
                    style={{
                      flexGrow: 1,
                      minHeight: "75vh",
                      background: "rgba(255, 255, 255, 0.95)",
                      borderColor: "rgba(226, 232, 240, 0.8)",
                      overflow: "hidden",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow:
                        "0 25px 50px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      transition: "all 0.3s ease",
                      position: "relative",
                    }}
                  >
                    <Box
                      style={{
                        height: "100%",
                        position: "relative",
                        "& .bn-container": {
                          borderRadius: "24px",
                          overflow: "hidden",
                        },
                        "& .bn-editor": {
                          padding: "2rem",
                          fontSize: "16px",
                          lineHeight: "1.7",
                          fontFamily: "system-ui, -apple-system, sans-serif",
                        },
                      }}
                    >
                      <TextEditor onRangeSelection={setSelectedRange} />
                    </Box>
                  </Paper>
                </Stack>
      
                <CommentSection
                  commentsArray={commentsArray}
                  loading={loading}
                  selectedRange={selectedRange}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  authorName={authorName}
                  setAuthorName={setAuthorName}
                  handleAddComment={handleAddComment}
                  handleDeleteComment={handleDeleteComment}
                />
              </Group>
            </Box>
</MantineProvider>
  );
}
