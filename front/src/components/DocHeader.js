import {  
  Group,
  Paper,
  Stack,
  Title,
  Text,
  Badge,
  Box,
} from '@mantine/core';

export const DocHeader = ({ docId }) => {
    return (
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
                <Group align="center" gap="md">                  
                 <Box
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
    );
}
