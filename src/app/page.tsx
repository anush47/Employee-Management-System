import { Button } from "@mui/material";
import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(options);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {session ? (
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-lg mt-4">
            You are signed in and can access your dashboard.
          </p>
          <Link href={"api/auth/signout"}>
            <Button variant="outlined" color="error">
              Sign Out
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold">Welcome to your app!</h1>
          <p className="text-lg mt-4">You are not signed in.</p>
        </div>
      )}
    </main>
  );
}
