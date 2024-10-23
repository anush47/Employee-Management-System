"use client";
import React, { Suspense, lazy, useEffect, useState } from "react";
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
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
  //fetch query from url
  const searchParams = useSearchParams();
  const add = searchParams.get("add");

  //open the form if gen is true
  useEffect(() => {
    if (add === "true") setIsAdding(true);
  }, [add]);

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
            <AddCompanyForm
              user={user}
              handleBackClick={() => {
                window.history.back();
              }}
            />
          </Card>
        </Slide>
      ) : (
        <Card
          sx={{
            minHeight: "91vh",
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
                  <Link href={`user?userPageSelect=mycompanies&add=true`}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Add />}
                    >
                      Add
                    </Button>
                  </Link>
                </Tooltip>
              </Box>
            }
          />
          <CardContent
            sx={{ maxWidth: { xs: "100vw", md: "calc(100vw - 240px)" } }}
          >
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
