import React from "react";
import { options } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const MyComponent = () => {
  const session = getServerSession(options);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl?=/dashboard");
  }

  return <div>Dashboard</div>;
};

export default MyComponent;
