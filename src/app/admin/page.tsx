import { getServerSession } from "next-auth";
import AdminSideBar from "./clientComponents/adminSideBar";
import React from "react";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { Box } from "@mui/material";
import AdminMainBox from "./clientComponents/adminMainBox";
import UnAuthorize from "./unAuthorize/UnAuthorize";

const AdminPage = async () => {
  const session = await getServerSession(options);
  const user = session?.user || null;

  if (!user) {
    //redirect to login page if user is not logged in
    window.location.href = "/auth/login?callbackUrl=/admin";
  }

  if (user && user.role !== "admin") {
    return <UnAuthorize user={user} />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AdminSideBar
        user={
          user
            ? {
                name: user.name ?? "",
                email: user.email ?? "",
                role: user.role ?? "",
                image: user.image ?? "",
              }
            : { name: "", email: "", role: "", image: "" }
        }
      />
      <AdminMainBox
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

export default AdminPage;
