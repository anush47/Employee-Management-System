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
  Dialog,
  DialogContent,
} from "@mui/material";
import { Add, Check, Edit } from "@mui/icons-material";

// Lazily load SalariesDataGrid and AddSalaryForm
const SalariesDataGrid = lazy(() => import("./salariesDataGrid"));
const AddSalaryForm = lazy(() => import("./generateSalaryForm"));

const Salaries = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
        {showAddForm ? (
          <Slide direction="left" in={showAddForm} mountOnEnter unmountOnExit>
            <div>
              <AddSalaryForm
                user={user}
                handleBackClick={() => setShowAddForm(false)}
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
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => setShowAddForm(true)}
                  >
                    Generate Salary
                  </Button>
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
