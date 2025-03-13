import { getServerSession } from "next-auth";
import React from "react";
import { options } from "../api/auth/[...nextauth]/options";
import UnAuthorize from "./UnAuthorize";
import AdminPageContent from "./AdminPageContent";
import Link from "next/link";

const Test = async () => {
  //get the user
  const session = await getServerSession(options);
  const user = session?.user || null;
  return user && user.role === "admin" ? (
    <div>
      <AdminPageContent />
    </div>
  ) : (
    <UnAuthorize user />
  );
};

export default Test;
