import { getServerSession } from "next-auth";
import ResponsiveDrawer from "../userSideBar";
import React from "react";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { Box, Card, CardContent, Toolbar, Typography } from "@mui/material";

const MyCompanies = async () => {
  const session = await getServerSession(options);
  const user = session?.user || null;
  return (
    <Box sx={{ display: "flex" }}>
      <ResponsiveDrawer
        selected="My Companies"
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

export default MyCompanies;
