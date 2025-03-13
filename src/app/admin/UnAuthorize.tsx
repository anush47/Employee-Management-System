import React from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import Link from "next/link";

const UnAuthorize: React.FC<{ user: any }> = ({ user }) => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#f5f5f5", // static value
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          padding: "30px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          borderRadius: "10px",
          backgroundColor: "#ffffff", // static value
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#d32f2f", // static value
              marginBottom: "20px",
            }}
          >
            Unauthorized 😞
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#555", marginBottom: "30px" }} // static value
          >
            Sorry {user?.name} You don’t have permission to access this page.
          </Typography>
          <Link href="/user">
            <Button
              variant="contained"
              color="primary"
              sx={{
                padding: "10px 20px",
                backgroundColor: "#1976d2", // static value
                "&:hover": { backgroundColor: "#1565c0" }, // static value
              }}
            >
              Go to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UnAuthorize;
