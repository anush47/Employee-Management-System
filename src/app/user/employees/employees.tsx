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
import { Add, ArrowBack, Cancel, Check, Edit } from "@mui/icons-material";
import EditEmployeeForm from "./clientComponents/EditEmployee";
import { useSearchParams } from "next/navigation";

// Lazily load CompaniesDataGrid
const EmployeesDataGrid = lazy(
  () => import("./clientComponents/employeesDataGrid")
);

export let employeeId: string | null;

const MyCompanies = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEmployeeInHome, setIsEditingEmployeeInHome] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const searchParams = useSearchParams();
  employeeId = searchParams.get("employeeId");

  const handleBackClickEdit = () => {
    setIsEditing(false);

    // Create a new URLSearchParams object from the current query string
    const updatedSearchParams = new URLSearchParams(window.location.search);

    // Remove the employeeId query parameter
    updatedSearchParams.delete("employeeId");

    // Update the URL without reloading the page
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${updatedSearchParams.toString()}`
    );
  };

  useEffect(() => {
    if (employeeId) {
      setIsEditing(true);
      console.log("edit");
    }
  }, [employeeId]);

  return (
    <Box>
      {isEditing ? (
        <Slide direction="left" in={isEditing} mountOnEnter unmountOnExit>
          <Card
            //set height to viewport height and make scrollable only on larger screens
            sx={{
              height: "85vh",
              overflowY: "auto",
              "@media (max-width: 600px)": {
                height: "auto",
              },
            }}
          >
            <EditEmployeeForm
              user={user}
              handleBackClick={handleBackClickEdit}
              employeeId={employeeId}
            />
          </Card>
        </Slide>
      ) : (
        <Card
          //set height to viewport height and make scrollable only on larger screens
          sx={{
            height: "85vh",
            overflowY: "auto",
            "@media (max-width: 600px)": {
              height: "auto",
            },
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
                  Employees
                  {isEditingEmployeeInHome ? (
                    <IconButton
                      sx={{
                        marginLeft: 1,
                      }}
                      color="success"
                      onClick={() => setIsEditingEmployeeInHome(false)}
                    >
                      <Check />
                    </IconButton>
                  ) : (
                    <Tooltip
                      title="
                      Edit employees in home"
                      arrow
                    >
                      <IconButton
                        sx={{
                          marginLeft: 1,
                        }}
                        color="primary"
                        onClick={() => setIsEditingEmployeeInHome(true)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  )}
                </Typography>
              </Box>
            }
          />
          <CardContent>
            <Suspense fallback={<CircularProgress />}>
              <EmployeesDataGrid
                user={user}
                isEditingEmployeeInHome={isEditingEmployeeInHome}
              />
            </Suspense>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MyCompanies;
