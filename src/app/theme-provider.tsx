"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider, createTheme, Theme } from "@mui/material/styles";
import { Button, IconButton, Tooltip, useTheme } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";

// Define light and dark themes
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#303030",
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f0f0f0",
    },
  },
});

// Create a context for theme
const ThemeContext = createContext({
  theme: darkTheme,
  toggleTheme: () => {},
});

// Custom hook to use theme context
export const useThemeContext = () => useContext(ThemeContext);

// Theme switcher component
export const ThemeSwitch = () => {
  const { toggleTheme } = useThemeContext();
  const theme = useTheme();

  return (
    <Tooltip title="Toggle Theme" arrow>
      <IconButton onClick={toggleTheme}>
        {theme.palette.mode === "dark" ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
};

// Global theme provider to manage the theme state
interface AppThemeProviderProps {
  children: React.ReactNode;
}

const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(darkTheme);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme.palette.mode === "dark" ? lightTheme : darkTheme
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default AppThemeProvider;
