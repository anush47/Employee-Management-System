import { Box, Button, Card, CardContent, Divider } from "@mui/material";
import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(options);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8">
      <Card
        sx={{
          width: "100%",
          maxWidth: "md",
          p: 4,
          borderRadius: 4,
          boxShadow: 4,
          textAlign: "center",
          gap: 3,
        }}
      >
        <CardContent>
          {session ? (
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Welcome back, {session?.user?.name}!
              </h1>
              <Divider
                sx={{
                  my: 3,
                }}
              />

              <Box
                className="mt-6"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                <Link href="/user?selected=dashboard">
                  <Button variant="contained" color="primary" className="mr-4">
                    Go to Dashboard
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
              <h1 className="text-4xl font-bold text-gray-800">
                Welcome to Your App!
              </h1>
              <p className="text-xl mt-4 text-gray-600">
                Please sign in to access your dashboard.
              </p>
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
