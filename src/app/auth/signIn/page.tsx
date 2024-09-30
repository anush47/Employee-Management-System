"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Alert,
  AlertTitle,
  Collapse,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Button, TextField, Link } from "@mui/material";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingButton } from "@mui/lab";
import { Login, Visibility, VisibilityOff } from "@mui/icons-material";

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const ErrorAlert = () => {
    const [isError, setIsError] = useState(error ? true : false);

    if (isError) {
      setTimeout(() => {
        setIsError(false);
      }, 5000);
    }
    return (
      <Collapse in={isError}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error === "CredentialsSignin"
            ? "Invalid email or password."
            : "An error occurred."}
        </Alert>
      </Collapse>
    );
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl,
    });
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      padding={3}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 450,
          width: "100%",
          px: 1,
          py: 3,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "background.paper",
        }}
      >
        <ErrorAlert />
        <CardHeader
          title="Login"
          titleTypographyProps={{
            variant: "h4",
            align: "center",
            color: "primary.main",
          }}
        />
        <CardContent>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            display="flex"
            flexDirection="column"
            gap={2}
            onSubmit={handleLogin}
          >
            <TextField
              label="Email"
              variant="outlined"
              autoComplete="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              variant="outlined"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <LoadingButton
              variant="contained"
              color="primary"
              type="submit"
              loading={loading}
              endIcon={<Login />}
              sx={{
                alignSelf: "center",
                textTransform: "none",
                fontSize: "1rem",
                py: 1.5,
                px: 5,
                maxWidth: "max-content",
              }}
            >
              <span>Login</span>
            </LoadingButton>
          </Box>
        </CardContent>
        <Box mt={2} display="flex" justifyContent="center">
          <Typography variant="body2">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signUp" color="primary.main" underline="hover">
              Register
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignInPage;
