import React from "react";
import {
  Card,
  CardHeader,
  Typography,
  CardContent,
  useMediaQuery,
  useTheme,
  Box,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

const Dashboard = ({
  user,
}: {
  user: { id: string; name: string; email: string };
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const breadcrumbs = [
    <Link underline="hover" key="1" color="inherit" href="/">
      MUI
    </Link>,
    <Link
      underline="hover"
      key="2"
      color="inherit"
      href="/material-ui/getting-started/installation/"
    >
      Core
    </Link>,
    <Typography key="3" color="text.primary">
      Breadcrumb
    </Typography>,
  ];

  return (
    <Box>
      <Card>
        <CardHeader
          title={
            <Typography variant={isSmallScreen ? "h5" : "h4"} gutterBottom>
              Dashboard
              <Breadcrumbs
                separator={<NavigateNext fontSize="small" />}
                aria-label="breadcrumb"
              >
                {breadcrumbs}
              </Breadcrumbs>
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
