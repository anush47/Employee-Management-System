import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography,
  Avatar,
} from "@mui/material";
import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(options);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 p-4 sm:p-8">
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", md: "md" },
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          boxShadow: 6,
          textAlign: "center",
          gap: 3,
        }}
      >
        <CardContent>
          {session ? (
            <div>
              <Avatar
                alt={session?.user?.name || ""}
                src={session?.user?.image || ""}
                sx={{ width: 80, height: 80, margin: "0 auto 16px" }}
              />
              <Typography variant="h4" component="h1" className="font-bold">
                Welcome back, {session?.user?.name}!
              </Typography>
              <Typography variant="body1" className="mt-2">
                We&apos;re glad to see you again. Explore your dashboard to
                manage your salary details.
              </Typography>
              <Divider
                sx={{
                  my: 3,
                }}
              />
              <Box
                className="mt-6"
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Link href="/user?userPageSelect=mycompanies">
                  <Button variant="contained" color="primary" className="mr-4">
                    Get Started
                  </Button>
                </Link>
                <Link href="/api/auth/signout">
                  <Button variant="outlined" color="error">
                    Sign Out
                  </Button>
                </Link>
              </Box>
            </div>
          ) : (
            <div>
              <Typography variant="h4" component="h1" className="font-bold">
                Welcome to Salary App!
              </Typography>
              <Typography variant="body1" className="mt-2">
                Please sign in to access your dashboard.
              </Typography>
              <div className="mt-6">
                <Link href="/api/auth/signin">
                  <Button variant="contained" color="primary">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
