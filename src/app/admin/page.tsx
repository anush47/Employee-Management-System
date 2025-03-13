import { getServerSession } from "next-auth";
import React from "react";
import { options } from "../api/auth/[...nextauth]/options";
import UnAuthorize from "./UnAuthorize";

const Test = async () => {
  //get the user
  const session = await getServerSession(options);
  const user = session?.user || null;
  return user && user.role === "admin" ? (
    <div>
      <h1>Test</h1>
    </div>
  ) : (
    <UnAuthorize user />
  );
};

export default Test;
