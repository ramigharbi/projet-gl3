import {
  MantineProvider,
  Box,
  Paper,
  Stack,
  Loader,
  Title,
  Text,
} from '@mantine/core';
import { editorTheme } from './theme';

export function EditorLoadingScreen() {
  return (
    <MantineProvider theme={editorTheme}>
      <Box
        style={{
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          minHeight: '100vh',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
            width: '100%',
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
                animation: 'pulse 2s infinite',
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
