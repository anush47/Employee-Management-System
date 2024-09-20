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
  FormControl,
  FormHelperText,
  Snackbar,
  Alert,
  Slide,
  InputAdornment,
} from "@mui/material";
import { ArrowBack, Cancel, Save, Search } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import dayjs from "dayjs";

const SlideTransition = (props: any) => <Slide {...props} direction="up" />;

const AddSalaryForm: React.FC<{
  user: { id: string; name: string; email: string };
  handleBackClick: () => void;
}> = ({ user, handleBackClick }) => {
  const [formFields, setFormFields] = useState({
    id: "",
    employeeNo: "",
    employeeName: "",
    basicSalary: "",
    additions: [] as string[],
    deductions: [] as string[],
    netSalary: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [nameLoading, setNameLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [errors, setErrors] = useState<{
    employeeNo?: string;
    basicSalary?: string;
  }>({});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Unified handle change for all fields
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | any>
  ) => {
    let { name, value } = event.target;
    setFormFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const onSaveClick = async () => {
    //const newErrors = SalaryValidation(formFields);
    //setErrors(newErrors);
    //const isValid = Object.keys(newErrors).length === 0;

    // if (!isValid) {
    //   return;
    // }

    setLoading(true);
    try {
      // Perform POST request to add a new salary record
      const response = await fetch("/api/salary/new", {
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
        setSnackbarMessage("Salary record saved successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        // Wait before clearing the form
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Clear the form after successful save
        setFormFields({
          id: "",
          employeeNo: "",
          employeeName: "",
          basicSalary: "",
          additions: [],
          deductions: [],
          netSalary: "",
        });
        setErrors({});
        handleBackClick();
      } else {
        // Handle validation or other errors returned by the API
        setSnackbarMessage(
          result.message || "Error saving salary. Please try again."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error saving salary:", error);

      setSnackbarMessage("Error saving salary. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onFetchEmployeeClick = async () => {
    setNameLoading(true);
    try {
      // Simulate fetching employee name by employee number
      const response = await fetch("/api/employees/getName", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeNo: formFields.employeeNo,
        }),
      });
      const result = await response.json();

      const name = result.employeeName;
      if (!name) {
        setSnackbarMessage("Employee not found. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      setFormFields((prevFields) => ({
        ...prevFields,
        employeeName: name.toUpperCase(),
      }));

      // Show success snackbar with the fetched employee name
      setSnackbarMessage(`Employee found: ${name}`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error fetching employee name:", error);

      setSnackbarMessage("Error fetching employee name. Please try again.");
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
              gap: 2,
              mb: 2,
            }}
          >
            <Typography variant={isSmallScreen ? "h5" : "h4"}>
              <Tooltip title="Discard and go back" arrow>
                <IconButton
                  sx={{
                    mr: 2,
                  }}
                  onClick={handleBackClick}
                >
                  <ArrowBack />
                </IconButton>
              </Tooltip>
              Generate Salary
            </Typography>
            <Tooltip title="Save new salary record" arrow>
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
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.employeeNo}>
              <TextField
                label="Employee Number"
                name="employeeNo"
                value={formFields.employeeNo}
                onChange={handleChange}
                variant="filled"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <LoadingButton
                        variant="text"
                        color="inherit"
                        endIcon={<Search />}
                        loading={nameLoading}
                        loadingPosition="end"
                        onClick={onFetchEmployeeClick}
                        disabled={nameLoading} // Disable button while loading
                        sx={{ marginTop: 1 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              {errors.employeeNo && (
                <FormHelperText>{errors.employeeNo}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Employee Name"
              name="employeeName"
              value={formFields.employeeName}
              onChange={handleChange}
              variant="filled"
              disabled
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.basicSalary}>
              <TextField
                label="Basic Salary"
                name="basicSalary"
                value={formFields.basicSalary}
                onChange={handleChange}
                variant="filled"
              />
              {errors.basicSalary && (
                <FormHelperText>{errors.basicSalary}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Net Salary"
              name="netSalary"
              value={formFields.netSalary}
              onChange={handleChange}
              variant="filled"
              fullWidth
            />
          </Grid>

          {/* Additional fields for additions and deductions */}
          <Grid item xs={12}>
            <TextField
              label="Additions"
              name="additions"
              value={formFields.additions.join(", ")}
              onChange={(e) =>
                setFormFields((prevFields) => ({
                  ...prevFields,
                  additions: e.target.value.split(",").map((a) => a.trim()),
                }))
              }
              variant="filled"
              fullWidth
              helperText="Separate additions with commas"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Deductions"
              name="deductions"
              value={formFields.deductions.join(", ")}
              onChange={(e) =>
                setFormFields((prevFields) => ({
                  ...prevFields,
                  deductions: e.target.value.split(",").map((d) => d.trim()),
                }))
              }
              variant="filled"
              fullWidth
              helperText="Separate deductions with commas"
            />
          </Grid>
        </Grid>
      </CardContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddSalaryForm;
