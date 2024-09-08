import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Slide,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ArrowBack } from "@mui/icons-material";

const NewPurchaseForm: React.FC<{
  user: { id: string; name: string; email: string };
  handleBackClick: () => void;
}> = ({ user, handleBackClick }) => {
  const [period, setPeriod] = useState<string>("");
  const [price, setPrice] = useState<number | null>(null);
  const [request, setRequest] = useState<string>("");
  const [requestDay, setRequestDay] = useState<dayjs.Dayjs | null>(null);
  const [approvedStatus, setApprovedStatus] = useState<string>("pending");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          period,
          price,
          request,
          requestDay: requestDay ? requestDay.format("YYYY-MM-DD") : null,
          approvedStatus,
          company: user.id, // Assuming company ID is the same as user ID
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create purchase");
      }

      setSnackbarMessage("Purchase created successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleBackClick();
    } catch (error: any) {
      setError(error.message);
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
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
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}
    >
      <Typography variant="h5" gutterBottom>
        New Purchase
      </Typography>
      <TextField
        label="Period"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        required
      />
      <TextField
        label="Price"
        type="number"
        value={price ?? ""}
        onChange={(e) => setPrice(parseFloat(e.target.value))}
        required
      />
      <TextField
        label="Request"
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        required
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Request Day"
          value={requestDay}
          onChange={(newValue) => setRequestDay(newValue)}
        />
      </LocalizationProvider>
      <TextField
        label="Approved Status"
        select
        value={approvedStatus}
        onChange={(e) => setApprovedStatus(e.target.value)}
        required
      >
        <MenuItem value="approved">Approved</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="rejected">Rejected</MenuItem>
      </TextField>
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleBackClick}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Create Purchase"}
        </Button>
      </Box>
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
    </Box>
  );
};

export default NewPurchaseForm;
