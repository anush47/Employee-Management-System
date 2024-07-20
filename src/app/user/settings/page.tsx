import ResponsiveDrawer from "../userSideBar";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Toolbar,
  Typography,
} from "@mui/material";
import "@fontsource/roboto/400.css";
import EditForm from "./clientComponents/editForm";

const Settings = async () => {
  const session = await getServerSession(options);
  const user = session?.user || null;
  console.log(user);
  return (
    <Box sx={{ display: "flex" }}>
      <ResponsiveDrawer
        selected="Settings"
        user={
          user
            ? { name: user?.name ?? "", email: user?.email ?? "" }
            : { name: "", email: "" }
        }
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Toolbar />
        <Card>
          <CardHeader title={<Typography variant="h4">Settings</Typography>} />
          <CardContent>
            <EditForm
              user={{
                id: user?.id ?? "",
                name: user?.name ?? "",
                email: user?.email ?? "",
              }}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Settings;
