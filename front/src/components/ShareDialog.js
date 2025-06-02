"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Close, Link as LinkIcon, Lock, ExpandMore } from "@mui/icons-material";
import axios from "axios";
import { useLocation } from "react-router-dom";

// Helper function to get token from sessionStorage or localStorage
const getAuthToken = () => {
  return sessionStorage.getItem("token") || localStorage.getItem("token");
};

export function ShareDialog({ open, onClose, documentName }) {
  const [inviteInput, setInviteInput] = useState("");
  const [accessLevel, setAccessLevel] = useState("editor");
  const [generalAccess, setGeneralAccess] = useState("restricted");
  const [sharedUsers, setSharedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [documentId, setDocumentId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Extract document ID from the URL and parse it as an integer
    const pathSegments = location.pathname.split("/");
    const idFromUrl = parseInt(pathSegments[pathSegments.length - 1], 10);
    if (!isNaN(idFromUrl)) {
      setDocumentId(idFromUrl);
    } else {
      console.error("Invalid document ID in URL");
    }
  }, [location]);

  useEffect(() => {
    if (documentId) {
      // Convert documentId to string before making the request
      const docIdString = documentId.toString();
      // Fetch shared users dynamically from the API using GET with query parameter
      axios
        .post(
          "/api/documents/users",
          { documentId: docIdString },
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          }
        )
        .then((response) => {
          const { owner, editors, viewers } = response.data;
          // Combine users and remove duplicates by username
          const allUsers = [
            { ...owner, access: "owner", isOwner: true },
            ...editors.map((user) => ({
              ...user,
              access: "editor",
              isOwner: false,
            })),
            ...viewers.map((user) => ({
              ...user,
              access: "viewer",
              isOwner: false,
            })),
          ];
          // Remove duplicates by username
          const seenUsernames = new Set();
          const users = allUsers.filter((user) => {
            if (seenUsernames.has(user.username)) return false;
            seenUsernames.add(user.username);
            return true;
          });
          setSharedUsers(users);
        })
        .catch((error) => {
          console.error("Failed to fetch shared users", error);
        });
    }
  }, [documentId]);

  useEffect(() => {
    if (inviteInput.trim()) {
      axios
        .get(`/api/auth/users?query=${inviteInput.trim()}`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        })
        .then((response) => {
          const allUsers = response.data;
          const filtered = allUsers.filter(
            (user) =>
              !sharedUsers.some(
                (sharedUser) => sharedUser.userId === user.userId
              )
          );
          setFilteredUsers(filtered);
        })
        .catch((error) => {
          console.error("Failed to fetch users", error);
        });
    } else {
      setFilteredUsers([]);
    }
  }, [inviteInput, sharedUsers]);

  const handleInvite = (user) => {
    if (user) {
      setInviteInput("");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could show a snackbar here
  };

  const handleSendInvite = async () => {
    if (!inviteInput.trim()) {
      console.error("Invite input is empty");
      return;
    }

    console.log("Filtered users:", filteredUsers);
    console.log("Invite input:", inviteInput);

    const selectedUser = filteredUsers.find(
      (user) => user.username === inviteInput
    );
    if (!selectedUser) {
      console.error("User not found in the filtered list");
      return;
    }
    try {
      const response = await axios.post(
        "/api/documents/invite",
        {
          documentId,
          userId: selectedUser.userId, // Ensure the correct user ID is passed        accessLevel: accessLevel === "editor" ? "editor" : "viewer",
        },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );
      setInviteInput("");
      console.log(documentId);
      const updatedUsersResponse = await axios.post(
        `/api/documents/users`,
        { documentId: documentId.toString() },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );

      const { owner, editors, viewers } = updatedUsersResponse.data;
      const users = [
        { ...owner, access: "owner", isOwner: true },
        ...editors.map((user) => ({
          ...user,
          access: "editor",
          isOwner: false,
        })),
        ...viewers.map((user) => ({
          ...user,
          access: "viewer",
          isOwner: false,
        })),
      ];

      console.log("Updated shared users:", users);
      setSharedUsers(users);
    } catch (error) {
      console.error("Failed to send invite", error);
    }
  };

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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
            placeholder="Ajouter des personnes"
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
                  <Button
                    onClick={handleSendInvite}
                    disabled={!inviteInput.trim()}
                    sx={{ textTransform: "none" }}
                  >
                    Envoyer
                  </Button>
                </Box>
              ),
            }}
          />
          {filteredUsers.length > 0 && (
            <Box
              sx={{
                mt: 1,
                border: "1px solid #ccc",
                borderRadius: "8px",
                maxHeight: "150px",
                overflowY: "auto",
              }}
            >
              {filteredUsers.map((user) => (
                <MenuItem
                  key={user.id}
                  onClick={() => setInviteInput(user.username)} // Select user by setting inviteInput
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Box>
                    <Typography variant="body2">{user.username}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Box>
          )}
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
              <Avatar
                sx={{ width: 32, height: 32, backgroundColor: "#4285f4" }}
              >
                {(user.username || "?").charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.username || "Unknown User"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email || "No email provided"}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={
                user.isOwner
                  ? "Propriétaire"
                  : user.access === "editor"
                  ? "Éditeur"
                  : "Lecteur"
              }
              size="small"
              variant="outlined"
              sx={{ textTransform: "capitalize" }}
            />
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

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
  );
}
