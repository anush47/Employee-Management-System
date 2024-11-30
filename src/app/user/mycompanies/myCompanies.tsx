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
  ToggleButton,
  Switch,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import AddCompanyForm from "./clientComponents/AddCompany";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const CompaniesCards = lazy(() => import("./clientComponents/companiesCards"));

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
  const [advanced, setAdvanced] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  //fetch query from url
  const searchParams = useSearchParams();
  const add = searchParams ? searchParams.get("add") : null;
  //open the form if gen is true
  useEffect(() => {
    if (add === "true") setIsAdding(true);
  }, [add]);

  return (
    <Box>
      {isAdding ? (
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
      ) : (
        <Card
          sx={{
            minHeight: "91vh",
            overflowY: "auto",
          }}
        >
          <CardHeader
            sx={{
              background: (theme) => theme.palette.background.default,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              "& .MuiCardHeader-content": { width: "100%" },
            }}
            title={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 2, sm: 3 },
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography
                    variant={isSmallScreen ? "h5" : "h4"}
                    sx={{
                      fontWeight: 600,
                      background: (theme) =>
                        `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    My Companies
                  </Typography>
                  <Tooltip title="Add a new company" arrow>
                    <Link href={`user?userPageSelect=mycompanies&add=true`}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          boxShadow: 2,
                          "&:hover": {
                            transform: "translateY(-2px)",
                            transition: "transform 0.2s",
                          },
                        }}
                      >
                        Add Company
                      </Button>
                    </Link>
                  </Tooltip>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: (theme) => theme.palette.background.paper,
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    boxShadow: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      mr: 1,
                      fontWeight: 500,
                      color: "text.secondary",
                    }}
                  >
                    Advanced View
                  </Typography>
                  <Switch
                    checked={advanced}
                    onChange={() => setAdvanced(!advanced)}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Box>
            }
          />
          <CardContent
            sx={{ maxWidth: { xs: "100vw", md: "calc(100vw - 240px)" } }}
          >
            <Suspense fallback={<CircularProgress />}>
              {advanced ? (
                <CompaniesDataGrid user={user} />
              ) : (
                <CompaniesCards user={user} />
              )}
            </Suspense>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MyCompanies;
