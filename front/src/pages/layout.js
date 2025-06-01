import { ThemeProvider, createTheme } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import { DocumentProvider } from "../context/DocumentContext"

const theme = createTheme({
  palette: {
    primary: {
      main: "#4285f4",
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
  },
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <DocumentProvider>{children}</DocumentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
