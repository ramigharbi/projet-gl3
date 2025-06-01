"use client"

import { Box, Typography, Card, CardContent } from "@mui/material"
import { Description as DocumentIcon, Add } from "@mui/icons-material"

const templates = [
  {
    id: "blank",
    title: "Document vierge",
    subtitle: "",
    color: "#4285f4",
    icon: Add,
  },
  {
    id: "cv-serif",
    title: "CV",
    subtitle: "Serif",
    color: "#34a853",
    icon: DocumentIcon,
  },
  {
    id: "cv-coral",
    title: "CV",
    subtitle: "Corail",
    color: "#ea4335",
    icon: DocumentIcon,
  },
  {
    id: "letter-mint",
    title: "Lettre",
    subtitle: "Vert menthe",
    color: "#34a853",
    icon: DocumentIcon,
  },
  {
    id: "proposal-tropical",
    title: "Proposition de pr...",
    subtitle: "Tropiques",
    color: "#fbbc04",
    icon: DocumentIcon,
  },
  {
    id: "brochure-geometric",
    title: "Brochure",
    subtitle: "Géométrique",
    color: "#9c27b0",
    icon: DocumentIcon,
  },
]

export function TemplateSection({ onCreateDocument }) {
  return (
    <Box sx={{ mb: 6 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 2,
          maxWidth: "960px",
        }}
      >
        {templates.map((template) => {
          const IconComponent = template.icon
          return (
            <Card
              key={template.id}
              sx={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
              onClick={() => onCreateDocument(template.id)}
            >
              <Box
                sx={{
                  height: 120,
                  backgroundColor: template.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <IconComponent
                  sx={{
                    fontSize: 48,
                    color: "white",
                    opacity: 0.8,
                  }}
                />
              </Box>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    mb: template.subtitle ? 0.5 : 0,
                  }}
                >
                  {template.title}
                </Typography>
                {template.subtitle && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "12px" }}>
                    {template.subtitle}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}
