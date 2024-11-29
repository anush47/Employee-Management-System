"use client";
import {
  Button,
  Snackbar,
  Slide,
  Alert,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormHelperText,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { companyId } from "../../clientComponents/companySideBar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { ArrowBack } from "@mui/icons-material";

const ABH: React.FC<{
  user: { id: string; name: string; email: string };
  handleBackClick: () => void;
  employeeId: string | null;
}> = ({ user, handleBackClick, employeeId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formDetails, setFormDetails] = useState({
    companyId: companyId,
    fullName: "Anushanga Sharada Galappaththi",
    nameWithInitials: "A S Galappaththi",
    nic: "200105902475",
    employerNo: "B/50139",
    memberNo: "1",
    startDate: "28-02-2001",
    designation: "driver",
    address: "238/1, Thunandahena, Korathota, Kaduwela.",
    birthPlace: "Balangoda",
    nationality: "Sinhala",
    married: true,
    spouseName: "S N Kumarage",
    motherName: "A P S Manel",
    fatherName: "S L Galappaththi",
    mobileNumber: "0717539478",
    email: "anushangasharada@gmail.com",
  });

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "warning" | "error"
  >("success");

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (companyId) {
      setLoading(true);
      const fetchEmployeeData = async () => {
        try {
          let employeeData = {};
          if (employeeId) {
            const employeeResponse = await fetch(
              `/api/employees/one?employeeId=${employeeId}`
            );
            const employeeResult = await employeeResponse.json();
            employeeData = {
              fullName: employeeResult.employee.name,
              nic: employeeResult.employee.nic,
              memberNo: employeeResult.employee.memberNo,
              designation: employeeResult.employee.designation,
            };
          }

          const companyResponse = await fetch(
            `/api/companies/one?companyId=${companyId}`
          );
          const companyResult = await companyResponse.json();
          setFormDetails((prevDetails) => ({
            ...prevDetails,
            ...employeeData,
            employerNo: companyResult.company.employerNo,
          }));

          setSnackbarMessage("Data fetched successfully");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        } catch (error) {
          console.error("Error fetching data:", error);
          setSnackbarMessage("Error fetching data");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        } finally {
          setLoading(false);
        }
      };

      fetchEmployeeData();
    }
  }, [employeeId, companyId]);

  const handleGenerateABH = async () => {
    try {
      const response = await fetch(`/api/employees/formA`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDetails),
      });
      if (!response.ok) {
        const data = await response.json();
        setSnackbarMessage(data.message || "Error generating ABH");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      //set download name
      const filename = `formA_${formDetails.nic}.pdf`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      setSnackbarMessage("ABH generated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error generating ABH:", error);
      setSnackbarMessage("Error generating ABH");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormDetails((prevDetails) => ({ ...prevDetails, [name]: checked }));
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant={"h5"}>
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
              Employee Details For AH
            </Typography>
          </Box>
        }
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={formDetails.fullName}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Name with Initials"
                  name="nameWithInitials"
                  value={formDetails.nameWithInitials}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="NIC"
                  name="nic"
                  value={formDetails.nic}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Employer Number"
                  name="employerNo"
                  value={formDetails.employerNo}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Member Number"
                  name="memberNo"
                  value={formDetails.memberNo}
                  onChange={handleChange}
                  type="number"
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="en-gb"
                >
                  <DatePicker
                    readOnly={loading}
                    label="Start Date"
                    name="startDate"
                    openTo="year"
                    value={dayjs(formDetails.startDate, "DD-MM-YYYY")}
                    views={["year", "month", "day"]}
                    onChange={(newDate) => {
                      setFormDetails((prevDetails) => ({
                        ...prevDetails,
                        startDate: newDate?.format("DD-MM-YYYY") as string,
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
                  label="Designation"
                  name="designation"
                  value={formDetails.designation}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Address"
                  name="address"
                  value={formDetails.address}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Birth Place"
                  name="birthPlace"
                  value={formDetails.birthPlace}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Nationality"
                  name="nationality"
                  value={formDetails.nationality}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formDetails.married}
                    name="married"
                    onChange={handleCheckboxChange}
                    disabled={loading}
                  />
                }
                label="Married"
              />
            </Grid>
            {formDetails.married && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Spouse Name"
                    name="spouseName"
                    value={formDetails.spouseName}
                    onChange={handleChange}
                    variant="filled"
                    disabled={loading}
                  />
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Mother's Name"
                  name="motherName"
                  value={formDetails.motherName}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Father's Name"
                  name="fatherName"
                  value={formDetails.fatherName}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Mobile Number"
                  name="mobileNumber"
                  value={formDetails.mobileNumber}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Email"
                  name="email"
                  value={formDetails.email}
                  onChange={handleChange}
                  variant="filled"
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateABH}
                disabled={loading}
              >
                Generate ABH
              </Button>
            </Grid>
          </Grid>
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          TransitionComponent={(props) => <Slide {...props} direction="up" />}
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
      </CardContent>
    </Card>
  );
};

export default ABH;
