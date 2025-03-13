"use client";
import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  CircularProgress,
  Box,
  Card,
  CardContent,
  Button,
  CardHeader,
  Container,
  Paper,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  Grid,
  TextField,
  FormControl,
} from "@mui/material";
import Link from "next/link";
import { LoadingButton } from "@mui/lab";
import { Add, Delete } from "@mui/icons-material";
import { time } from "console";
import { title } from "process";
import CreateUserDialog from "./CreateUserDialog";

const AdminPageContent: React.FC = () => {
  const theme = useTheme();
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [users, setUsers] = useState<
    {
      id: string;
      name: string;
      email: string;
      role: string;
      companies?: string[];
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reqLoading, setReqLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users?needCompanies=true");
        const data = await response.json();
        data.users.forEach((user: any) => {
          user.id = user._id;
        });
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "companies",
      headerName: "Companies",
      flex: 4,
      renderCell: (params) => {
        return (
          <Typography overflow={"auto"}>
            {params.value?.map((company: any) => {
              return (
                <Link
                  href={`/user/mycompanies/${company._id}?companyPageSelect=details`}
                  key={company._id}
                >
                  <Button
                    color="primary"
                    variant="text"
                    size="small"
                    sx={{ mx: 1 }}
                  >
                    {company.name}
                  </Button>
                </Link>
              );
            })}
          </Typography>
        );
      },
    },
    {
      field: "delete",
      headerName: "Delete",
      flex: 1,
      renderCell: (params) => {
        if (params.row?.role !== "admin") {
          return (
            <div>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  setUserId(params.row.id);
                  setDeleteDialogOpen(true);
                }}
                disabled={loading || reqLoading}
              >
                Delete
              </Button>
            </div>
          );
        }
        return null;
      },
    },
  ];

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  interface ConfirmationDialogProps {
    open: boolean;
    onClose: (confirmed: boolean) => void;
    title: string;
    message: string;
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [userId, setUserId] = useState<string>("");

  const deleteUser = async (user: { name: string; id: string }) => {
    try {
      setReqLoading(true);
      const response = await fetch(`api/users?userId=${user.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSnackbarMessage(`${user.name} deleted successfully`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        //wait for 2 seconds and reload the page
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setSnackbarMessage(`Failed to delete ${user.name}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error(error);
      setSnackbarMessage(`Failed to delete ${user.name}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setReqLoading(false);
    }
  };

  const onDeleteClick = async (id: string) => {
    // Perform the delete action here
    if (id !== null) {
      //find user
      const user = users.find((user) => user.id === id);
      if (user) {
        //if admin
        if (user.role === "admin") {
          setSnackbarMessage(`Cannot delete admin user ID: ${id}`);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
        //check if user has companies
        if (user.companies && user.companies.length > 0) {
          setSnackbarMessage(
            `Cannot delete ${user.name} with companies assigned.`
          );
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
        //delete user
        await deleteUser(user);
      } else {
        setSnackbarMessage(`User ID: ${id} not found`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  const handleDeleteDialogClose = async (confirmed: boolean) => {
    if (confirmed) {
      // Perform the delete action here
      await onDeleteClick(userId);
    }
    setDeleteDialogOpen(false);
  };

  const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onClose,
    title,
    message,
  }) => {
    const handleConfirm = () => {
      onClose(true);
    };

    const handleCancel = () => {
      onClose(false);
    };

    return (
      <Dialog open={open} onClose={() => onClose(false)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <LoadingButton
            onClick={handleConfirm}
            color="error"
            loading={loading || reqLoading}
            startIcon={<Delete />}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  };

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      id: false,
      email: false,
    });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor={theme.palette.background.default}
      >
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  return (
    <Box
      bgcolor={theme.palette.background.default}
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Container maxWidth="lg">
        <Paper
          elevation={4}
          sx={{
            padding: 3,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Card
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 3,
            }}
          >
            <CardHeader
              title={
                <Typography variant="h5" color={theme.palette.text.primary}>
                  User Management
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setCreateDialogOpen(true);
                    }}
                    sx={{
                      marginLeft: {
                        xs: 0,
                        sm: 2,
                      },
                    }}
                    startIcon={<Add />}
                  >
                    Create User
                  </Button>
                </Typography>
              }
            />
            <CardContent>
              <Box sx={{ height: 450, width: "100%" }}>
                <DataGrid
                  rows={users}
                  columns={columns}
                  editMode="row"
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10,
                      },
                    },
                    filter: {
                      filterModel: {
                        items: [],
                        quickFilterExcludeHiddenColumns: false,
                      },
                    },
                  }}
                  pageSizeOptions={[5, 10, 20, 50]}
                  slots={{
                    toolbar: (props) => (
                      <GridToolbar
                        {...props}
                        csvOptions={{ disableToolbarButton: false }}
                        printOptions={{ disableToolbarButton: false }}
                      />
                    ),
                  }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                    },
                  }}
                  disableRowSelectionOnClick
                  disableDensitySelector
                  columnVisibilityModel={columnVisibilityModel}
                  onColumnVisibilityModelChange={(newModel) =>
                    setColumnVisibilityModel(newModel)
                  }
                />
              </Box>
              <Box display="flex" justifyContent="center" mt={4}>
                <Link href="/">
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 2, paddingX: 3 }}
                  >
                    Home
                  </Button>
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        //TransitionComponent={(props) => <Slide {...props} direction="up" />}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this user?`}
      />
      <CreateUserDialog open={createDialogOpen} setOpen={setCreateDialogOpen} />
    </Box>
  );
};

export default AdminPageContent;
