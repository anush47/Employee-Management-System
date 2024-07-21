import { Card, CardHeader, Typography, CardContent } from "@mui/material";
import React from "react";

const Dashboard = ({
  user,
}: {
  user: { id: string; name: string; email: string };
}) => {
  return (
    <div>
      <Card>
        <CardHeader title={<Typography variant="h4">Dashboard</Typography>} />
        <CardContent></CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
