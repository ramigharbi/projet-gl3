"use client"
import { useState } from "react"
import { Box, Typography, Card, CardContent, IconButton, Menu, MenuItem, Select, FormControl } from "@mui/material"
import {
  Description as DocumentIcon,
  MoreVert,
  People,
  ViewList,
  SortByAlpha,
  Folder,
  Article,
} from "@mui/icons-material"

export function RecentDocuments({ documents, onDocumentClick }) {
  const [filter, setFilter] = useState("all")
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)

  console.log(documents); // Debug log to verify the documents prop

  const handleMenuClick = (event, docId) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedDoc(docId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedDoc(null)
  }

  const getDocumentIcon = (type) => {
    switch (type) {
      case "word":
        return <Article sx={{ color: "#2b579a" }} />
      default:
        return <DocumentIcon sx={{ color: "#4285f4" }} />
    }
  }

  const formatDate = (dateInput) => {
    // Handle undefined or invalid date
    if (!dateInput) {
      return "Date inconnue";
    }

    // Convert string to Date object if needed
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Date invalide";
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Dernière ouverture ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
    } else {
      return `${date.getDate()} ${date.toLocaleDateString("fr-FR", { month: "short" })} ${date.getFullYear()}`;
    }
  }

  return (
    <Box>
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: 400, color: "#202124" }}>
          Documents récents
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Filter Dropdown */}
          <FormControl size="small">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              variant="outlined"
              sx={{
                minWidth: 80,
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .MuiSelect-select": {
                  py: 1,
                  fontSize: "14px",
                },
              }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="owned">Mes documents</MenuItem>
              <MenuItem value="shared">Partagés avec moi</MenuItem>
            </Select>
          </FormControl>

          {/* View Options */}
          <IconButton size="small" sx={{ color: "#5f6368" }}>
            <ViewList />
          </IconButton>
          <IconButton size="small" sx={{ color: "#5f6368" }}>
            <SortByAlpha />
          </IconButton>
          <IconButton size="small" sx={{ color: "#5f6368" }}>
            <Folder />
          </IconButton>
        </Box>
      </Box>

      {/* Documents Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 2,
        }}
      >
        {documents.map((doc) => (
          <Card
            key={doc.id}
            sx={{
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              },
            }}
            onClick={() => onDocumentClick(doc.id)}
          >
            {/* Document Thumbnail */}
            <Box
              sx={{
                height: 160,
                backgroundColor: "#f8f9fa",
                backgroundImage: `url(${doc.thumbnail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                border: "1px solid #e0e0e0",
              }}
            >
              {/* Placeholder content for thumbnail */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#5f6368",
                  textAlign: "center",
                  p: 2,
                }}
              >
                Document Preview
              </Box>
            </Box>

            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    {getDocumentIcon(doc.type)}
                    {doc.isShared && <People sx={{ fontSize: 16, color: "#5f6368", ml: 0.5 }} />}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: 1.3,
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "12px" }}>
                    {formatDate(doc.lastModified)}
                  </Typography>
                </Box>

                <IconButton size="small" onClick={(e) => handleMenuClick(e, doc.id)} sx={{ color: "#5f6368", ml: 1 }}>
                  <MoreVert fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Document Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleMenuClose}>Ouvrir</MenuItem>
        <MenuItem onClick={handleMenuClose}>Partager</MenuItem>
        <MenuItem onClick={handleMenuClose}>Renommer</MenuItem>
        <MenuItem onClick={handleMenuClose}>Supprimer</MenuItem>
        <MenuItem onClick={handleMenuClose}>Créer une copie</MenuItem>
      </Menu>
    </Box>
  )
}
