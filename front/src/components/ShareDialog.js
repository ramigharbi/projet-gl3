"use client"

import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  Chip,
  IconButton,
  Divider,
} from "@mui/material"
import { Close, Link as LinkIcon, Lock, ExpandMore } from "@mui/icons-material"

export function ShareDialog({ open, onClose, documentName, onShare }) {
  const [inviteInput, setInviteInput] = useState("")
  const [accessLevel, setAccessLevel] = useState("editor")
  const [generalAccess, setGeneralAccess] = useState("restricted")

  const [sharedUsers] = useState([
    {
      id: "1",
      name: "Adem Saidi",
      email: "ademsaidi30@gmail.com",
      access: "editor",
      isOwner: true,
    },
  ])

  const handleInvite = () => {
    if (inviteInput.trim()) {
      // Handle invitation logic here
      console.log("Inviting:", inviteInput, "with access:", accessLevel)
      setInviteInput("")
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    // You could show a snackbar here
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontSize: "20px", fontWeight: 400 }}>
            Partager "{documentName}"
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Invite Input */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Ajouter des personnes, des groupes et des événements d'agenda"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": {
                  borderColor: "#4285f4",
                  borderWidth: "2px",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FormControl size="small">
                    <Select
                      value={accessLevel}
                      onChange={(e) => setAccessLevel(e.target.value)}
                      variant="standard"
                      disableUnderline
                    >
                      <MenuItem value="editor">Éditeur</MenuItem>
                      <MenuItem value="viewer">Lecteur</MenuItem>
                    </Select>
                  </FormControl>
                  <Button onClick={handleInvite} disabled={!inviteInput.trim()} sx={{ textTransform: "none" }}>
                    Envoyer
                  </Button>
                </Box>
              ),
            }}
          />
        </Box>

        {/* Users with Access */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Utilisateurs avec accès
        </Typography>

        {sharedUsers.map((user) => (
          <Box
            key={user.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1,
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32, backgroundColor: "#4285f4" }}>{user.name.charAt(0)}</Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.name} {user.isOwner && "(you)"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={user.isOwner ? "Propriétaire" : user.access === "editor" ? "Éditeur" : "Lecteur"}
              size="small"
              variant="outlined"
              sx={{ textTransform: "capitalize" }}
            />
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        {/* General Access */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Accès général
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Lock sx={{ color: "#5f6368" }} />
          <Box sx={{ flexGrow: 1 }}>
            <FormControl fullWidth>
              <Select
                value={generalAccess}
                onChange={(e) => setGeneralAccess(e.target.value)}
                variant="standard"
                disableUnderline
                IconComponent={ExpandMore}
              >
                <MenuItem value="restricted">Limité</MenuItem>
                <MenuItem value="anyone">Toute personne avec le lien</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Seules les personnes avec accès peuvent l'ouvrir à l'aide du lien
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          startIcon={<LinkIcon />}
          onClick={handleCopyLink}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: "20px",
            mr: "auto",
          }}
        >
          Copier le lien
        </Button>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: "20px",
            backgroundColor: "#4285f4",
            px: 3,
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}
