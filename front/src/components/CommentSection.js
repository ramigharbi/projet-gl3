import {
  Paper,
  Stack,
  Group,
  Title,
  Badge,
  Divider,
  Box,
  Text,
  Loader,
  Transition,
  Avatar,
  Tooltip,
  ActionIcon,
  Notification,
  Textarea,
  TextInput,
  Button,
} from '@mantine/core';

export function CommentSection({
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
          <Group align="center" gap="sm">
            <Box
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
              {(styles) => (
                <Paper 
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
      </Stack>
    </Paper>
  );
}