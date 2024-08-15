import React from "react";
import {
  Card,
  CardHeader,
  Typography,
  CardContent,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";

const Dashboard = ({
  user,
}: {
  user: { id: string; name: string; email: string };
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      <Card>
        <CardHeader
          title={
            <Typography variant={isSmallScreen ? "h5" : "h4"} gutterBottom>
              Dashboard
            </Typography>
          }
        />
        <CardContent>
          <Typography variant="body1">
            Welcome, {user.name}! Here is your dashboard.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
