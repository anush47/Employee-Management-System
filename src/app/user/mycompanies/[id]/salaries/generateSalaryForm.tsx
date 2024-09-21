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
  FormControl,
  FormHelperText,
  Snackbar,
  Alert,
  Slide,
  InputAdornment,
  Select,
  InputLabel,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { ArrowBack, Cancel, Save, Search } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import dayjs from "dayjs";
import { companyId } from "../clientComponents/companySideBar";
import GenerateSalaryAll from "./generateSalaryAll";
import GenerateSalaryOne from "./generateSalaryOne";

const SlideTransition = (props: any) => <Slide {...props} direction="up" />;
export interface Salary {
  employee: string;
  period: string;
  basic: string;
  nopay: {
    amount: string;
    reason: string;
  };
  ot: {
    amount: string;
    reason: string;
  };
  paymentStructure: {
    additions: {
      name: string;
      amount: string;
    }[];
    deductions: {
      name: string;
      amount: string;
    }[];
  };
  advanceAmount: string;
  finalSalary: string;
}

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

  //salary interface

  const [generatedSalaries, setGeneratedSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [employees, setEmployees] = useState<
    {
      _id: string;
      memberNo: string;
      name: string;
      nic: string;
    }[]
  >([]);
  const [employeeSelection, setEmployeeSelection] = useState<string>("all");
  const [period, setPeriod] = useState<string>(dayjs().format("YYYY-MM"));
  const [nameLoading, setNameLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [errors, setErrors] = useState<{
    employee?: string;
    basic?: string;
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

  // Fetch employees from the API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/employees/many?companyId=${companyId}`,
          {
            method: "GET",
          }
        );
        const result = await response.json();

        setEmployees([
          ...result.employees.map(
            (employee: {
              _id: string;
              memberNo: string;
              name: string;
              nic: string;
            }) => ({
              _id: employee._id,
              memberNo: employee.memberNo,
              name: employee.name,
              nic: employee.nic,
            })
          ),
          { memberNo: "all", _id: "all", name: "ALL", nic: "all" }, // add all option
        ]);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

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
              <>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<Save />}
                  onClick={onSaveClick}
                  disabled={loading} // Disable button while loading
                >
                  {loading ? <CircularProgress size={24} /> : "Save"}
                </Button>
              </>
            </Tooltip>
          </Box>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.employee}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) =>
                  option._id === "all"
                    ? `${option.name}`
                    : `${option.memberNo} ${option.name}  ${option.nic}`
                } // Display the employee name as the label
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormFields((prevFields) => ({
                      ...prevFields,
                      employeeNo: newValue._id, // Store the selected employee ID
                      employeeName: newValue.name, // Update the employee name in the form
                    }));
                    setEmployeeSelection(newValue._id);
                  }
                }}
                value={
                  employees.find(
                    (employee) => employee._id === employeeSelection
                  ) || null
                } // Select the current employee or set to null
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Employee"
                    variant="filled"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {/* all button */}
                          <Button
                            variant="text"
                            color="primary"
                            onClick={() => setEmployeeSelection("all")}
                            sx={{
                              ml: 1,
                            }}
                          >
                            All
                          </Button>
                          {loading ? <CircularProgress size={20} /> : null}
                        </>
                      ),
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                } // Ensure correct selection by comparing IDs
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                label="Period"
                name="period"
                type="month"
                variant="filled"
                fullWidth
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            {employeeSelection === "all" ? (
              <GenerateSalaryAll period={period} />
            ) : (
              <GenerateSalaryOne
                employeeId={employeeSelection}
                period={period}
              />
            )}
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
