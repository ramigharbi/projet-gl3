"use client"
import { useState } from "react"
import { AppBar, Toolbar, IconButton, Typography, InputBase, Box, Avatar, Menu, MenuItem } from "@mui/material"
import { Menu as MenuIcon, Search, Apps } from "@mui/icons-material"
import { Description as DocsIcon } from "@mui/icons-material"

export function DocsNavBar({ onSearch }) {
  const [searchValue, setSearchValue] = useState("")
  const [anchorEl, setAnchorEl] = useState(null)

  const handleSearchChange = (event) => {
    const value = event.target.value
    setSearchValue(value)
    onSearch(value)
  }

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "white",
        color: "text.primary",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar sx={{ px: 2 }}>
        {/* Menu Icon */}
        <IconButton edge="start" sx={{ mr: 2, color: "#5f6368" }}>
          <MenuIcon />
        </IconButton>

        {/* Docs Logo and Title */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 4 }}>
          <DocsIcon sx={{ color: "#4285f4", fontSize: 32, mr: 1 }} />
          <Typography
            variant="h6"
            sx={{
              fontSize: "22px",
              fontWeight: 400,
              color: "#5f6368",
            }}
          >
            Docs
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            flexGrow: 1,
            maxWidth: "720px",
            mx: "auto",
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f1f3f4",
              borderRadius: "8px",
              px: 2,
              py: 1,
              "&:hover": {
                backgroundColor: "#e8eaed",
              },
              "&:focus-within": {
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              },
            }}
          >
            <Search sx={{ color: "#5f6368", mr: 2 }} />
            <InputBase
              placeholder="Recherche"
              value={searchValue}
              onChange={handleSearchChange}
              sx={{
                flexGrow: 1,
                fontSize: "16px",
                "& input": {
                  padding: 0,
                },
              }}
            />
          </Box>
        </Box>

        {/* Right Side Icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
          {/* Apps Grid */}
          <IconButton sx={{ color: "#5f6368" }}>
            <Apps />
          </IconButton>

          {/* Profile Avatar */}
          <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: "#4285f4",
                fontSize: "14px",
              }}
            >
              A
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleProfileClose}>Mon compte</MenuItem>
            <MenuItem onClick={handleProfileClose}>Paramètres</MenuItem>
            <MenuItem onClick={handleProfileClose}>Se déconnecter</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
