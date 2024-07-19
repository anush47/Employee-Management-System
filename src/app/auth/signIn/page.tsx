"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Alert,
  AlertTitle,
} from "@mui/material";
import { Button, TextField, Link } from "@mui/material";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const error = searchParams.get("error");

  const ErrorAlert = () => (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      {error === "CredentialsSignin"
        ? "Invalid email or password."
        : "An error occurred."}
    </Alert>
  );

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl,
    });
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      padding={5}
    >
      <Card
        className="p-3"
        sx={{ maxWidth: 400, width: "100%", boxShadow: 3, borderRadius: 2 }}
      >
        {error && <ErrorAlert />}
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
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              sx={{ textTransform: "none", fontSize: "1rem", paddingY: 1.5 }}
            >
              Login
            </Button>
          </Box>
        </CardContent>
        <Box mt={2} display="flex" justifyContent="center">
          <Typography variant="body2">
            Don't have an account?{" "}
            <Link href="/auth/signUp" color="primary.main" underline="hover">
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default SignInPage;
