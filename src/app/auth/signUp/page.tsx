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
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const SignUpPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const error = searchParams.get("error");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    try {
      const res = await fetch("/api/auth/signUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.details || {});
        if (data.message === "User Exists") {
          setErrors({ general: "User already exists." });
        }
        return;
      }

      signIn("credentials", {
        email,
        password,
        callbackUrl,
      });
    } catch (e) {
      console.log(e);
      setErrors({ general: `An unexpected error occurred ${e}` });
    }
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
        className="p-5"
        sx={{ maxWidth: 400, width: "100%", boxShadow: 3, borderRadius: 2 }}
      >
        {error && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
        {errors.general && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {errors.general}
          </Alert>
        )}
        <CardHeader
          title="Sign Up"
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
            onSubmit={handleSignUp}
          >
            <TextField
              label="Name"
              variant="outlined"
              autoComplete="name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
            <TextField
              label="Email"
              variant="outlined"
              autoComplete="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              autoComplete="new-password" // Add this line
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              sx={{ textTransform: "none", fontSize: "1rem", paddingY: 1.5 }}
            >
              Sign Up
            </Button>
          </Box>
        </CardContent>
        <Box mt={2} display="flex" justifyContent="center">
          <Typography variant="body2">
            Already have an account?{" "}
            <Link href="/auth/signIn" color="primary.main" underline="hover">
              Sign In
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default SignUpPage;
