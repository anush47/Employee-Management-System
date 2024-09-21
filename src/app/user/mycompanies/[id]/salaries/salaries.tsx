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
  Dialog,
  DialogContent,
} from "@mui/material";
import { Add, Check, Edit } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { companyId } from "../clientComponents/companySideBar";
import EditSalaryForm from "./editSalaryForm";

// Lazily load SalariesDataGrid and AddSalaryForm
const SalariesDataGrid = lazy(() => import("./salariesDataGrid"));
const AddSalaryForm = lazy(() => import("./generateSalaryForm"));

export let salaryId: string | null;

const Salaries = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  //fetch query from url
  const searchParams = useSearchParams();
  const gen = searchParams.get("gen");
  salaryId = searchParams.get("salaryId");

  //open the form if gen is true
  useEffect(() => {
    if (gen === "true") setShowAddForm(true);
  }, [gen]);

  return (
    <Box>
      <Card
        sx={{
          height: "85vh",
          overflowY: "auto",
          "@media (max-width: 600px)": {
            height: "auto",
          },
        }}
      >
        {salaryId ? (
          <EditSalaryForm
            user={user}
            handleBackClick={() => {
              //go back in browser
              window.history.back();
            }}
          />
        ) : showAddForm ? (
          <Slide direction="left" in={showAddForm} mountOnEnter unmountOnExit>
            <div>
              <AddSalaryForm
                user={user}
                handleBackClick={() => {
                  //go back in browser
                  window.history.back();
                }}
              />
            </div>
          </Slide>
        ) : (
          <>
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
                  <Typography
                    variant={isSmallScreen ? "h5" : "h4"}
                    gutterBottom
                  >
                    Salaries
                    {isEditing ? (
                      <IconButton
                        sx={{
                          marginLeft: 1,
                        }}
                        color="success"
                        onClick={() => setIsEditing(false)}
                      >
                        <Check />
                      </IconButton>
                    ) : (
                      <Tooltip title="Edit salaries" arrow>
                        <IconButton
                          sx={{
                            marginLeft: 1,
                          }}
                          color="primary"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Typography>

                  {/* Add Button to open the form */}
                  <Link
                    href={`http://localhost:3000/user/mycompanies/${companyId}?companyPageSelect=salaries&gen=true`}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Add />}
                    >
                      Generate Salary
                    </Button>
                  </Link>
                </Box>
              }
            />
            <CardContent>
              <Suspense fallback={<CircularProgress />}>
                <SalariesDataGrid user={user} isEditing={isEditing} />
              </Suspense>
            </CardContent>
          </>
        )}
      </Card>
    </Box>
  );
};

export default Salaries;
