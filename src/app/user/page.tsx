import { getServerSession } from "next-auth";
import ResponsiveDrawer from "./clientComponents/userSideBar";
import React from "react";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { Box } from "@mui/material";
import MainBox from "./clientComponents/mainBox";

const UserPage = async () => {
  const session = await getServerSession(options);
  const user = session?.user || null;

  return (
    <Box sx={{ display: "flex" }}>
      <ResponsiveDrawer
        user={
          user
            ? { name: user.name ?? "", email: user.email ?? "" }
            : { name: "", email: "" }
        }
      />
      <MainBox
        user={
          user
            ? {
                name: user.name ?? "",
                email: user.email ?? "",
                id: user.id ?? "",
              }
            : { name: "", email: "", id: "" }
        }
      />
    </Box>
  );
};

export default UserPage;
