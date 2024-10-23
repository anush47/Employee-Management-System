import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Box,
  Alert,
  CircularProgress,
  Button,
  Snackbar,
  Slide,
  Chip,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Link from "next/link";
import { request } from "http";

// Set dayjs format for consistency
dayjs.locale("en-gb");

export interface Payment {
  id: string;
  _id: string;
  companyName: string;
  companyEmployerNo: string;
  companyPaymentMethod: string;
  period: string;
  company: string;
  epfReferenceNo: string;
  epfAmount: number;
  epfSurcharges: number;
  epfPaymentMethod: string;
  epfChequeNo: string;
  epfPayDay: string;
  etfAmount: number;
  etfSurcharges: number;
  etfPaymentMethod: string;
  etfChequeNo: string;
  etfPayDay: string;
}

export const ddmmyyyy_to_mmddyyyy = (ddmmyyyy: string) => {
  if (ddmmyyyy === null) {
    return "";
  }
  const [dd, mm, yyyy] = ddmmyyyy.split("-");
  return `${mm}-${dd}-${yyyy}`;
};

const PaymentsDataGrid: React.FC<{
  user: { id: string; name: string; email: string };
  isEditing: boolean;
  period?: string;
}> = ({ user, isEditing, period }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const columns: GridColDef[] = [
    {
      field: "companyName",
      headerName: "Company",
      flex: 1,
    },
    {
      field: "companyEmployerNo",
      headerName: "Employer No.",
      flex: 1,
    },
    {
      field: "period",
      headerName: "Period",
      flex: 1,
      renderCell: (params) => {
        return (
          <Chip
            label={params.value}
            color="primary"
            sx={{
              m: 0.2,
              textTransform: "capitalize",
            }}
          />
        );
      },
    },
    {
      field: "epfReferenceNo",
      headerName: "EPF Ref No.",
      flex: 1,
      align: "left",
      headerAlign: "left",
      editable: isEditing,
    },
    {
      field: "epfAmount",
      type: "number",
      headerName: "EPF Amount",
      flex: 1,
    },
    {
      field: "epfSurcharges",
      headerName: "EPF Surcharges",
      type: "number",
      editable: isEditing,
      flex: 1,
    },
    {
      field: "epfPaymentMethod",
      headerName: "EPF Payment Method",
      flex: 1,
      editable: isEditing,
    },
    {
      field: "epfChequeNo",
      headerName: "EPF Cheque No.",
      flex: 1,
      editable: isEditing,
    },
    {
      field: "epfPayDay",
      headerName: "EPF Pay Day",
      flex: 1,
      editable: isEditing,
      valueGetter: (params) => {
        // Ensure the date is formatted correctly for display
        return params;
      },
      renderEditCell: (params) => (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <DatePicker
            label="EPF Paid Day"
            openTo="day"
            views={["year", "month", "day"]}
            value={dayjs(params.value)}
            onChange={(newDate) => {
              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: newDate ? newDate.format("YYYY-MM-DD") : null,
              });
            }}
            slotProps={{
              field: { clearable: true },
            }}
          />
        </LocalizationProvider>
      ),
    },
    {
      field: "etfAmount",
      headerName: "ETF Amount",
      flex: 1,
    },
    {
      field: "etfSurcharges",
      headerName: "ETF Surcharges",
      type: "number",
      flex: 1,
      editable: isEditing,
    },
    {
      field: "etfPaymentMethod",
      headerName: "ETF Payment Method",
      flex: 1,
      editable: isEditing,
    },
    {
      field: "etfChequeNo",
      headerName: "ETF Cheque No.",
      flex: 1,
      editable: isEditing,
    },
    {
      field: "etfPayDay",
      headerName: "ETF Pay Day",
      flex: 1,
      editable: isEditing,
      valueGetter: (params) => {
        // Ensure the date is formatted correctly for display
        return params;
      },
      renderEditCell: (params) => (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <DatePicker
            label="ETF Paid Day"
            openTo="day"
            views={["year", "month", "day"]}
            value={dayjs(params.value)}
            onChange={(newDate) => {
              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: newDate ? newDate.format("YYYY-MM-DD") : null,
              });
            }}
            slotProps={{
              field: { clearable: true },
            }}
          />
        </LocalizationProvider>
      ),
    },
    {
      field: "remark",
      headerName: "Remark",
      flex: 1,
      editable: isEditing,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        return (
          <Link
            href={`/user/mycompanies/${
              payments.find((payment) => {
                return payment.id === params.id;
              })?.company
            }?companyPageSelect=payments&paymentId=${params.id}`}
          >
            <Button variant="text" color="primary" size="small">
              View
            </Button>
          </Link>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        let url = `/api/payments/?companyId=all`;
        if (period) {
          url += `&period=${period}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch payments");
        }
        const data = await response.json();
        const paymentsWithId = data.payments.map((payment: any) => ({
          ...payment,
          id: payment._id,
        }));
        setPayments(paymentsWithId);
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

    fetchPayments();
  }, [user]);

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleRowUpdate = async (newPayment: any) => {
    try {
      console.log(newPayment);
      const response = await fetch(`/api/payments/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment: newPayment }),
      });
      if (!response.ok) {
        throw new Error("Failed to update payment");
      }
      setSnackbarMessage("Payment updated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      return newPayment;
    } catch (error) {
      console.error("Row update error:", error);
      setSnackbarMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleRowUpdateError = (params: any) => {
    // Revert changes if necessary
    const updatedPayments = payments.map((payment) => {
      if (payment.id === params.id) {
        return params.oldRow; // Revert to old row data
      }
      return payment;
    });

    // Log error and revert row updates
    console.error("Row update error:", params.error?.error || params.error);

    setPayments(updatedPayments); // Update state with reverted data

    // Display the error details in Snackbar
    setSnackbarMessage(
      params.error?.message || "An unexpected error occurred." // Show detailed error message
    );
    setSnackbarSeverity("error"); // Set snackbar severity to error
    setSnackbarOpen(true); // Open Snackbar
  };

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      id: false,
      companyName: true,
      companyEmployerNo: false,
      companyPaymentMethod: false,
      period: true,
      company: false,
      epfReferenceNo: true,
      epfAmount: false,
      etfAmount: false,
      epfPaymentMethod: false,
      etfPaymentMethod: false,
      epfChequeNo: false,
      etfChequeNo: false,
    });

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        height: period ? 250 : 400,
        overflowX: "auto",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading && <CircularProgress />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <div style={{ width: "100%", height: "100%" }}>
          <DataGrid
            rows={payments}
            columns={columns}
            editMode="row"
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
              filter: {
                filterModel: {
                  items: [],
                  quickFilterExcludeHiddenColumns: false,
                },
              },
            }}
            pageSizeOptions={[5]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            disableRowSelectionOnClick
            disableDensitySelector
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) =>
              setColumnVisibilityModel(newModel)
            }
            processRowUpdate={handleRowUpdate}
            onProcessRowUpdateError={handleRowUpdateError}
          />
        </div>
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
    </Box>
  );
};

export default PaymentsDataGrid;
