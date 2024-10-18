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
import Link from "next/link";
import { companyId } from "../clientComponents/companySideBar";

// Lazily load CompaniesDataGrid
const EmployeesDataGrid = lazy(
  () => import("./clientComponents/employeesDataGrid")
);

export let employeeId: string | null;

const Employees = ({
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
  const add = searchParams.get("add");

  const handleBackClick = () => {
    //go back
    window.history.back();
  };

  useEffect(() => {
    if (add) {
      setIsAdding(true);
      return;
    }
    if (employeeId) {
      setIsEditing(true);
    }
  }, [employeeId, add]);

  return (
    <Box>
      {isAdding ? (
        <Slide direction="left" in={isAdding} mountOnEnter unmountOnExit>
          <Card
            //set height to viewport height and make scrollable only on larger screens
            sx={{
              height: "91vh",
              overflowY: "auto",
            }}
          >
            <AddEmployeeForm user={user} handleBackClick={handleBackClick} />
          </Card>
        </Slide>
      ) : isEditing ? (
        <Slide direction="left" in={isEditing} mountOnEnter unmountOnExit>
          <Card
            //set height to viewport height and make scrollable only on larger screens
            sx={{
              height: "87vh",
              overflowY: "auto",
            }}
          >
            <EditEmployeeForm
              user={user}
              handleBackClick={handleBackClick}
              employeeId={employeeId}
            />
          </Card>
        </Slide>
      ) : (
        <Card
          //set height to viewport height and make scrollable only on larger screens
          sx={{
            height: "87vh",
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
                  <Link
                    href={`/user/mycompanies/${companyId}?companyPageSelect=employees&add=true`}
                  >
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

export default Employees;
