import { useState, useMemo, useEffect } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { 
  MantineProvider, 
  createTheme, 
  Button, 
  Group, 
  Text, 
  Paper, 
  Stack, 
  Textarea, 
  TextInput, 
  Title, 
  Badge, 
  ActionIcon, 
  Tooltip, 
  Box, 
  Divider,
  Avatar,
  Notification,
  Loader,
  Transition,
  rem
} from '@mantine/core'; 
import '@mantine/core/styles.css';
import { useCommentsUnified } from '../../hooks/useCommentsUnified';

const theme = createTheme({
  spacing: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.25rem', xl: '1.5rem' },
  colors: {
    brand: [
      '#f0f9ff',
      '#e0f2fe',
      '#bae6fd',
      '#7dd3fc',
      '#38bdf8',
      '#0ea5e9',
      '#0284c7',
      '#0369a1',
      '#075985',
      '#0c4a6e'
    ],
    accent: [
      '#fef3c7',
      '#fde68a',
      '#fcd34d',
      '#fbbf24',
      '#f59e0b',
      '#d97706',
      '#b45309',
      '#92400e',
      '#78350f',
      '#451a03'
    ],
    success: [
      '#dcfce7',
      '#bbf7d0',
      '#86efac',
      '#4ade80',
      '#22c55e',
      '#16a34a',
      '#15803d',
      '#166534',
      '#14532d',
      '#052e16'
    ]
  },
  primaryColor: 'brand',
  defaultRadius: 'md',
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
  },
});

function Editor({ docId = 'default-doc' }) {
  console.log(`[Editor.js] Component rendering. Received docId: '${docId}'`); // Log received docId
  
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVE
  const editor = useCreateBlockNote({});
  const { 
    commentsMap, 
    loading, 
    addComment, 
    deleteComment, 
    reload 
  } = useCommentsUnified(docId);

  const [selectedRange, setSelectedRange] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('User');
  
  // Memoize comments array for display - moved before conditional return
  const commentsArray = useMemo(() => {
    if (!commentsMap) return [];
    if (typeof commentsMap.values !== 'function') return [];
    const arr = Array.from(commentsMap.values());
    console.log('[Editor.js] DEBUG commentsArray:', arr);
    return arr;
  }, [commentsMap]);

  // Effect to listen to selection changes in the editor
  useEffect(() => {
    if (editor && editor._tiptapEditor && typeof editor._tiptapEditor.on === 'function') {

      const handleSelectionUpdate = ({ editor: tiptapEditor }) => { 
        const pmSelection = tiptapEditor.state.selection;

        if (pmSelection && typeof pmSelection.from === 'number' && typeof pmSelection.to === 'number' && pmSelection.from !== pmSelection.to) {
          setSelectedRange({ start: pmSelection.from, end: pmSelection.to });
        } else {
          setSelectedRange(null);
        }
      };

      editor._tiptapEditor.on('selectionUpdate', handleSelectionUpdate);

      return () => {
        if (editor && editor._tiptapEditor && typeof editor._tiptapEditor.off === 'function') {
          editor._tiptapEditor.off('selectionUpdate', handleSelectionUpdate);
        }
      };
    } 
  }, [editor]); 
  
  // Conditional return must be AFTER all hook calls
  if (!editor) {
    return (
      <MantineProvider theme={theme}>
        <Box style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', 
          minHeight: '100vh',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper 
            p="xl" 
            withBorder 
            radius="xl"
            shadow="2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              maxWidth: '400px',
              width: '100%'
            }}
          >
            <Stack align="center" gap="lg">
              <Box
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  animation: 'pulse 2s infinite'
                }}
              >
                📝
              </Box>
              <Stack gap="sm" align="center">
                <Loader size="lg" color="brand" />
                <Title order={3} c="brand.7" fw={700}>
                  Loading Editor...
                </Title>
                <Text c="dimmed" size="sm">
                  Preparing your collaborative workspace
                </Text>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </MantineProvider>
    );
  }

  const handleAddComment = async () => {
    if (!selectedRange || !commentText.trim() || !authorName.trim()) {
      alert("Please select text that can be commented on, and enter both a comment and your name.");
      return;
    }
    // Additional check for range validity, though useEffect should handle this
    if (typeof selectedRange.start !== 'number' || typeof selectedRange.end !== 'number' || selectedRange.start === selectedRange.end) {
        alert("Invalid text selection range. Please select a non-empty text portion.");
        return;
    }
    try {
      await addComment(selectedRange, commentText, authorName);
      setCommentText('');
      // Optionally, you might want to keep the selection or clear it.
      // setSelectedRange(null); // Clear selection after commenting - uncomment if desired
      // console.log("[Editor.js] Comment added for range:", selectedRange); // Debug
    } catch (error) {
      // Enhanced error logging for Apollo/GraphQL errors
      if (error && error.graphQLErrors) {
        console.error("[Editor.js] GraphQL Errors:", error.graphQLErrors,error);
        alert("Failed to add comment: " + error.graphQLErrors.map(e => e.message).join("; "));
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
    // console.log(`[Editor.js] Attempting to delete comment: ${commentId}`); // Debug
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
        // console.log(`[Editor.js] Comment ${commentId} deleted successfully.`); // Debug
        // Optionally, add a success notification here
      } catch (error) {
        console.error(`[Editor.js] Failed to delete comment ${commentId}:`, error);
        alert("Failed to delete comment. See console for details.");
      }
    }
  };

  return (
    <MantineProvider theme={theme}>
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
      </style>      <Box 
        className="main-container"
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', 
          minHeight: '100vh',
          padding: '2rem',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Group 
          className="editor-container"
          align="flex-start" 
          wrap="nowrap" 
          gap="xl" 
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Stack 
            className="editor-main"
            style={{ flexGrow: 1, maxWidth: 'calc(100% - 400px - 2rem)' }}
          >
            <Paper 
              p="xl" 
              radius="xl" 
              withBorder 
              shadow="xl"
              style={{ 
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                borderColor: 'rgba(226, 232, 240, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              <Group justify="space-between" align="center" mb="lg">
                <Group align="center" gap="md">                  <Box
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                      animation: 'float 3s ease-in-out infinite'
                    }}
                    className="float-animation"
                  >
                    📝
                  </Box>
                  <Stack gap={4}>
                    <Title 
                      order={1} 
                      size="h2"
                      c="brand.8"
                      style={{ 
                        fontWeight: 700,
                        letterSpacing: '-0.025em',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Document Editor
                    </Title>
                    <Text size="sm" c="dimmed" fw={500}>
                      Collaborative real-time editor with comments
                    </Text>
                  </Stack>
                </Group>
                <Badge 
                  variant="gradient" 
                  gradient={{ from: 'brand.5', to: 'brand.7', deg: 45 }}
                  size="lg"
                  style={{
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 16px',
                    fontSize: '12px'
                  }}
                >
                  Doc: {docId}
                </Badge>
              </Group>
            </Paper>
            
            <Paper 
              withBorder 
              radius="xl" 
              shadow="2xl"
              style={{ 
                flexGrow: 1, 
                minHeight: '75vh',
                background: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(226, 232, 240, 0.8)',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              <Box 
                style={{ 
                  height: '100%',
                  position: 'relative',
                  '& .bn-container': {
                    borderRadius: '24px',
                    overflow: 'hidden'
                  },
                  '& .bn-editor': {
                    padding: '2rem',
                    fontSize: '16px',
                    lineHeight: '1.7',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }
                }}
              >
                <BlockNoteView editor={editor} />
              </Box>
            </Paper>
          </Stack>          
          <Paper 
            className="comments-panel"
            shadow="2xl" 
            p="xl" 
            radius="xl" 
            withBorder 
            style={{ 
              width: 400, 
              minWidth: 380, 
              maxHeight: '95vh', 
              overflowY: 'auto',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
              borderColor: 'rgba(226, 232, 240, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              position: 'relative',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(102, 126, 234, 0.3) transparent',
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(102, 126, 234, 0.3)',
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(102, 126, 234, 0.5)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                borderRadius: '24px 24px 0 0'
              }
            }}
          >
            <Stack gap="lg">
              <Group justify="space-between" align="center" mt="sm">
                <Group align="center" gap="sm">                  <Box
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                      animation: 'float 3s ease-in-out infinite 0.5s'
                    }}
                    className="float-animation"
                  >
                    💬
                  </Box>
                  <Title 
                    order={2} 
                    size="h3"
                    style={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Comments
                  </Title>
                </Group>
                <Badge 
                  variant="gradient"
                  gradient={{ from: 'accent.4', to: 'accent.6', deg: 45 }}
                  size="lg"
                  style={{
                    fontWeight: 700,
                    fontSize: '14px',
                    padding: '8px 12px',
                    minWidth: '40px',
                    textAlign: 'center'
                  }}
                >
                  {commentsArray.length}
                </Badge>
              </Group>
              
              <Divider 
                style={{ 
                  background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)',
                  height: '2px',
                  border: 'none'
                }} 
              />
              
              {loading && (
                <Paper 
                  p="xl" 
                  radius="lg" 
                  style={{ 
                    background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    textAlign: 'center'
                  }}
                >
                  <Loader size="md" color="brand" style={{ margin: '0 auto 12px' }} />
                  <Text c="brand.7" fw={500} style={{ fontStyle: 'italic' }}>
                    Loading comments...
                  </Text>
                </Paper>
              )}
              
              {!loading && commentsArray.length === 0 && (
                <Paper 
                  p="xl" 
                  radius="lg" 
                  style={{ 
                    background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    textAlign: 'center'
                  }}
                >
                  <Box
                    style={{
                      fontSize: '48px',
                      marginBottom: '12px',
                      opacity: 0.7
                    }}
                  >
                    📝
                  </Box>
                  <Text c="brand.7" size="sm" fw={500} style={{ lineHeight: 1.6 }}>
                    No comments yet
                    <br />
                    <Text span c="dimmed" size="xs">
                      Select text in the editor to add your first comment!
                    </Text>
                  </Text>
                </Paper>
              )}              
              <Stack gap="md">
                {commentsArray.map((comment, index) => (
                  <Transition
                    key={comment.commentId}
                    mounted={true}
                    transition="slide-up"
                    duration={300}
                    timingFunction="ease"
                  >
                    {(styles) => (                      <Paper 
                        withBorder 
                        p="lg" 
                        radius="lg" 
                        shadow="md"
                        className="comment-card"
                        style={{
                          ...styles,
                          background: index % 2 === 0 
                            ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))' 
                            : 'linear-gradient(145deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                          borderColor: index % 2 === 0 ? 'rgba(226, 232, 240, 0.8)' : 'rgba(102, 126, 234, 0.2)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          animationDelay: `${index * 0.1}s`,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            background: index % 2 === 0 
                              ? 'linear-gradient(180deg, #667eea, #764ba2)' 
                              : 'linear-gradient(180deg, #f093fb, #f5576c)',
                            borderRadius: '0 2px 2px 0'
                          }
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.15)';
                          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
                          e.currentTarget.style.borderColor = index % 2 === 0 ? 'rgba(226, 232, 240, 0.8)' : 'rgba(102, 126, 234, 0.2)';
                        }}
                      >
                        <Group justify="space-between" align="flex-start" mb="md">
                          <Group align="center" gap="sm">
                            <Avatar
                              size="sm"
                              radius="xl"
                              style={{
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '12px'
                              }}
                            >
                              {comment.author?.charAt(0)?.toUpperCase() || '?'}
                            </Avatar>
                            <Badge 
                              variant="light" 
                              color="brand" 
                              size="sm"
                              style={{
                                textTransform: 'none',
                                fontWeight: 600
                              }}
                            >
                              {comment.author}
                            </Badge>
                          </Group>
                          <Tooltip 
                            label={`Text range: ${comment.rangeStart} to ${comment.rangeEnd}`}
                            position="top"
                            withArrow
                          >
                            <Badge 
                              variant="outline" 
                              color="gray" 
                              size="xs"
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '10px'
                              }}
                            >
                              #{comment.rangeStart}-{comment.rangeEnd}
                            </Badge>
                          </Tooltip>
                        </Group>
                        <Text 
                          size="sm" 
                          style={{ 
                            lineHeight: 1.6,
                            color: '#374151',
                            fontWeight: 500,
                            paddingLeft: '12px'
                          }}
                        >
                          {comment.text}
                        </Text>
                          <Group justify="flex-end" mt="sm" gap="xs">
                          <Tooltip label="Edit comment" position="top" withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="brand"
                              size="sm"
                              radius="xl"
                              style={{ 
                                opacity: 0.7,
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0.7';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                              onClick={() => { /* Placeholder for edit */ }} // REVERTED: Removed handleEditComment call
                            >
                              ✏️
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete comment" position="top" withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              radius="xl"
                              style={{ 
                                opacity: 0.7,
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0.7';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                              onClick={() => handleDeleteComment(comment.commentId)}
                            >
                              🗑️
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Paper>
                    )}
                  </Transition>
                ))}
              </Stack>             
              <Divider 
                style={{ 
                  background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)',
                  height: '2px',
                  border: 'none'
                }} 
              />
              
              <Paper 
                p="xl" 
                radius="lg" 
                style={{ 
                  background: selectedRange 
                    ? 'linear-gradient(145deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))'
                    : 'linear-gradient(145deg, rgba(156, 163, 175, 0.05), rgba(156, 163, 175, 0.08))',
                  border: selectedRange 
                    ? '2px solid rgba(102, 126, 234, 0.2)'
                    : '2px solid rgba(156, 163, 175, 0.2)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: selectedRange 
                      ? 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)'
                      : 'linear-gradient(90deg, #9ca3af, #6b7280)',
                    opacity: selectedRange ? 1 : 0.5
                  }
                }}
              >
                <Stack gap="md">
                  <Group align="center" gap="sm" mt="xs">
                    <Box
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: selectedRange 
                          ? 'linear-gradient(45deg, #667eea, #764ba2)'
                          : 'linear-gradient(45deg, #9ca3af, #6b7280)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ✨
                    </Box>
                    <Title 
                      order={4} 
                      style={{ 
                        fontWeight: 700,
                        background: selectedRange 
                          ? 'linear-gradient(45deg, #667eea, #764ba2)'
                          : 'linear-gradient(45deg, #9ca3af, #6b7280)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Add New Comment
                    </Title>
                  </Group>
                    {selectedRange && (
                    <Notification
                      color="brand"
                      radius="md"
                      withCloseButton={false}
                      style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        animation: 'slideInUp 0.3s ease-out'
                      }}
                    >
                      <Group align="center" gap="xs">
                        <Box
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            animation: 'pulse 2s ease-in-out infinite'
                          }}
                        />
                        <Text size="sm" fw={600} c="brand.7">
                          Text selected! Ready to comment.
                        </Text>
                      </Group>
                    </Notification>
                  )}
                  
                  {!selectedRange && (
                    <Notification
                      color="orange"
                      radius="md"
                      withCloseButton={false}
                      style={{
                        background: 'rgba(251, 146, 60, 0.1)',
                        border: '1px solid rgba(251, 146, 60, 0.3)'
                      }}
                    >
                      <Text size="sm" fw={500}>
                        Please select text in the editor first
                      </Text>
                    </Notification>
                  )}
                  
                  <Textarea
                    placeholder="Write your comment here..."
                    value={commentText}
                    onChange={(event) => setCommentText(event.currentTarget.value)}
                    autosize
                    minRows={3}
                    maxRows={6}
                    disabled={!selectedRange}
                    radius="md"
                    styles={{
                      input: {
                        backgroundColor: selectedRange ? 'rgba(255, 255, 255, 0.9)' : 'rgba(243, 244, 246, 0.5)',
                        borderColor: selectedRange ? 'rgba(102, 126, 234, 0.4)' : 'rgba(209, 213, 219, 0.5)',
                        borderWidth: '2px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        transition: 'all 0.3s ease',
                        '&:focus': {
                          borderColor: 'rgba(102, 126, 234, 0.6)',
                          boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }
                      }
                    }}
                  />
                  
                  <TextInput 
                    placeholder="Your name"
                    label={
                      <Text fw={600} size="sm" c="brand.7">
                        Author
                      </Text>
                    }
                    value={authorName}
                    onChange={(event) => setAuthorName(event.currentTarget.value)}
                    radius="md"
                    leftSection="👤"
                    styles={{
                      input: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                        borderWidth: '2px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        '&:focus': {
                          borderColor: 'rgba(102, 126, 234, 0.6)',
                          boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }
                      }
                    }}
                  />
                  
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!selectedRange || !commentText.trim() || !authorName.trim()}
                    fullWidth
                    size="md"
                    radius="md"
                    variant="gradient"
                    gradient={{ from: 'brand.5', to: 'brand.7', deg: 45 }}
                    style={{
                      fontWeight: 700,
                      textTransform: 'none',
                      letterSpacing: '0.025em',
                      fontSize: '14px',
                      height: '48px',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedRange 
                        ? '0 8px 32px rgba(102, 126, 234, 0.3)'
                        : '0 4px 16px rgba(156, 163, 175, 0.2)'
                    }}
                    leftSection="💬"
                  >
                    Add Comment
                  </Button>
                </Stack>
              </Paper>
              
              <Button 
                onClick={reload} 
                variant="subtle" 
                color="gray" 
                fullWidth
                size="sm"
                radius="md"
                leftSection="🔄"
                style={{
                  fontWeight: 600,
                  textTransform: 'none',
                  height: '40px',
                  transition: 'all 0.3s ease'
                }}
              >
                Refresh Comments
              </Button>
            </Stack>
          </Paper>
        </Group>
      </Box>
    </MantineProvider>
  );
}

export default Editor;
