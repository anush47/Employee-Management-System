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

// Set dayjs format for consistency
dayjs.locale("en-gb");

export interface Purchase {
  id: string;
  period: string;
  company: string;
  approvedStatus: string;
}

export const ddmmyyyy_to_mmddyyyy = (ddmmyyyy: string) => {
  const [dd, mm, yyyy] = ddmmyyyy.split("-");
  return `${mm}-${dd}-${yyyy}`;
};

const PurchasesDataGrid: React.FC<{
  user: { id: string; name: string; email: string };
  isEditingPurchaseInHome: boolean;
}> = ({ user, isEditingPurchaseInHome }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const columns: GridColDef[] = [
    {
      field: "_id",
      headerName: "ID",
      flex: 1,
    },
    {
      field: "company",
      headerName: "Company ID",
      flex: 1,
    },
    {
      field: "periods",
      headerName: "Periods",
      flex: 1,
    },
    {
      field: "price",
      headerName: "Price",
      flex: 1,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "requestDay",
      headerName: "Request Day",
      flex: 1,
    },
    {
      field: "approvedStatus",
      headerName: "Status",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["approved", "pending", "rejected"],
      editable: isEditingPurchaseInHome,
      renderCell: (params) => {
        const status = params.value;

        let chipColor: "success" | "warning" | "error" = "success";

        if (status === "pending") {
          chipColor = "warning";
        } else if (status === "rejected") {
          chipColor = "error";
        }

        return (
          <Chip
            label={status}
            color={chipColor}
            sx={{ fontWeight: "bold", textTransform: "capitalize" }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Link href={`user?userPageSelect=purchases&purchaseId=${params.id}`}>
          <Button variant="text">View</Button>
        </Link>
      ),
    },
  ];

  const handleRowUpdate = async (newPurchase: any) => {
    setLoading(true);
    setError(null);

    const payload = {
      _id: newPurchase.id,
      approvedStatus: newPurchase.approvedStatus,
    };

    try {
      const response = await fetch(`/api/purchases`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Error updating purchase. Please try again."
        );
      }

      // Update the state with the new purchase data
      setPurchases((prevPurchases) =>
        prevPurchases.map((purchase) =>
          purchase.id === newPurchase.id ? newPurchase : purchase
        )
      );

      // Success feedback
      setSnackbarMessage(`Purchase updated successfully!`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      return newPurchase;
    } catch (error: any) {
      console.error("Error updating purchase:", error);
      setSnackbarMessage(
        error.message || "Error updating purchase. Please try again."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      throw {
        message:
          error?.message || "An error occurred while updating the purchase.",
        error: error,
      };
    } finally {
      setLoading(false);
    }
  };

  const handleRowUpdateError = (params: any) => {
    // Revert changes if necessary
    const updatedPurchases = purchases.map((purchase) => {
      if (purchase.id === params.id) {
        return params.oldRow; // Revert to old row data
      }
      return purchase;
    });

    // Log error and revert row updates
    console.error("Row update error:", params.error?.error || params.error);

    setPurchases(updatedPurchases); // Update state with reverted data

    // Display the error details in Snackbar
    setSnackbarMessage(
      params.error?.message || "An unexpected error occurred."
    ); // Show detailed error message
    setSnackbarSeverity("error"); // Set snackbar severity to error
    setSnackbarOpen(true); // Open Snackbar
  };

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/purchases/?companyId=${"all"}`);
        if (!response.ok) {
          throw new Error("Failed to fetch purchases");
        }
        const data = await response.json();
        const purchasesWithId = data.purchases.map((purchase: any) => ({
          ...purchase,
          id: purchase._id,
        }));
        setPurchases(purchasesWithId);
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

    fetchPurchases();
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

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      id: false,
      _id: false,
      company: false,
      price: false,
      request: false,
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
          editMode="row"
          rows={purchases}
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
          processRowUpdate={handleRowUpdate}
          onProcessRowUpdateError={handleRowUpdateError}
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

export default PurchasesDataGrid;
