import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Divider,
  Button,
} from "@mui/material";
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Agreement />
      </Container>
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
