import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Divider,
  Button,
} from "@mui/material";
import Image from "next/image";
import Agreement from "./agreement";
import Link from "next/link";

export default function UserAgreement() {
  return (
    <main
      style={{
        background: "linear-gradient(to right, #e3f2fd, #bbdefb, #90caf9)",
        paddingBottom: "2rem",
      }}
    >
      <Agreement />
      <Box display="flex" justifyContent="center" mt={4}>
        <Link href="/">
          <Button variant="contained" color="primary" sx={{ my: 1 }}>
            Go Back to Home
          </Button>
        </Link>
      </Box>
    </main>
  );
}
