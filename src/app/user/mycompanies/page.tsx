import { getServerSession } from "next-auth";
import ResponsiveDrawer from "../userSideBar";
import React from "react";
import { options } from "@/app/api/auth/[...nextauth]/options";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Toolbar,
  Typography,
} from "@mui/material";
import CompaniesDataGrid from "./clientComponents/companiesDataGrid";

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
          <CardHeader
            title={<Typography variant="h4">My Companies</Typography>}
          />
          <CardContent>
            <CompaniesDataGrid
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

export default MyCompanies;
