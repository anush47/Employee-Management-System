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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slide,
  TextField,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

interface ChipData {
  key: number;
  label: string;
}

const SlideTransition = (props: any) => <Slide {...props} direction="up" />;

const formatPrice = (price: number) => {
  return price.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
  });
};

interface UpdatePurchaseFormProps {
  handleBackClick: () => void;
  purchaseId: string;
}

const UpdatePurchaseForm: React.FC<UpdatePurchaseFormProps> = ({
  handleBackClick,
  purchaseId,
}) => {
  const [periods, setPeriods] = useState<ChipData[]>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [remark, setRemark] = useState<string>("");
  const [status, setStatus] = useState<string>("");
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
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [employerNo, setEmployerNo] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies/one?companyId=${companyId}`);
        const data = await res.json();
        setPrice(data.company.monthlyPrice);
        setCompanyName(data.company.name);
        setEmployerNo(data.company.employerNo);
      } catch (err) {
        setError("Failed to fetch company details");
      } finally {
        setLoading(false);
      }
    };

    const fetchPurchase = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/purchases/?purchaseId=${purchaseId}`);
        const data = await res.json();
        console.log(data);
        setPrice(data.purchase.price);
        setPeriods(
          data.purchase.periods.map((period: string, index: number) => ({
            key: index,
            label: period,
          }))
        );
        setStatus(data.purchase.approvedStatus);
        setRemark(data.purchase.remark);
        setCompanyId(data.purchase.company);
        if (data.purchase.request) {
          const imageResponse = await fetch(data.purchase.request);
          const imageBlob = await imageResponse.blob();
          setImage(
            new File([imageBlob], "image.jpg", { type: imageBlob.type })
          );
        }
      } catch (err) {
        setError("Failed to fetch purchase details");
      } finally {
        setLoading(false);
      }
    };

    if (!price) fetchPurchase();
    if (companyId) fetchCompany();
  }, [purchaseId, companyId]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      approvedStatus: status,
      _id: purchaseId,
      remark,
      request: image ? null : "delete",
    };

    try {
      const response = await fetch(`/api/purchases/?purchaseId=${purchaseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update purchase");
      }

      setSnackbarMessage("Purchase updated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
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

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const oneMonthPrice = price ?? 0;
  const totalPrice = oneMonthPrice * periods.length;

  function handleImageDelete(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setImage(null);
  }

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
              Update Purchase
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
              Months Purchased - {periods.length}
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
                    sx={{
                      m: 0.5,
                      backgroundColor: (theme) => theme.palette.primary.main,
                      color: (theme) => theme.palette.primary.contrastText,
                      fontSize: "1.2rem",
                      borderRadius: "16px",
                    }}
                  />
                </li>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <div>
                  <Typography variant="h6">Company Details</Typography>
                  <Typography variant="body1">
                    Company Name: {companyName}
                  </Typography>
                  <Typography variant="body1">
                    Employer No: {employerNo}
                  </Typography>
                </div>
                <hr className="my-2" />
                <div>
                  <Typography variant="h6">Price Details</Typography>
                  <Typography variant="body1">
                    Price per Month: {formatPrice(oneMonthPrice)}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    Total Price: {formatPrice(totalPrice)}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
          {image && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                {imagePreview && (
                  <img
                    src={imagePreview as string}
                    alt="Preview"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                )}
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            {image && (
              <>
                <Tooltip title="Delete Image" arrow>
                  <span className="mb-2">
                    <Button
                      variant="outlined"
                      color={"error"}
                      onClick={handleImageDelete}
                      disabled={loading}
                      startIcon={
                        loading ? <CircularProgress size={24} /> : null
                      }
                    >
                      {loading ? "Updating..." : "Delete Image"}
                    </Button>
                  </span>
                </Tooltip>
                <div className="mb-5" />
              </>
            )}
            <FormControl fullWidth>
              <TextField
                label="Remark"
                variant="outlined"
                name="remark"
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                multiline
                rows={2}
                sx={{
                  mb: 2,
                }}
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                name="status"
                onChange={(event) => setStatus(event.target.value as string)}
                value={status}
                displayEmpty
                fullWidth
                className="mb-2"
              >
                <MenuItem value="pending">
                  <Typography sx={{ color: "warning.main" }}>
                    Pending
                  </Typography>
                </MenuItem>
                <MenuItem value="approved">
                  <Typography sx={{ color: "success.main" }}>
                    Approved
                  </Typography>
                </MenuItem>
                <MenuItem value="rejected">
                  <Typography sx={{ color: "error.main" }}>Rejected</Typography>
                </MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Update purchase" arrow>
              <span>
                <Button
                  variant="contained"
                  color={
                    status === "approved"
                      ? "success"
                      : status === "rejected"
                      ? "error"
                      : "warning"
                  }
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={24} /> : null}
                >
                  {loading
                    ? "Updating..."
                    : (
                        {
                          approved: "Approve",
                          pending: "Pending",
                          rejected: "Reject",
                        } as { [key: string]: string }
                      )[status as "approved" | "pending" | "rejected"]}
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

export default UpdatePurchaseForm;
