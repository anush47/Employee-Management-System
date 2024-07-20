import ResponsiveDrawer from "../userSideBar";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import React from "react";
import { Box, Card, CardContent, Toolbar, Typography } from "@mui/material";
import "@fontsource/roboto/400.css";

const Dashboard = async () => {
  const session = await getServerSession(options);
  const user = session?.user || null;
  console.log(user);
  return (
    <Box sx={{ display: "flex" }}>
      <ResponsiveDrawer
        selected="Dashboard"
        user={
          user
            ? { name: user.name ?? "", email: user.email ?? "" }
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
          <CardContent>
            <div>
              <Typography variant="h4">
                Welcome, {user ? user.name : "Stranger"}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
