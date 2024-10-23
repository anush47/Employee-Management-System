"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Snackbar,
  Slide,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { companyId } from "../clientComponents/companySideBar";
import Link from "next/link";
import {
  AutoAwesome,
  Delete,
  Done,
  Edit,
  ExpandMore,
  ShoppingBag,
  Upload,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import { LoadingButton } from "@mui/lab";
import { handleCsvUpload } from "../salaries/csvUpload";
import { SimpleDialog } from "../salaries/inOutTable";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Company } from "../../clientComponents/companiesDataGrid";
import SalariesDataGrid, { Salary } from "../salaries/salariesDataGrid";
import PaymentsDataGrid, { Payment } from "../payments/paymentsDataGrid";
import GeneratedSalaries from "../salaries/generatedSalaries";
import { Employee } from "../employees/clientComponents/employeesDataGrid";

const Dashboard = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  const [period, setPeriod] = useState<string>(dayjs().format("YYYY-MM"));
  const [purchased, setPurchased] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [editable, setEditable] = useState<boolean>(false);
  const [inOut, setInOut] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [generatedSalaries, setGeneratedSalaries] = useState<Salary[]>([]);
  const [autoGenProgress, setAutoGenProgress] = useState<number>(0);
  const [autoGenStatus, setAutoGenStatus] = useState<string>("");
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

  //fetch company & employees
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(
          `/api/companies/one?companyId=${companyId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const companyData = await response.json();
        if (!companyData.company) {
          throw new Error("Company data not found in the response");
        }
        setCompany(companyData.company);
      } catch (error) {
        console.error("Error fetching company:", error);
        setSnackbarMessage("Failed to fetch company data");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setCompany(null);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          `/api/employees/many?companyId=${companyId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEmployees(
          data.employees.map((employee: { _id: string }) => ({
            ...employee,
            id: employee._id,
          }))
        );
      } catch (error) {
        console.error("Error fetching employees:", error);
        setSnackbarMessage("Failed to fetch employee data");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setEmployees([]);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCompany(), fetchEmployees()]);
      setLoading(false);
    };

    fetchData();
  }, [companyId]);

  //check purchased salaries,payments
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
        const result = await response.json();
        setPurchased(result?.purchased === "approved");
      } catch (error) {
        console.error("Error fetching purchase status:", error);
      } finally {
        setLoading(false);
      }
    };

    //clear generated salaries and payments
    checkPurchased();
    setGeneratedSalaries([]);
  }, [period]);

  const handleSalaries = async (save: boolean = false) => {
    setLoading(true);
    try {
      if (
        save &&
        generatedSalaries.length > 0 &&
        generatedSalaries[0].period === period
      ) {
        // If saving and salaries are already generated for this period, proceed to save
        await saveSalaries(generatedSalaries);
      } else {
        // Generate new salaries
        const response = await fetch(`/api/salaries/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, period, inOut }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || `HTTP error! status: ${response.status}`
          );
        }

        if (data.salaries.length === 0) {
          setSnackbarMessage(data.message || "No salaries to generate");
          setSnackbarSeverity("warning");
        } else {
          const formattedSalaries = data.salaries.map((salary: Salary) => ({
            ...salary,
            id: salary._id,
            memberNo: employees.find((e) => e.id === salary.employee)?.memberNo,
            name: employees.find((e) => e.id === salary.employee)?.name,
            nic: employees.find((e) => e.id === salary.employee)?.nic,
          }));

          if (save) {
            await saveSalaries(formattedSalaries);
          } else {
            setGeneratedSalaries(formattedSalaries);
            setSnackbarMessage(
              data.message || "Salaries generated successfully"
            );
            setSnackbarSeverity("success");
          }
        }
      }
    } catch (error) {
      console.error("Error handling salaries:", error);
      setSnackbarMessage(
        error instanceof Error
          ? error.message
          : "An error occurred while handling salaries"
      );
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const saveSalaries = async (salariesToSave: Salary[]) => {
    const response = await fetch("/api/salaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salaries: salariesToSave }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to save salaries");
    setSnackbarMessage(data.message || "Salaries saved successfully");
    setSnackbarSeverity("success");
    setGeneratedSalaries([]);
  };

  const handleDeleteSalaries = () => {
    setGeneratedSalaries([]);
    setSnackbarMessage("Salaries deleted successfully");
    setSnackbarSeverity("warning");
    setSnackbarOpen(true);
  };

  const handlePayments = async () => {
    //get reference number from api call
    const fetchReferenceNo = async () => {
      //fetch epf reference no
      try {
        const response = await fetch("/api/companies/getReferenceNoName", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employerNo: company?.employerNo,
            period: period,
          }),
        });
        const result = await response.json();
        const referenceNo = result.referenceNo;
        if (!referenceNo) {
          setSnackbarMessage("Reference number not found. Please try again.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
        return referenceNo;
      } catch (error) {
        console.error("Error fetching EPF Reference No:", error);
        setSnackbarMessage(
          "Error fetching EPF Reference No. Please try again."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    setLoading(true);
    try {
      // Generate payments
      const generateResponse = await fetch(`/api/payments/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, period }),
      });
      const generateData = await generateResponse.json();
      if (!generateResponse.ok) {
        throw new Error(generateData.message || "Failed to generate payments");
      }

      // Prepare payment data
      const referenceNo = await fetchReferenceNo();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const payment = {
        ...generateData.payment,
        period,
        company: companyId,
        epfReferenceNo: referenceNo,
      };

      // Save payments
      const saveResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment: payment }),
      });
      const saveData = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(saveData.message || "Failed to save payments");
      }

      setSnackbarMessage("Payments generated and saved successfully");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Error handling payments:", error);
      setSnackbarMessage(
        error instanceof Error
          ? error.message
          : "An error occurred while handling payments"
      );
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  //handle generate Pdf
  const handleGetPDF = async (
    pdfType: "salary" | "epf" | "etf" | "payslip" | "all" | "print",
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
  ) => {
    //preventdefault
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const salaryIds = undefined;
      const response = await fetch("/api/pdf/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId: companyId,
          period: period,
          pdfType,
          salaryIds,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        console.log(data.message);
        //if data . message and starts with payment data not found show it in snack bar
        if (data.message) {
          if (data.message.includes("data not found for")) {
            setSnackbarMessage(data.message);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
          } else if (data.message.includes("not Purchased")) {
            setSnackbarMessage(data.message);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
          }
        }
        throw new Error("Failed to generate PDF");
      }
      //response is a pdf
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${company?.name} ${pdfType} ${period}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      setSnackbarMessage("PDF generated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error generating pdf:", error);
      setSnackbarMessage("Error generating pdf");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  };

  const handleGenerateAll = async () => {
    setLoading(true);
    setAutoGenProgress(5);
    setAutoGenStatus("Generating Salaries...");
    try {
      // Generate Salaries
      await handleSalaries(true);
      setAutoGenProgress(33);
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      //if generatedSalaries is empty error
      if (generatedSalaries.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        throw new Error("No salaries to generate payments");
      }
      setAutoGenStatus("Generating Payments...");

      // Generate Payments
      await handlePayments();
      setAutoGenProgress(66);
      setAutoGenStatus("Generating Documents...");
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay

      // Generate Documents
      await handleGetPDF("print", undefined);
      setAutoGenProgress(99);
      setAutoGenStatus("Generation Complete");
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5 second delay
    } catch (error) {
      console.error("Error in GenerateAll:", error);
      setSnackbarMessage("Error occurred during generation:" + error);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setAutoGenProgress(0);
      setAutoGenStatus("");
    }
  };

  return (
    <Card sx={{ minHeight: "91vh", overflowY: "auto" }}>
      <CardHeader
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Typography variant="h4">Dashboard</Typography>
            {editable ? (
              <IconButton onClick={() => setEditable(false)}>
                <Done color="primary" />
              </IconButton>
            ) : (
              <IconButton onClick={() => setEditable(true)}>
                <Edit color="primary" />
              </IconButton>
            )}
          </div>
        }
      />
      <CardContent
        sx={{ maxWidth: { xs: "100vw", md: "calc(100vw - 240px)" } }}
      >
        <Grid container spacing={3}>
          {/* Period */}
          <Grid item xs={12} sm={4}>
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
          {/* In-Out */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <Button
                variant="outlined"
                color="primary"
                component="label"
                startIcon={<Upload />}
              >
                Upload In-Out CSV
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (event) => {
                    if (event.target.files && event.target.files[0]) {
                      const _inOut = await handleCsvUpload(
                        event.target.files[0]
                      );
                      setInOut(_inOut);
                    }
                  }}
                />
              </Button>
            </FormControl>
          </Grid>
          {/* View In-Out */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setOpenDialog(true)}
                disabled={!inOut || inOut === ""}
              >
                View In-Out
              </Button>
              {inOut && (
                <SimpleDialog
                  inOutFetched={inOut}
                  openDialog={openDialog}
                  setOpenDialog={setOpenDialog}
                />
              )}
            </FormControl>
          </Grid>
          {/* More Options */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography variant="h6">More Generate Options</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Salaries */}
                  <Grid item xs={6} sm={2.4}>
                    <FormControl fullWidth>
                      {generatedSalaries.length > 0 ? (
                        <Box display="flex" alignItems="center">
                          <Tooltip
                            title="Save generated salaries to the database"
                            arrow
                          >
                            <span>
                              <LoadingButton
                                loading={loading}
                                loadingPosition="start"
                                variant="outlined"
                                color="primary"
                                onClick={() => handleSalaries(true)}
                                sx={{ flexGrow: 1, mr: 1 }}
                                disabled={loading}
                              >
                                <span>Save Salaries</span>
                              </LoadingButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Delete generated salaries" arrow>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={handleDeleteSalaries}
                                disabled={loading}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Tooltip title="Generate salaries for the selected period">
                          <span>
                            <LoadingButton
                              loading={loading}
                              loadingPosition="start"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleSalaries(false)}
                              fullWidth
                              disabled={loading}
                            >
                              <span>Generate Salaries</span>
                            </LoadingButton>
                          </span>
                        </Tooltip>
                      )}
                    </FormControl>
                  </Grid>
                  {/* Payments */}
                  <Grid item xs={6} sm={2.4}>
                    <FormControl fullWidth>
                      <LoadingButton
                        loading={loading}
                        loadingPosition="start"
                        variant="outlined"
                        color="primary"
                        onClick={handlePayments}
                        disabled={loading}
                      >
                        Generate Payment
                      </LoadingButton>
                    </FormControl>
                  </Grid>
                  {/* Documents */}
                  <Grid item xs={6} sm={2.4}>
                    <FormControl fullWidth>
                      <LoadingButton
                        loading={loading}
                        loadingPosition="start"
                        variant="outlined"
                        color="primary"
                        onClick={(e) => {
                          handleGetPDF("print", e);
                        }}
                        disabled={loading}
                      >
                        Generate Documents
                      </LoadingButton>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <LoadingButton
                loading={loading}
                loadingPosition="start"
                variant="contained"
                color="primary"
                startIcon={<AutoAwesome />}
                onClick={handleGenerateAll}
              >
                Generate All
              </LoadingButton>
            </FormControl>
          </Grid>
          {/* progress */}
          {autoGenProgress > 0 && (
            <Grid item xs={12} sm={9}>
              <LinearProgress
                sx={{ height: "0.5rem" }}
                value={autoGenProgress}
                variant="determinate"
                color="success"
              />
              <Typography variant="body2">{autoGenStatus}</Typography>
            </Grid>
          )}
          {/*Generated Salaries */}
          {generatedSalaries.length > 0 && (
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Typography variant="h6">
                    {loading ? (
                      <>
                        Generated Salaries for{" "}
                        <CircularProgress
                          size={20}
                          sx={{ ml: 1, verticalAlign: "middle" }}
                        />
                      </>
                    ) : (
                      `Generated Salaries for ${period}`
                    )}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <GeneratedSalaries
                      generatedSalaries={generatedSalaries}
                      setGeneratedSalaries={setGeneratedSalaries}
                      error={null}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
          <Grid item xs={12}>
            {/* Salaries */}
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography variant="h6">
                  {loading ? (
                    <>
                      Salaries for{" "}
                      <CircularProgress
                        size={20}
                        sx={{ ml: 1, verticalAlign: "middle" }}
                      />
                    </>
                  ) : (
                    `Salaries for ${period}`
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <SalariesDataGrid
                    user={user}
                    period={period}
                    isEditing={editable}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12}>
            {/* Payments */}
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography variant="h6">Payments for {period}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <PaymentsDataGrid
                    user={user}
                    period={period}
                    isEditing={editable}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </CardContent>

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
    </Card>
  );
};

export default Dashboard;
