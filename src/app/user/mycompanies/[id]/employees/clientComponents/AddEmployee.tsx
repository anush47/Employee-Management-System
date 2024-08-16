"use client";
import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  TextField,
  Grid,
  Tooltip,
  Button,
  IconButton,
  Typography,
  CardHeader,
  CardContent,
  useMediaQuery,
  useTheme,
  InputAdornment,
  FormControl,
  FormHelperText,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import { Cancel, Save, Search } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
//import { Company } from "./companiesDataGrid";
//import { CompanyValidation } from "./companyValidation";

const SlideTransition = (props: any) => <Slide {...props} direction="up" />;

const AddEmployeeForm: React.FC<{
  user: { id: string; name: string; email: string };
  handleBackClick: () => void;
}> = ({ user, handleBackClick }) => {
  interface Employee {
    designation: unknown;
    id: string;
    name: string;
    memberNo: string;
    address: string;
    paymentMethod: string;
  }

  const [formFields, setFormFields] = useState<Employee>({
    id: "",
    name: "",
    memberNo: "",
    nic: "",
    address: "",
    paymentMethod: "",
    designation: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [memberNoLoading, setNameLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [errors, setErrors] = useState<{ name?: string; employerNo?: string }>(
    {}
  );

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Unified handle change for all fields
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const onSaveClick = async () => {
    //const newErrors = CompanyValidation(formFields);
    //setErrors(newErrors);
    //const isValid = Object.keys(newErrors).length === 0;

    if (!true) {
      return;
    }

    setLoading(true);
    try {
      // Perform POST request to add a new company
      const response = await fetch("/api/companies/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formFields,
          userId: user.id, // Include user ID
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSnackbarMessage("Company saved successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        //wait
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Clear the form after successful save
        setFormFields({
          id: "",
          name: "",
          memberNo: "",
          address: "",
          paymentMethod: "",
          designation: "",
        });
        setErrors({});
        handleBackClick();
      } else {
        // Handle validation or other errors returned by the API
        setSnackbarMessage(
          result.message || "Error saving company. Please try again."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error saving company:", error);

      setSnackbarMessage("Error saving company. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onFetchMemberNoClick = async () => {
    setNameLoading(true);
    try {
      // Simulate fetching company name
      //const name = await fetchCompanyName(formFields.employerNo);
      const name = "Fetched name";
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setFormFields((prevFields) => ({ ...prevFields, name }));

      // Show success snackbar with the fetched name
      setSnackbarMessage(`Name found: ${name}`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error fetching company name:", error);

      setSnackbarMessage("Error fetching company name. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setNameLoading(false);
    }
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

  return (
    <>
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant={isSmallScreen ? "h5" : "h4"}>
              Add Employee
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Discard and go back to my companies" arrow>
                <IconButton color="error" onClick={handleBackClick}>
                  <Cancel />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save new company" arrow>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<Save />}
                  onClick={onSaveClick}
                  disabled={loading} // Disable button while loading
                >
                  {loading ? <CircularProgress size={24} /> : "Save"}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.name}>
              <TextField
                label="Name"
                name="name"
                value={formFields.name}
                onChange={handleChange}
                variant="filled"
              />
              {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.employerNo}>
              <TextField
                label="Member Number"
                placeholder="A/12345"
                name="memberNo"
                value={formFields.memberNo}
                onChange={handleChange}
                variant="filled"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <LoadingButton
                        variant="text"
                        color="inherit"
                        endIcon={<Search />}
                        loading={memberNoLoading}
                        loadingPosition="end"
                        onClick={onFetchMemberNoClick}
                        disabled={memberNoLoading} // Disable button while loading
                        sx={{ marginTop: 1 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              {errors.employerNo && (
                <FormHelperText>{errors.employerNo}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.name}>
              <TextField
                label="Designation"
                name="designation"
                value={formFields.designation}
                onChange={handleChange}
                variant="filled"
              />
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
              />
            </FormControl>
            <FormHelperText>
              Bank name, branch EPF/ETF is paid. you may use "Cash" as well
            </FormHelperText>
          </Grid>
        </Grid>
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
    </>
  );
};

export default AddEmployeeForm;
