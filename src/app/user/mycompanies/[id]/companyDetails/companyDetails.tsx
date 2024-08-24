"use client";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  Snackbar,
  TextField,
  Typography,
  Tooltip,
  Slide,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Save, Cancel, Edit, Delete } from "@mui/icons-material";
import { Company } from "../../clientComponents/companiesDataGrid";
import { companyId } from "../clientComponents/companySideBar";
import { CompanyValidation } from "../../clientComponents/companyValidation";
import { PaymentStructure } from "./paymentStructure";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ddmmyyyy_to_mmddyyyy } from "../employees/clientComponents/employeesDataGrid";
import dayjs from "dayjs";
const SlideTransition = (props: any) => <Slide {...props} direction="up" />;

const CompanyDetails = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company>();
  const [formFields, setFormFields] = useState<Company>({
    id: "",
    name: "",
    employerNo: "",
    address: "",
    paymentMethod: "",
    startedAt: "",
    endedAt: "",
    paymentStructure: {
      additions: [
        { name: "Incentive", amount: "" },
        { name: "Performance Allowance", amount: "" },
      ],
      deductions: [],
    },
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [errors, setErrors] = useState<{ name?: string; employerNo?: string }>(
    {}
  );

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/companies/one?companyId=${companyId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch company");
        }
        const data = await response.json();
        const companyWithId = { ...data.company, id: data.company._id };
        setCompany(companyWithId);
        setFormFields(companyWithId);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (companyId?.length === 24) {
      fetchCompany();
    } else {
      setError("Invalid ID");
    }
  }, [companyId, user]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormFields(
      company || {
        id: "",
        name: "",
        employerNo: "",
        address: "",
        paymentMethod: "",
        startedAt: "",
        endedAt: "",
        paymentStructure: {
          additions: [
            { name: "Incentive", amount: "" },
            { name: "Performance Allowance", amount: "" },
          ],
          deductions: [],
        },
      }
    );
  };

  const handleSaveClick = async () => {
    const newErrors = CompanyValidation(formFields);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    console.log(formFields);

    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/companies/one`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formFields),
      });

      if (response.ok) {
        setSnackbarMessage("Company updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setIsEditing(false);
        const updatedCompany = await response.json();
        setCompany(updatedCompany);
      } else {
        const result = await response.json();
        setSnackbarMessage(
          result.message || "Error updating company. Please try again."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error updating company:", error);
      setSnackbarMessage("Error updating company. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = async () => {
    try {
      const response = await fetch(`/api/companies/one`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: companyId,
        }),
      });
      if (response.ok) {
        setSnackbarMessage("Company deleted successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setDeleteDialogOpen(false);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        //await
        // Redirect to the companies page
        window.location.href = "/user?userPageSelect=mycompanies";
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      setSnackbarMessage("Error deleting company. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  //delete cancelation
  const handleDeleteCancelation = () => {
    //show snackbar
    setSnackbarMessage("Delete canceled");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
    setDeleteDialogOpen(false);
  };

  const onDeleteClick = async () => {
    setDeleteDialogOpen(true);
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const DeleteDialog = () => {
    return (
      <Dialog
        open={deleteDialogOpen}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={handleDeleteCancelation}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Delete Employee?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to delete this company
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancelation}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirmation}
            color="error"
            endIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
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
              gap: 1,
            }}
          >
            <Typography variant="h4">Company Details</Typography>
            {isEditing && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Cancel" arrow>
                  <IconButton color="error" onClick={handleCancelClick}>
                    <Cancel />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save changes" arrow>
                  <Button
                    variant="text"
                    color="success"
                    startIcon={<Save />}
                    onClick={handleSaveClick}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : "Save"}
                  </Button>
                </Tooltip>
              </Box>
            )}
            {!isEditing && (
              <Tooltip title="Edit" arrow>
                <IconButton color="primary" onClick={handleEditClick}>
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      <CardContent>
        {loading && <CircularProgress />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {
          // Display the company details with form controls if editing
          !loading && !error && company && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.name}>
                  <TextField
                    label="Name"
                    name="name"
                    value={formFields.name}
                    onChange={handleChange}
                    variant="filled"
                    InputProps={{
                      readOnly: !isEditing,
                    }}
                  />
                  {errors.name && (
                    <FormHelperText>{errors.name}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.employerNo}>
                  <TextField
                    label="Employer Number"
                    name="employerNo"
                    value={formFields.employerNo}
                    onChange={handleChange}
                    variant="filled"
                    InputProps={{
                      readOnly: !isEditing,
                    }}
                  />
                  {errors.employerNo && (
                    <FormHelperText>{errors.employerNo}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <TextField
                    label="Company Address"
                    name="address"
                    value={formFields.address}
                    onChange={handleChange}
                    variant="filled"
                    size="small"
                    multiline
                    minRows={2}
                    InputProps={{
                      readOnly: !isEditing,
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <TextField
                    label="Payment Method"
                    name="paymentMethod"
                    value={formFields.paymentMethod}
                    onChange={handleChange}
                    variant="filled"
                    size="small"
                    InputProps={{
                      readOnly: !isEditing,
                    }}
                  />
                </FormControl>
                <FormHelperText>
                  Bank name, branch EPF/ETF is paid. you may use "Cash" as well
                </FormHelperText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="en-gb"
                  >
                    <DatePicker
                      readOnly={!isEditing}
                      label="Started At"
                      name="startedAt"
                      openTo="year"
                      value={
                        formFields.startedAt
                          ? dayjs(
                              ddmmyyyy_to_mmddyyyy(
                                formFields.startedAt as string
                              )
                            )
                          : null
                      }
                      views={["year", "month", "day"]}
                      onChange={(newDate) => {
                        setFormFields((prevFields) => ({
                          ...prevFields,
                          startedAt: newDate?.format("DD-MM-YYYY") as
                            | string
                            | Date,
                        }));
                      }}
                      slotProps={{
                        field: { clearable: true },
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="en-gb"
                  >
                    <DatePicker
                      readOnly={!isEditing}
                      label="Ended At"
                      name="endedAt"
                      openTo="year"
                      value={
                        formFields.endedAt
                          ? dayjs(
                              ddmmyyyy_to_mmddyyyy(formFields.endedAt as string)
                            )
                          : null
                      }
                      views={["year", "month", "day"]}
                      onChange={(newDate) => {
                        setFormFields((prevFields) => ({
                          ...prevFields,
                          endedAt: newDate?.format("DD-MM-YYYY") as
                            | string
                            | Date,
                        }));
                      }}
                      slotProps={{
                        field: { clearable: true },
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <PaymentStructure
                  isEditing={isEditing}
                  handleChange={handleChange}
                  paymentStructure={formFields.paymentStructure}
                  setPaymentStructure={(paymentStructure) => {
                    console.log("Setting payment structure:", paymentStructure); // Debugging
                    setFormFields((prev) => ({
                      ...prev,
                      paymentStructure,
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={onDeleteClick}
                  disabled={!isEditing || loading}
                >
                  Delete Company
                </Button>
                <DeleteDialog />
              </Grid>
            </Grid>
          )
        }
      </CardContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        TransitionComponent={SlideTransition}
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
    </Card>
  );
};

export default CompanyDetails;
