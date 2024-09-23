import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  Slide,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Employee } from "../employees/clientComponents/employeesDataGrid";
import { companyId } from "../clientComponents/companySideBar";
import { Salary } from "./salariesDataGrid";
import { Autorenew, Save, Upload } from "@mui/icons-material";
import { PaymentStructure } from "../companyDetails/paymentStructure";
import { handleCsvUpload } from "./csvUpload";
import { blue } from "@mui/material/colors";

const GenerateSalaryOne = ({
  period,
  employeeId,
}: {
  period: string;
  employeeId: string;
}) => {
  const SlideTransition = (props: any) => <Slide {...props} direction="up" />;
  const [employee, setEmployee] = useState<Employee>();
  const [loading, setLoading] = useState(false);
  const [inOut, setInOut] = useState("");
  const [inOutFetched, setInOutFetched] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  const [formFields, setFormFields] = useState<Salary>({
    id: "",
    employee: "",
    period: "",
    basic: 0,
    inOut: "",
    noPay: {
      amount: 0,
      reason: "",
    },
    ot: {
      amount: 0,
      reason: "",
    },
    paymentStructure: {
      additions: [],
      deductions: [],
    },
    advanceAmount: 0,
    finalSalary: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const theme = useTheme();

  // Fetch employee
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/employees/one?employeeId=${employeeId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch Employee");
        }
        const data = await response.json();
        setEmployee(data.employee);
        // Set working days if undefined
        if (!data.employee.workingDays) {
          data.employee.workingDays = {
            mon: "off",
            tue: "off",
            wed: "off",
            thu: "off",
            fri: "off",
            sat: "off",
            sun: "off",
          };
        }
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
      fetchEmployee();
    } else {
      setSnackbarMessage("Invalid Company ID");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [employeeId]);

  // Fetch salary
  useEffect(() => {
    const fetchSalary = async () => {
      try {
        setLoading(true);
        //use post method
        const response = await fetch(`/api/salaries/generate`, {
          method: "POST",
          body: JSON.stringify({
            companyId,
            employees: [employeeId],
            period,
            inOut,
          }),
        });
        if (!response.ok) {
          setFormFields((prevFields) => ({
            ...prevFields,
            period,
          }));
          const data = await response.json();
          if (
            typeof data?.message === "string" &&
            data.message.startsWith("Month not Purchased")
          ) {
            throw new Error(data.message);
          } else {
            throw new Error("Failed to fetch Salary");
          }
        }
        const data = await response.json();
        //check if data.salaries[0] is in correct form
        if (
          !data.salaries[0] ||
          !data.salaries[0].employee ||
          !data.salaries[0].period
        ) {
          throw new Error("Invalid Salary Data");
        }
        console.log(data.salaries[0]);

        setFormFields(data.salaries[0]);
        data.sa;
      } catch (error) {
        setSnackbarMessage(
          error instanceof Error ? error.message : "Error fetching Salary."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId?.length === 24) {
      fetchSalary();
    } else {
      setSnackbarMessage("Invalid Employee ID");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [employeeId, period, inOut]);

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const calculateFinalSalary = () => {
    const basic = Number(formFields.basic);
    const otAmount = Number(formFields.ot.amount);
    const additions = formFields.paymentStructure.additions.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0
    );
    const deductions = formFields.paymentStructure.deductions.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0
    );
    const noPayAmount = Number(formFields.noPay.amount);
    const advanceAmount = Number(formFields.advanceAmount);

    const finalSalary = basic + otAmount + additions - deductions - noPayAmount;
    setFormFields((prevFields) => ({
      ...prevFields,
      finalSalary,
    }));
  };

  //calculate final salary when changed
  useEffect(() => {
    calculateFinalSalary();
  }, [
    formFields.basic,
    formFields.ot,
    formFields.paymentStructure,
    formFields.noPay,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("ot-") || name.startsWith("noPay-")) {
      const [prefix, key] = name.split("-");
      setFormFields((prevFields) => ({
        ...prevFields,
        [prefix]: {
          ...(prevFields[prefix as keyof Salary] as Record<string, any>),
          [key]: value,
        },
      }));
      return;
    }

    setFormFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };

  const onSaveClick = async () => {
    //const newErrors = SalaryValidation(formFields);
    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      return;
    }

    console.log(formFields);

    setLoading(true);
    try {
      // Perform POST request to add a new salary record
      const response = await fetch("/api/salaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formFields,
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
        // setFormFields({
        // });
        setErrors({});
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

  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Generate Salary
              <Tooltip title="Save new salary record" arrow>
                <>
                  <Button
                    variant="outlined"
                    sx={{
                      ml: 3,
                    }}
                    color="success"
                    startIcon={<Save />}
                    onClick={onSaveClick}
                    disabled={loading} // Disable button while loading
                  >
                    {loading ? <CircularProgress size={24} /> : "Save"}
                  </Button>
                </>
              </Tooltip>
            </Typography>
          }
          subheader={
            loading ? (
              <CircularProgress size={20} />
            ) : (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle1" color="textSecondary">
                  Employee: {employee?.memberNo} - {employee?.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  NIC: {employee?.nic}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Period: {period}
                </Typography>
              </Box>
            )
          }
        />

        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <Button
                  variant="contained"
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
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                {/* show fetched inout in a dialog */}
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setOpenDialog(true)}
                  disabled={!formFields.inOut || formFields.inOut === ""}
                >
                  View In-Out
                </Button>
                {formFields.inOut && (
                  <SimpleDialog
                    inOutFetched={formFields.inOut}
                    openDialog={openDialog}
                    setOpenDialog={setOpenDialog}
                  />
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <Button
                  variant="contained"
                  color="success"
                  component="label"
                  startIcon={<Autorenew />}
                >
                  Regenerate
                </Button>
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
                  InputProps={{
                    readOnly: loading,
                  }}
                />
                {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.finalSalary}>
                <TextField
                  label="Final Salary"
                  name="finalSalary"
                  type="number"
                  value={formFields.finalSalary}
                  onChange={handleChange}
                  variant="filled"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                {errors.finalSalary && (
                  <FormHelperText>{errors.finalSalary}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.ot}>
                <TextField
                  label="OT"
                  name="ot-amount"
                  type="number"
                  value={formFields.ot.amount}
                  onChange={handleChange}
                  variant="filled"
                  InputProps={{
                    readOnly: loading,
                  }}
                />
                {errors.ot && <FormHelperText>{errors.ot}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.ot}>
                <TextField
                  label="OT Reason"
                  name="ot-reason"
                  value={formFields.ot.reason}
                  onChange={handleChange}
                  variant="filled"
                  multiline
                  InputProps={{
                    readOnly: loading,
                  }}
                />
                {errors.ot && <FormHelperText>{errors.ot}</FormHelperText>}
              </FormControl>
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
                isSalary={true}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.noPay}>
                <TextField
                  label="No Pay"
                  name="noPay-amount"
                  type="number"
                  value={formFields.noPay.amount}
                  onChange={handleChange}
                  variant="filled"
                  InputProps={{
                    readOnly: loading,
                  }}
                />
                {errors.noPay && (
                  <FormHelperText>{errors.noPay}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.noPay}>
                <TextField
                  label="No Pay Reason"
                  name="noPay-reason"
                  value={formFields.noPay.reason}
                  onChange={handleChange}
                  variant="filled"
                  multiline
                  InputProps={{
                    readOnly: loading,
                  }}
                />
                {errors.noPay && (
                  <FormHelperText>{errors.noPay}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.advanceAmount}>
                <TextField
                  label="Advance Amount"
                  name="advanceAmount"
                  type="number"
                  value={formFields.advanceAmount}
                  onChange={handleChange}
                  variant="filled"
                  InputProps={{
                    readOnly: loading,
                  }}
                />
                {errors.advanceAmount && (
                  <FormHelperText>{errors.advanceAmount}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
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

export default GenerateSalaryOne;

export const SimpleDialog = (props: {
  inOutFetched: string;
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { inOutFetched, openDialog, setOpenDialog } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      fullScreen={fullScreen}
    >
      <DialogTitle>Fetched In-Out</DialogTitle>
      <DialogContent>
        {inOutFetched.split("\n").map((line, index) => (
          <Typography key={index}>{line}</Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpenDialog(false);
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
