"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppBar, Toolbar, Typography, IconButton, Button, TextField, Box, Avatar } from "@mui/material"
import {
  Description as DocumentIcon,
  Star,
  StarBorder,
  Comment,
  Share,
  VideoCall,
  ArrowBack,
} from "@mui/icons-material"
import { ShareDialog } from "./ShareDialog"
import { CommentsSidebar } from "./CommentsSidebar"

export function TopBar({ documentName, onDocumentNameChange, onShare, comments = [], onAddComment }) {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(documentName)
  const [isStarred, setIsStarred] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)

  const handleNameSubmit = () => {
    onDocumentNameChange(editName)
    setIsEditing(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleNameSubmit()
    }
    if (e.key === "Escape") {
      setEditName(documentName)
      setIsEditing(false)
    }
  }

  const handleBackToHome = () => {
    navigate("/")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          backgroundColor: "white",
          color: "text.primary",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important", px: 2 }}>
          {/* Back Button (new) */}
          <IconButton
            edge="start"
            sx={{ mr: 2, color: "#5f6368", display: { xs: "flex", sm: "none" } }}
            onClick={handleBackToHome}
          >
            <ArrowBack />
          </IconButton>

          {/* Document Icon */}
          <DocumentIcon
            sx={{
              color: "#4285f4",
              fontSize: 24,
              mr: 2,
            }}
          />

          {/* Document Name */}
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            {isEditing ? (
              <TextField
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleKeyPress}
                variant="standard"
                autoFocus
                sx={{
                  "& .MuiInput-underline:before": {
                    borderBottom: "none",
                  },
                  "& .MuiInput-underline:hover:before": {
                    borderBottom: "none",
                  },
                  "& .MuiInput-underline:after": {
                    borderBottom: "2px solid #4285f4",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: "18px",
                    fontWeight: 400,
                    padding: "4px 8px",
                  },
                }}
              />
            ) : (
              <Typography
                variant="h6"
                onClick={() => setIsEditing(true)}
                sx={{
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: 400,
                  padding: "4px 8px",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "#f1f3f4",
                  },
                }}
              >
                {documentName}
              </Typography>
            )}

            {/* Star Icon */}
            <IconButton
              onClick={() => setIsStarred(!isStarred)}
              size="small"
              sx={{ ml: 1, color: isStarred ? "#fbbc04" : "#5f6368" }}
            >
              {isStarred ? <Star /> : <StarBorder />}
            </IconButton>
          </Box>

          {/* Right Side Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Comments Button */}
            <IconButton onClick={() => setCommentsOpen(true)} sx={{ color: "#5f6368" }}>
              <Comment />
            </IconButton>

            {/* Video Call Button */}
            <IconButton sx={{ color: "#5f6368" }}>
              <VideoCall />
            </IconButton>

            {/* Share Button */}
            <Button
              variant="contained"
              startIcon={<Share />}
              onClick={() => setShareOpen(true)}
              sx={{
                backgroundColor: "#4285f4",
                textTransform: "none",
                borderRadius: "24px",
                px: 3,
                "&:hover": {
                  backgroundColor: "#3367d6",
                },
              }}
            >
              Partager
            </Button>

            {/* User Avatar */}
            <Avatar
              sx={{
                width: 32,
                height: 32,
                ml: 1,
                backgroundColor: "#4285f4",
              }}
            >
              A
            </Avatar>

            {/* Logout Button */}
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ ml: 2, textTransform: "none", borderRadius: "24px" }}
            >
              Déconnexion
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Share Dialog */}
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} documentName={documentName} onShare={onShare} />

      {/* Comments Sidebar */}
      <CommentsSidebar
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        comments={comments}
        onAddComment={onAddComment}
      />
    </>
  )
}
