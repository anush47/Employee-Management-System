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
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { ArrowBack, Cancel, CheckBox, Save, Search } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Employee } from "./employeesDataGrid";
import { LoadingButton } from "@mui/lab";
import "dayjs/locale/en-gb";
import {
  PaymentStructure,
  validateAmountNumberString,
} from "../../companyDetails/paymentStructure";
import { companyId } from "../../clientComponents/companySideBar";
import { Company } from "../../../clientComponents/companiesDataGrid";
import { Shifts } from "../../companyDetails/shifts";
import { WorkingDays } from "../../companyDetails/workingDays";
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
    active: true,
    basic: 21000,
    totalSalary: "",
    remark: "",
    divideBy: 240,
    designation: "",
    otMethod: "random",
    startedAt: "",
    resignedAt: "",
    workingDays: {},
    shifts: [],
    paymentStructure: {
      additions: [],
      deductions: [],
    },
    company: companyId || "",
    phoneNumber: "",
    email: "",
    address: "", // Add this line
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
    remark?: string;
    basic?: string;
    totalSalary?: string;
    nic?: string;
    divideBy?: string;
    designation?: string;
    startedAt?: string;
    resignedAt?: string;
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
          shifts:
            data.company.shifts && data.company.shifts.length > 0
              ? data.company.shifts
              : [{ start: "08:00", end: "17:00" }],
          workingDays: data.company.workingDays
            ? data.company.workingDays
            : {
                mon: "full",
                tue: "full",
                wed: "full",
                thu: "full",
                fri: "full",
                sat: "half",
                sun: "off",
              },
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
      onFetchMemberNoClick();
    } else {
      setSnackbarMessage("Invalid Company ID");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [companyId, user]);

  // Unified handle change for all fields
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    let { name, value } = event.target;
    //capitalize for name,nic
    if (name === "name" || name === "nic") {
      value = value.toUpperCase();
    }
    // handle boolean
    if (name === "active") {
      value = event.target.checked;
    }
    if (name === "totalSalary") {
      // Validate
      console.log(value);
      if (!validateAmountNumberString(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          totalSalary: "Invalid salary format",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          totalSalary: "",
        }));
      }
    }
    console.log(name, value); // Debugging
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
          totalSalary: "",
          designation: "",
          divideBy: 240,
          active: true,
          workingDays: {},
          nic: "",
          remark: "",
          startedAt: "",
          resignedAt: "",
          otMethod: "",
          shifts: [],
          paymentStructure: {
            additions: [],
            deductions: [],
          },
          company: companyId,
          phoneNumber: "",
          email: "",
          address: "", // Add this line
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
      setSnackbarMessage(`New Member No. - ${newMemberNo}`);
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
          <Grid item xs={12}>
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
            <FormControl fullWidth error={!!errors.divideBy}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                label="Category"
                name="divideBy"
                value={formFields.divideBy}
                onChange={handleChange}
                variant="outlined"
              >
                {categories}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.divideBy}>
              <InputLabel id="otMethod-label">OT-Method</InputLabel>
              <Select
                labelId="otMethod-label"
                label="OT Method"
                name="otMethod"
                value={formFields.otMethod}
                onChange={handleChange}
                variant="outlined"
              >
                {otMethods}
              </Select>
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
                      startedAt:
                        newDate !== null
                          ? (newDate?.format("DD-MM-YYYY") as string)
                          : "",
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
            <FormControl fullWidth>
              <TextField
                label="Total Salary"
                name="totalSalary"
                variant="filled"
                value={formFields.totalSalary}
                onChange={handleChange}
                helperText={errors.totalSalary}
                error={!!errors.totalSalary}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">LKR</InputAdornment>
                  ),
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked
                    size="large"
                    name="active"
                    color="success"
                    value={formFields.active}
                    onChange={handleChange}
                  />
                }
                label="Is Active ?"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.remark}>
              <TextField
                label="Remark"
                name="remark"
                value={formFields.remark}
                onChange={handleChange}
                variant="filled"
                multiline
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <TextField
                label="Address"
                name="address"
                variant="filled"
                value={formFields.address}
                onChange={handleChange}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                label="Phone Number"
                name="phoneNumber"
                variant="filled"
                value={formFields.phoneNumber}
                onChange={handleChange}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                label="Email"
                name="email"
                type="email"
                variant="filled"
                value={formFields.email}
                onChange={handleChange}
              />
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
        <div className="my-5" />

        <Grid item xs={12}>
          <WorkingDays
            isEditing={true}
            workingDays={formFields.workingDays}
            setWorkingDays={(workingDays) => {
              setFormFields((prev) => ({
                ...prev,
                workingDays,
              }));
              console.log("Setting working days:", formFields); // Debugging
            }}
          />
        </Grid>
        <div className="my-5" />

        <Grid item xs={12}>
          <Shifts
            isEditing={true}
            handleChange={handleChange}
            shifts={formFields.shifts}
            setShifts={(shifts) => {
              console.log("Setting shifts:", shifts); // Debugging
              setFormFields((prev) => ({
                ...prev,
                shifts,
              }));
            }}
          />
        </Grid>
      </CardContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        //TransitionComponent={SlideTransition}
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

export const categories = [
  { value: 240, label: "240" },
  { value: 200, label: "200" },
].map((category) => (
  <MenuItem key={category.label} value={category.value}>
    {category.label}
  </MenuItem>
));

export const otMethods = [
  { value: "random", label: "Random" },
  { value: "noOt", label: "No OT" },
  { value: "calc", label: "Calculate" },
].map((category) => (
  <MenuItem key={category.label} value={category.value}>
    {category.label}
  </MenuItem>
));

export default AddEmployeeForm;
