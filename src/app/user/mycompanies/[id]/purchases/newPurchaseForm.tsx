import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Chip,
  CardHeader,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  TextField,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import dayjs from "dayjs";
import Slide from "@mui/material/Slide";
import { companyId } from "../clientComponents/companySideBar";

interface ChipData {
  key: number;
  label: string;
}

const validatePeriod = (value: string) => {
  const regex = /^(0?[1-9]|1[0-2])-(19|20)\d\d$/;
  return regex.test(value);
};

const isValidMonthYear = (value: string) => {
  if (!validatePeriod(value)) return false;

  const [monthStr, yearStr] = value.split("-");
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  return year >= 1990 && year <= 2026 && month >= 1 && month <= 12;
};

const SlideTransition = (props: any) => <Slide {...props} direction="up" />;

const formatPeriod = (value: string) => {
  const [monthStr, yearStr] = value.split("-");
  const month = monthStr.padStart(2, "0"); // Add leading zero if necessary
  const year = yearStr.padStart(4, "0"); // Ensure year is 4 digits
  return `${month}-${year}`;
};

const formatPrice = (price: number) => {
  return price.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
  });
};

const NewPurchaseForm: React.FC<{ handleBackClick: () => void }> = ({
  handleBackClick,
}) => {
  const [periods, setPeriods] = useState<ChipData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null
  );
  const [purchasedPeriods, setPurchasedPeriods] = useState<string[]>([]); // New state for purchased periods
  const [totalPrice, setTotalPrice] = useState<number | null>(null); // New state for total price
  const [finalTotalPrice, setFinalTotalPrice] = useState<number | null>(null); // New state for final total price

  useEffect(() => {
    // Set the default month to the current month in "MM-YYYY" format
    const currentMonth = dayjs().format("MM");
    const currentYear = dayjs().format("YYYY");
    setSelectedPeriod(`${currentMonth}-${currentYear}`);

    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies/one?companyId=${companyId}`);
        const data = await res.json();
        setPrice(data.company.monthlyPrice);
      } catch (err) {
        setError("Failed to fetch company details");
      } finally {
        setLoading(false);
      }
    };

    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/purchases/?companyId=${companyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch purchases");
        }
        const data = await response.json();
        const purchases = data.purchases
          .map((purchase: any) => purchase.periods)
          .flat();
        setPurchasedPeriods(purchases);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
    fetchPurchases();
  }, []);

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(image);
    } else {
      setImagePreview(null);
    }
  }, [image]);

  const handleAddPeriod = () => {
    if (
      selectedPeriod &&
      isValidMonthYear(selectedPeriod) &&
      !periods.find((p) => p.label === formatPeriod(selectedPeriod))
    ) {
      if (purchasedPeriods.includes(formatPeriod(selectedPeriod))) {
        setError("Period already purchased");
        return;
      }
      setError("");
      const formattedPeriod = formatPeriod(selectedPeriod);
      setPeriods([...periods, { key: periods.length, label: formattedPeriod }]);

      //selected period is in "09-2024"
      const [month, year] = selectedPeriod.split("-");
      //get next month
      const nextMonth = parseInt(month) + 1;
      //if next month is 13, set to 1 and increase year
      if (nextMonth > 12) {
        setSelectedPeriod(`01-${parseInt(year) + 1}`);
      } else {
        setSelectedPeriod(`${nextMonth}-${year}`);
      }
    } else {
      setError("Period already added or invalid");
    }
  };

  const handleDeletePeriod = (chipToDelete: ChipData) => () => {
    setPeriods((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Construct the payload object
    const payload = {
      periods: periods.map((p) => p.label),
      price: price ?? 0,
      company: companyId,
      // Convert image to base64 if you want to include it in the JSON payload
      // Note: Handling large files as base64 can be inefficient
      // If you want to avoid using base64, you need to handle image separately
      request: image ? await convertImageToBase64(image) : null,
    };

    try {
      // Send JSON payload in the request
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create purchase");
      }

      setSnackbarMessage("Purchase Requested successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      //wait
      await new Promise((resolve) => setTimeout(resolve, 2000));
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

  // Function to convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

  useEffect(() => {
    async function fetchPrice() {
      setLoading(true);
      try {
        // Ensure periods and companyId are valid
        if (!companyId || periods.length === 0) return;

        // Construct the query parameter string for months
        const monthsParam = periods.map((p) => p.label).join("+");

        // Fetch price details from the API
        const res = await fetch(
          `/api/purchases/price?companyId=${companyId}&months=${monthsParam}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch price details");
        }

        const data = await res.json();
        setFinalTotalPrice(data.finalTotalPrice);
        setTotalPrice(data.totalPrice); // Update with final total price
      } catch (err) {
        setError("Failed to fetch price details");
      } finally {
        setLoading(false);
      }
    }

    // Fetch price if periods and companyId exist
    if (periods && companyId) fetchPrice();
  }, [companyId, periods]);

  const oneMonthPrice = price ?? 0;

  return (
    <Box>
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h5">
              <Tooltip title="Discard and go back" arrow>
                <IconButton sx={{ mr: 2 }} onClick={handleBackClick}>
                  <ArrowBack />
                </IconButton>
              </Tooltip>
              New Purchase
            </Typography>
          </Box>
        }
      />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ m: 1 }}>
              Months to Purchase - {periods.length}
            </Typography>
            <Paper
              sx={{
                display: "flex",
                justifyContent: "left",
                flexWrap: "wrap",
                listStyle: "none",
                p: 0.5,
                m: 0,
              }}
              component="ul"
            >
              {periods.map((data) => (
                <li key={data.key}>
                  <Chip
                    label={data.label}
                    onDelete={handleDeletePeriod(data)}
                    sx={{
                      m: 0.5,
                      backgroundColor: (theme) => theme.palette.primary.main,
                      color: (theme) => theme.palette.primary.contrastText,
                      fontSize: "1.2rem",
                      borderRadius: "16px",
                      "& .MuiChip-deleteIcon": {
                        color: (theme) => theme.palette.primary.contrastText,
                      },
                    }}
                  />
                </li>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              placeholder="MM-YYYY"
              fullWidth
              error={!isValidMonthYear(selectedPeriod) && selectedPeriod !== ""}
              helperText={
                !isValidMonthYear(selectedPeriod) && selectedPeriod !== ""
                  ? "Enter a valid month and year (MM-YYYY)"
                  : error
              }
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={handleAddPeriod}
              sx={{ mt: 1 }}
            >
              Add Period
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <div>
                  <Typography variant="h6">Bank Details</Typography>
                  <Typography variant="body2">
                    Account Number: 123456789
                  </Typography>
                  <Typography variant="body2">Bank: Example Bank</Typography>
                </div>
                <hr className="my-2" />
                <div>
                  <Typography variant="h6">Price Details</Typography>
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "30px",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body1">
                        Price per Month: {formatPrice(oneMonthPrice)}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                      >
                        Total Price:{" "}
                        {
                          // Show if finalTotalPrice and totalPrice are different as a strike-through to highlight discount
                          finalTotalPrice !== totalPrice && (
                            <span style={{ textDecoration: "line-through" }}>
                              {formatPrice(totalPrice ?? 0)}
                            </span>
                          )
                        }{" "}
                        {formatPrice(finalTotalPrice ?? 0)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {periods.length} x {formatPrice(oneMonthPrice)}
                      </Typography>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Please make the payment and upload the payment slip to request.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              component="label"
              disabled={(totalPrice ?? 0) <= 0}
            >
              Upload Payment Slip
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 2, justifyContent: "left" }}>
                <img
                  src={imagePreview as string}
                  alt="Uploaded Preview"
                  style={{ maxWidth: "100px", height: "auto" }}
                />
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="Create purchase" arrow>
              <span>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSubmit}
                  disabled={loading || totalPrice === 0 || !image}
                  startIcon={loading ? <CircularProgress size={24} /> : null}
                >
                  {loading ? "Purchasing..." : "Purchase"}
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={snackbarOpen}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        action={
          <Button color="inherit" onClick={handleSnackbarClose}>
            Close
          </Button>
        }
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewPurchaseForm;
