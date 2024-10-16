"use client";
import React, { Suspense, lazy, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tooltip,
  Button,
  Box,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery,
  Slide,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import AddCompanyForm from "./clientComponents/AddCompany";

// Lazily load CompaniesDataGrid
const CompaniesDataGrid = lazy(
  () => import("./clientComponents/companiesDataGrid")
);

const MyCompanies = ({
  user,
}: {
  user: { name: string; email: string; id: string; role: string };
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleBackClick = () => {
    setIsAdding(false);
  };

  return (
    <Box>
      {isAdding ? (
        <Slide direction="left" in={isAdding} mountOnEnter unmountOnExit>
          <Card
            sx={{
              height: "91vh",
              overflowY: "auto",
            }}
          >
            <AddCompanyForm user={user} handleBackClick={handleBackClick} />
          </Card>
        </Slide>
      ) : (
        <Card
          sx={{
            height: "91vh",
            overflowY: "auto",
          }}
        >
          <CardHeader
            title={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Typography variant={isSmallScreen ? "h5" : "h4"} gutterBottom>
                  My Companies
                </Typography>
                <Tooltip title="Add a new company" arrow>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddClick}
                  >
                    Add
                  </Button>
                </Tooltip>
              </Box>
            }
          />
          <CardContent>
            <Suspense fallback={<CircularProgress />}>
              <CompaniesDataGrid user={user} />
            </Suspense>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MyCompanies;
