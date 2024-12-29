import { getServerSession } from "next-auth";
import CompanySideBar from "./clientComponents/companySideBar";
import React from "react";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { Box } from "@mui/material";
import MainBox from "./clientComponents/companyMainBox";

const UserPage = async () => {
  const session = await getServerSession(options);
  const user = session?.user || null;

  return (
    <Box sx={{ display: "flex" }}>
      <CompanySideBar
        user={
          user
            ? {
                name: user.name ?? "",
                email: user.email ?? "",
                image: user.image ?? "",
                role: user.role ?? "",
              }
            : { name: "", email: "", image: "", role: "" }
        }
      />
      <MainBox
        user={
          user
            ? {
                name: user.name ?? "",
                email: user.email ?? "",
                id: user.id ?? "",
                role: user.role ?? "",
                image: user.image ?? "",
              }
            : { name: "", email: "", id: "", role: "", image: "" }
        }
      />
    </Box>
  );
};

export default UserPage;
