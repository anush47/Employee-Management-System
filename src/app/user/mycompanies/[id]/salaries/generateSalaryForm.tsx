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
import {
  ArrowBack,
  Cancel,
  Save,
  Search,
  ShoppingBag,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/en-gb";
import { companyId } from "../clientComponents/companySideBar";
import GenerateSalaryAll from "./generateSalaryAll";
import GenerateSalaryOne from "./generateSalaryOne";
import Link from "next/link";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

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
  const [purchased, setPurchased] = useState<boolean>(true);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  useEffect(() => {
    const checkPurchased = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/purchases/check?companyId=${companyId}&month=${period}`,
          {
            method: "GET",
          }
        );
        try {
          const result = await response.json();
          setPurchased(result?.purchased === "approved");
        } catch (error) {
          console.error("Error parsing JSON or updating state:", error);
          setPurchased(false); // or handle the error state as needed
        }
      } catch (error) {
        console.error("Error fetching salaries:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPurchased();
  }, [period]);

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
                    : `${option.memberNo} - ${option.name} - ${option.nic}`
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
              <Box
                display={purchased ? "grid" : "flex"}
                alignItems="center"
                gap={2}
              >
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="en-gb"
                >
                  <DatePicker
                    label={"Period"}
                    views={["month", "year"]}
                    value={period ? dayjs(period) : dayjs()}
                    onChange={(newValue) => {
                      setPeriod(dayjs(newValue).format("YYYY-MM"));
                    }}
                  />
                  {!purchased && (
                    <Link
                      href={`/user/mycompanies/${companyId}?companyPageSelect=purchases&newPurchase=true&periods=${
                        period.split("-")[1]
                      }-${period.split("-")[0]}`}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<ShoppingBag />}
                      >
                        Purchase
                      </Button>
                    </Link>
                  )}
                </LocalizationProvider>
              </Box>
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
