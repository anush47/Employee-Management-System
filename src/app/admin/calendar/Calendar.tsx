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
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import Link from "next/link";
import { LoadingButton } from "@mui/lab";
import { Add, Delete } from "@mui/icons-material";
import CreateHolidaysDialog from "./CreateHolidaysDialog";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export const ddmmyyyy_to_mmddyyyy = (ddmmyyyy: string) => {
  //if null return ""
  if (ddmmyyyy === null) {
    return "";
  }
  const [dd, mm, yyyy] = ddmmyyyy.split("-");
  return `${mm}-${dd}-${yyyy}`;
};

const Users = ({
  user,
}: {
  user: { name: string; email: string; role: string; image: string };
}) => {
  const theme = useTheme();
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [holidays, setHolidays] = useState<
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
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          "/api/calendar/holidays?startDate=2010-01-01&endDate=2025-12-31"
        );
        const data = await response.json();
        data.holidays.forEach((holiday: any) => {
          holiday.id = holiday._id;
        });
        setHolidays(data.holidays);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      editable: false,
      valueGetter: (params) => {
        // Ensure the date is formatted correctly for display
        return params;
      },
      renderEditCell: (params) => (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <DatePicker
            label="Date"
            openTo="year"
            views={["year", "month", "day"]}
            value={dayjs(ddmmyyyy_to_mmddyyyy(params.value))}
            onChange={(newDate) => {
              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: newDate ? newDate.format("DD-MM-YYYY") : "",
              });
            }}
            slotProps={{
              field: { clearable: true },
            }}
          />
        </LocalizationProvider>
      ),
    },
    {
      field: "summary",
      headerName: "Summary",
      flex: 1,
    },
    {
      field: "categories",
      headerName: "Categories",
      flex: 2,
      renderCell: (params) => {
        if (!params.value || typeof params.value !== "object") {
          return null;
        }
        return (
          <Box sx={{ display: "flex", overflowX: "auto" }}>
            {Object.keys(params.value).map((category: string) => {
              if (category !== "_id" && params.value[category] === true) {
                return (
                  <Button
                    key={`${params.row.id}-${category}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ my: 0.5, mx: 0.1 }}
                  >
                    {category}
                  </Button>
                );
              }
              return null;
            })}
          </Box>
        );
      },
    },
    // {
    //   field: "delete",
    //   headerName: "Delete",
    //   flex: 1,
    //   renderCell: (params) => {
    //     if (params.row?.role !== "admin") {
    //       return (
    //         <div>
    //           <Button
    //             variant="outlined"
    //             color="error"
    //             size="small"
    //             onClick={() => {
    //               setUserId(params.row.id);
    //               setDeleteDialogOpen(true);
    //             }}
    //             disabled={loading || reqLoading}
    //           >
    //             Delete
    //           </Button>
    //         </div>
    //       );
    //     }
    //     return null;
    //   },
    // },
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
      const user = holidays.find((user) => user.id === id);
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
    });

  if (loading) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen">
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Card
        sx={{
          minHeight: "91vh",
          overflowY: "auto",
        }}
      >
        <CardHeader
          title={
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" color={theme.palette.text.primary}>
                Holidays
              </Typography>
              {/* <Button
                variant="outlined"
                color="primary"
                onClick={() => setCreateDialogOpen(true)}
                startIcon={<Add />}
              >
                New
              </Button> */}
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ height: 450, width: "100%" }}>
            <DataGrid
              rows={holidays}
              columns={columns}
              editMode="row"
              initialState={{
                pagination: { paginationModel: { pageSize: 20 } },
                filter: {
                  filterModel: {
                    items: [],
                    quickFilterExcludeHiddenColumns: false,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 20, 50]}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              disableRowSelectionOnClick
              disableDensitySelector
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) =>
                setColumnVisibilityModel(newModel)
              }
            />
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
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
        message="Are you sure you want to delete this user?"
      />
      <CreateHolidaysDialog
        open={createDialogOpen}
        setOpen={setCreateDialogOpen}
      />
    </Box>
  );
};

export default Users;
