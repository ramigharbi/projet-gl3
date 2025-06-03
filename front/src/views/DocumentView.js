import { MantineProvider, Group, Paper, Stack, Box } from "@mantine/core";
import "@mantine/core/styles.css";
import { useCommentsUnified } from "../hooks/useCommentsUnified";
import { useState, useMemo, useEffect } from "react";
import { editorTheme } from "../components/theme";
import { EditorLoadingScreen } from "../components/EditorLoadingScreen";
import { CommentSection } from "../components/CommentSection";
import { DocHeader } from "../components/DocHeader";
import TextEditor from "../components/quill/TextEditor";

function DocumentView({ docId = "default-doc" }) {
  const { commentsMap, loading, addComment, deleteComment } =
    useCommentsUnified(docId);

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
        alert("Failed to add comment: " + error.message);
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
      </style>{" "}
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
            <DocHeader docId={docId} />

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
                <TextEditor
                  onSelection={setSelectedRange}
                  comments={commentsArray}
                />
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

export default DocumentView;
