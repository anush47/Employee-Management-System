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
import AddEmployeeForm from "./clientComponents/AddEmployee";
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
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEmployeeInHome, setIsEditingEmployeeInHome] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const searchParams = useSearchParams();
  employeeId = searchParams.get("employeeId");

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleBackClick = () => {
    setIsAdding(false);
  };

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
      setIsAdding(false);
      setIsEditing(true);
    }
  }, [employeeId]);

  return (
    <Box>
      {isAdding ? (
        <Slide direction="left" in={isAdding} mountOnEnter unmountOnExit>
          <Card>
            <AddEmployeeForm user={user} handleBackClick={handleBackClick} />
          </Card>
        </Slide>
      ) : isEditing ? (
        <Slide direction="left" in={isEditing} mountOnEnter unmountOnExit>
          <Card>
            <EditEmployeeForm
              user={user}
              handleBackClick={handleBackClickEdit}
              employeeId={employeeId}
            />
          </Card>
        </Slide>
      ) : (
        <Card>
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
                <Tooltip title="Add a new employee" arrow>
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
