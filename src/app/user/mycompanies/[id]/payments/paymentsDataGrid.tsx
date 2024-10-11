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
import { companyId } from "../clientComponents/companySideBar";
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
  epfPaymentMethod: string;
  epfChequeNo: string;
  epfPayDay: string;
  etfAmount: number;
  etfPaymentMethod: string;
  etfChequeNo: string;
  etfPayDay: string;
}

export const ddmmyyyy_to_mmddyyyy = (ddmmyyyy: string) => {
  const [dd, mm, yyyy] = ddmmyyyy.split("-");
  return `${mm}-${dd}-${yyyy}`;
};

const PaymentsDataGrid: React.FC<{
  user: { id: string; name: string; email: string };
  isEditing: boolean;
}> = ({ user }) => {
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
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "epfAmount",
      type: "number",
      headerName: "Request Day",
      flex: 1,
    },
    {
      field: "epfPaymentMethod",
      headerName: "EPF Payment Method",
      flex: 1,
    },
    {
      field: "epfChequeNo",
      headerName: "EPF Cheque No.",
      flex: 1,
    },
    {
      field: "epfPayDay",
      headerName: "EPF Pay Day",
      flex: 1,
    },
    {
      field: "etfAmount",
      headerName: "ETF Amount",
      flex: 1,
    },
    {
      field: "etfPaymentMethod",
      headerName: "ETF Payment Method",
      flex: 1,
    },
    {
      field: "etfChequeNo",
      headerName: "ETF Cheque No.",
      flex: 1,
    },
    {
      field: "etfPayDay",
      headerName: "ETF Pay Day",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        return (
          <Link
            href={`/user/mycompanies/${companyId}?companyPageSelect=payments&paymentId=${params.id}`}
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
        const response = await fetch(`/api/payments/?companyId=${companyId}`);
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
  }, [user, companyId]);

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      id: false,
    });

  return (
    <Box
      sx={{
        width: "100%",
        height: 400,
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
        <DataGrid
          rows={payments}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
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
          disableColumnFilter
          disableDensitySelector
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
        />
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
