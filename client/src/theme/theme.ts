import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4299e1",
      light: "#63b3ed",
      dark: "#2c5282"
    },
    secondary: {
      main: "#4299e1",
      light: "#63b3ed",
      dark: "#2c5282"
    },
    background: {
      default: "#0a0e27",
      paper: "#0f1428"
    },
    text: {
      primary: "#e2e8f0",
      secondary: "#cbd5e0"
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #0f1428 0%, #1a1f3a 100%)",
          borderBottom: "1px solid rgba(66, 153, 225, 0.2)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)"
        }
      },
      defaultProps: {
        color: "transparent",
        position: "static",
        elevation: 0
      }
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
          color: "#ffffff",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: 8,
          padding: "8px 20px",
          boxShadow: "0 4px 12px rgba(66, 153, 225, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #3182ce 0%, #2c5282 100%)",
            boxShadow: "0 6px 16px rgba(66, 153, 225, 0.4)",
            transform: "translateY(-1px)"
          },
          "&:disabled": {
            background: "rgba(66, 153, 225, 0.3)",
            color: "rgba(203, 213, 224, 0.5)"
          }
        },
        text: {
          color: "#cbd5e0",
          textTransform: "none",
          fontWeight: 500,
          "&:hover": {
            background: "rgba(66, 153, 225, 0.1)",
            color: "#4299e1"
          }
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: "#cbd5e0",
          borderColor: "rgba(66, 153, 225, 0.2)",
          textTransform: "none",
          fontWeight: 500,
          "&:hover": {
            background: "rgba(66, 153, 225, 0.1)",
            borderColor: "rgba(66, 153, 225, 0.3)"
          },
          "&.Mui-selected": {
            background: "rgba(66, 153, 225, 0.2)",
            color: "#4299e1",
            borderColor: "rgba(66, 153, 225, 0.4)",
            "&:hover": {
              background: "rgba(66, 153, 225, 0.3)"
            }
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          background: "#0f1428",
          border: "1px solid rgba(66, 153, 225, 0.2)",
          borderRadius: 8,
          color: "#cbd5e0"
        },
        standardError: {
          background: "rgba(239, 68, 68, 0.1)",
          borderColor: "rgba(239, 68, 68, 0.3)",
          color: "#ef4444"
        }
      }
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          "& .MuiSnackbarContent-root": {
            background: "#0f1428",
            border: "1px solid rgba(66, 153, 225, 0.2)",
            borderRadius: 8,
            color: "#cbd5e0"
          }
        }
      }
    }
  }
});
