"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Alert,
  AlertTitle,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { TextField, Link } from "@mui/material";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoadingButton } from "@mui/lab";
import { Login, Visibility, VisibilityOff } from "@mui/icons-material";

const SignUpPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const error = searchParams.get("error");

  const handleSignUp = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
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
          title="Register"
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
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(errors.password)}
              helperText={errors.password}
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
              fullWidth
              type="button"
              loading={loading}
              endIcon={<Login />}
              loadingPosition="end"
              sx={{
                textTransform: "none",
                fontSize: "1rem",
                py: 1.5,
                px: 5,
                maxWidth: "max-content",
                alignSelf: "center",
              }}
              onClick={handleSignUp}
            >
              <span>Register</span>
            </LoadingButton>
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
      </Paper>
    </Box>
  );
};

export default SignUpPage;
