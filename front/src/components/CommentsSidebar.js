"use client"
import { Drawer, Box, Typography, IconButton, TextField, Button, Avatar, Paper, Divider } from "@mui/material"
import { Close, Send } from "@mui/icons-material"

export function CommentsSidebar({
  open,
  onClose,
  commentsArray = [],
  loading = false,
  commentText = '',
  setCommentText = () => {},
  authorName = '',
  setAuthorName = () => {},
  selectedRange = null,
  handleAddComment = () => {},
  handleDeleteComment = () => {},
}) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          borderLeft: "1px solid #e0e0e0",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: 500 }}>
            Commentaires
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Comments List */}
        <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
          {loading ? (
            <Typography variant="body2" color="text.secondary">Chargement...</Typography>
          ) : commentsArray.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Aucun commentaire pour le moment
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Soyez le premier à commenter ce document
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {commentsArray.map((comment) => (
                <Paper
                  key={comment.commentId}
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: "12px" }}>{comment.author?.charAt(0)}</Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {comment.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleDeleteComment(comment.commentId)}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" sx={{ ml: 4 }}>
                    {comment.text}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>

        <Divider />

        {/* Add Comment */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={selectedRange ? "Ajouter un commentaire..." : "Sélectionnez du texte pour commenter..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            disabled={!selectedRange}
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
          {/* Show current user name instead of input */}
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>{authorName?.charAt(0)}</Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{authorName}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={handleAddComment}
              disabled={!selectedRange || !commentText.trim() || !authorName.trim()}
              variant="contained"
              size="small"
              endIcon={<Send />}
              sx={{
                textTransform: "none",
                borderRadius: "20px",
                backgroundColor: "#4285f4",
              }}
            >
              Commenter
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
