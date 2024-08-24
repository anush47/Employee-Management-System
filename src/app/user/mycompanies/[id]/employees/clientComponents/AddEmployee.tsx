"use client";
import React, { useEffect, useState } from "react";
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
import { ArrowBack, Cancel, Save, Search } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Employee } from "./employeesDataGrid";
import { LoadingButton } from "@mui/lab";
import "dayjs/locale/en-gb";
import { PaymentStructure } from "../../companyDetails/paymentStructure";
import { companyId } from "../../clientComponents/companySideBar";
import { Company } from "../../../clientComponents/companiesDataGrid";
//import { Company } from "./companiesDataGrid";
//import { CompanyValidation } from "./companyValidation";

const SlideTransition = (props: any) => <Slide {...props} direction="up" />;

const AddEmployeeForm: React.FC<{
  user: { id: string; name: string; email: string };
  handleBackClick: () => void;
}> = ({ user, handleBackClick }) => {
  const [formFields, setFormFields] = useState<Employee>({
    id: "",
    name: "",
    memberNo: 0,
    nic: "",
    basic: 16000,
    designation: "",
    startedAt: "",
    resignedAt: "",
    paymentStructure: {
      additions: [],
      deductions: [],
    },
    company: companyId || "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [memberNoLoading, setNameLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [errors, setErrors] = useState<{
    name?: string;
    memberNo?: string;
    basic?: string;
    nic?: string;
    designation?: string;
    startedAt?: string;
  }>({});
  const [company, setCompany] = useState<Company | null>(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
        setCompany(data.company);
        // Set default payment structure to payments from company
        setFormFields((prev) => ({
          ...prev,
          paymentStructure:
            data.company.paymentStructure &&
            data.company.paymentStructure.additions.length > 0 &&
            data.company.paymentStructure.deductions.length > 0
              ? data.company.paymentStructure
              : {
                  additions: [
                    { name: "incentive", amount: "" },
                    { name: "performance allowance", amount: "" },
                  ],
                  deductions: [],
                },
        }));
      } catch (error) {
        setSnackbarMessage(
          error instanceof Error ? error.message : "Error fetching company."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    if (companyId?.length === 24) {
      fetchCompany();
    } else {
      setSnackbarMessage("Invalid Company ID");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [companyId, user]);

  // Unified handle change for all fields
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let { name, value } = event.target;
    //capitalize for name,nic
    if (name === "name" || name === "nic") {
      value = value.toUpperCase();
    }
    setFormFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const onSaveClick = async () => {
    if (!true) {
      // Placeholder for validation logic
      return;
    }

    setLoading(true);
    try {
      // Perform POST request to add a new employee
      const response = await fetch("/api/employees/new", {
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
        setSnackbarMessage("Employee saved successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        // Wait for 2 seconds before clearing the form
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Clear the form after successful save
        setFormFields({
          id: "",
          name: "",
          memberNo: 0,
          basic: 16000,
          designation: "",
          nic: "",
          startedAt: "",
          resignedAt: "",
          paymentStructure: {
            additions: [],
            deductions: [],
          },
          company: companyId,
        });
        setErrors({});
        handleBackClick();
      } else {
        // Handle validation or other errors returned by the API
        setSnackbarMessage(
          result.message || "Error saving employee. Please try again."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error saving employee:", error);

      setSnackbarMessage("Error saving employee. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onFetchMemberNoClick = async () => {
    setNameLoading(true);
    try {
      setLoading(true);
      const response = await fetch(
        `/api/employees/many?companyId=${companyId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      const employees = data.employees;

      //sort employees from memberno and get last memberno
      employees.sort((a: Employee, b: Employee) => a.memberNo - b.memberNo);
      const lastEmployee = employees[employees.length - 1];
      const newMemberNo = lastEmployee ? lastEmployee.memberNo + 1 : 1;

      setFormFields((prevFields) => ({ ...prevFields, memberNo: newMemberNo }));

      // Show success snackbar with the fetched name
      setSnackbarMessage(`New Member No.: ${newMemberNo}`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error fetching Member No:", error);

      setSnackbarMessage("Error fetching Member No. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setNameLoading(false);
      setLoading(false);
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
              <Tooltip title="Discard and go back to my companies" arrow>
                <IconButton
                  sx={{
                    mr: 2,
                  }}
                  onClick={handleBackClick}
                >
                  <ArrowBack />
                </IconButton>
              </Tooltip>
              Add Employee
              <Tooltip title="Save new company" arrow>
                <span>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<Save />}
                    sx={{
                      ml: 2,
                    }}
                    onClick={onSaveClick}
                    disabled={loading} // Disable button while loading
                  >
                    {loading ? <CircularProgress size={24} /> : "Save"}
                  </Button>
                </span>
              </Tooltip>
            </Typography>
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
            <FormControl fullWidth error={!!errors.memberNo}>
              <TextField
                label="Member Number"
                name="memberNo"
                type="number"
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
              {errors.memberNo && (
                <FormHelperText>{errors.memberNo}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.nic}>
              <TextField
                label="NIC"
                name="nic"
                value={formFields.nic}
                onChange={handleChange}
                variant="filled"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.basic}>
              <TextField
                label="Basic"
                name="basic"
                type="number"
                value={formFields.basic}
                onChange={handleChange}
                variant="filled"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.designation}>
              <TextField
                label="Designation"
                name="designation"
                value={formFields.designation}
                onChange={handleChange}
                variant="filled"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.startedAt}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="en-gb"
              >
                <DatePicker
                  label="Started At"
                  name="startedAt"
                  openTo="year"
                  views={["year", "month", "day"]}
                  onChange={(newDate) => {
                    setFormFields((prevFields) => ({
                      ...prevFields,
                      startedAt: newDate?.format("DD-MM-YYYY") as string | Date,
                    }));
                  }}
                  slotProps={{
                    field: { clearable: true },
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </Grid>
        </Grid>
        <Grid mt={3} item xs={12}>
          <PaymentStructure
            isEditing={true}
            handleChange={handleChange}
            paymentStructure={formFields.paymentStructure}
            setPaymentStructure={(paymentStructure) => {
              //console.log("Setting payment structure:", paymentStructure); // Debugging
              setFormFields((prev) => ({
                ...prev,
                paymentStructure,
              }));
            }}
          />
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
