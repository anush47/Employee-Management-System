import React from "react";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import "@fontsource/roboto/400.css";
import EditForm from "./clientComponents/editForm";

const Settings = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  return (
    <Card>
      <CardHeader title={<Typography variant="h4">Settings</Typography>} />
      <CardContent>
        <EditForm user={user} />
      </CardContent>
    </Card>
  );
};

export default Settings;
