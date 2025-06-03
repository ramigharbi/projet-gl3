import { useMemo, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
  Badge,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Close, Send, Delete, Comment } from "@mui/icons-material";

export function CommentsSidebar({
  open,
  onClose,
  commentsArray,
  loading,
  selectedRange,
  commentText,
  setCommentText,
  authorName,
  setAuthorName,
  handleAddComment,
  handleDeleteComment,
}) {
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
      {" "}
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Comment sx={{ fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: 600 }}>
              Comments
            </Typography>
            <Badge
              badgeContent={commentsArray?.length || 0}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "white",
                  color: "#667eea",
                  fontWeight: 700,
                },
              }}
            />
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>

        {/* Comments List */}
        <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                textAlign: "center",
              }}
            >
              <CircularProgress size={30} sx={{ mb: 2, color: "#667eea" }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Loading comments...
              </Typography>
            </Box>
          ) : !commentsArray || commentsArray.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                textAlign: "center",
                background:
                  "linear-gradient(145deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))",
                border: "1px solid rgba(102, 126, 234, 0.1)",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h1"
                sx={{ fontSize: 48, mb: 1, opacity: 0.7 }}
              >
                📝
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                No comments yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select text in the editor to add your first comment!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {commentsArray.map((comment, index) => (
                <Paper
                  key={comment.commentId}
                  elevation={1}
                  sx={{
                    p: 1.5,
                    backgroundColor:
                      index % 2 === 0 ? "#ffffff" : "rgba(102, 126, 234, 0.02)",
                    border:
                      index % 2 === 0
                        ? "1px solid #e0e0e0"
                        : "1px solid rgba(102, 126, 234, 0.1)",
                    borderRadius: 2,
                    borderLeft:
                      index % 2 === 0
                        ? "4px solid #667eea"
                        : "4px solid #764ba2",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                    },
                  }}
                >
                  {/* Comment Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: "12px",
                          background:
                            "linear-gradient(45deg, #667eea, #764ba2)",
                          fontWeight: 700,
                        }}
                      >
                        {comment.author?.charAt(0)?.toUpperCase() || "?"}
                      </Avatar>
                      <Chip
                        label={comment.author}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "11px",
                          height: 20,
                          fontWeight: 600,
                          borderColor: "#667eea",
                          color: "#667eea",
                        }}
                      />
                    </Box>
                    <Chip
                      label={`#${comment.rangeStart}-${comment.rangeEnd}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: "9px",
                        height: 18,
                        fontFamily: "monospace",
                        borderColor: "#9ca3af",
                        color: "#6b7280",
                      }}
                    />
                  </Box>

                  {/* Comment Text */}
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 4,
                      lineHeight: 1.5,
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {comment.text}
                  </Typography>

                  {/* Comment Actions */}
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComment(comment.commentId)}
                      sx={{
                        color: "#ef4444",
                        opacity: 0.7,
                        "&:hover": {
                          opacity: 1,
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>

        <Divider />

        {/* Add Comment Section */}
        <Box
          sx={{
            p: 2,
            background: selectedRange
              ? "linear-gradient(145deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))"
              : "linear-gradient(145deg, rgba(156, 163, 175, 0.05), rgba(156, 163, 175, 0.08))",
            borderTop: selectedRange
              ? "2px solid rgba(102, 126, 234, 0.2)"
              : "2px solid rgba(156, 163, 175, 0.2)",
          }}
        >
          {/* Selection Status */}
          {selectedRange ? (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                fontSize: "12px",
                "& .MuiAlert-message": { fontSize: "12px" },
                background: "rgba(102, 126, 234, 0.1)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
              }}
            >
              Text selected! Ready to comment.
            </Alert>
          ) : (
            <Alert
              severity="warning"
              sx={{
                mb: 2,
                fontSize: "12px",
                "& .MuiAlert-message": { fontSize: "12px" },
              }}
            >
              Please select text in the editor first
            </Alert>
          )}

          {/* Author Name Input */}
          <TextField
            fullWidth
            label="Your name"
            placeholder="Your name"
            value={authorName || ""}
            onChange={(e) => setAuthorName(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
            }}
          />

          {/* Comment Text Input */}
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write your comment here..."
            value={commentText || ""}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!selectedRange}
            variant="outlined"
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                backgroundColor: selectedRange
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(243, 244, 246, 0.5)",
                borderColor: selectedRange
                  ? "rgba(102, 126, 234, 0.4)"
                  : "rgba(209, 213, 219, 0.5)",
              },
            }}
          />

          {/* Add Comment Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={handleAddComment}
              disabled={
                !selectedRange || !commentText?.trim() || !authorName?.trim()
              }
              variant="contained"
              size="small"
              endIcon={<Send />}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                background: selectedRange
                  ? "linear-gradient(45deg, #667eea, #764ba2)"
                  : "linear-gradient(45deg, #9ca3af, #6b7280)",
                fontWeight: 600,
                px: 2,
                "&:hover": {
                  background: selectedRange
                    ? "linear-gradient(45deg, #5a67d8, #68578c)"
                    : "linear-gradient(45deg, #9ca3af, #6b7280)",
                },
                "&:disabled": {
                  background: "linear-gradient(45deg, #9ca3af, #6b7280)",
                  opacity: 0.6,
                },
              }}
            >
              Add Comment
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
