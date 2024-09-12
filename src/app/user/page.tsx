import { getServerSession } from "next-auth";
import UserSideBar from "./clientComponents/userSideBar";
import React from "react";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { Box } from "@mui/material";
import UserMainBox from "./clientComponents/userMainBox";

const UserPage = async () => {
  const session = await getServerSession(options);
  const user = session?.user || null;

  return (
    <Box sx={{ display: "flex" }}>
      <UserSideBar
        user={
          user
            ? {
                name: user.name ?? "",
                email: user.email ?? "",
                role: user.role ?? "",
              }
            : { name: "", email: "", role: "" }
        }
      />
      <UserMainBox
        user={
          user
            ? {
                name: user.name ?? "",
                email: user.email ?? "",
                id: user.id ?? "",
                role: user.role ?? "",
              }
            : { name: "", email: "", id: "", role: "" }
        }
      />
    </Box>
  );
};

export default UserPage;
