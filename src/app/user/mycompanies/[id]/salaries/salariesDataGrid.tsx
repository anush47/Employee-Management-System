import React, { useEffect, useState, useCallback } from "react";
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
  Chip,
  Snackbar,
  Slide,
} from "@mui/material";
import { companyId } from "../clientComponents/companySideBar";

// Cache to store employee names
const employeeCache: { [key: string]: string } = {};

export interface Salary {
  id: string;
  employee: string; // Will hold employee ID initially
  period: string;
  basic: number;
  noPay: {
    amount: number;
    reason: string;
  };
  ot: {
    amount: number;
    reason: string;
  };
  paymentStructure: {
    additions: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
  };
  advanceAmount: number;
  finalSalary: number;
}

const SalariesDataGrid: React.FC<{
  user: { id: string; name: string; email: string };
  isEditing: boolean;
}> = ({ user, isEditing }) => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const fetchEmployeeName = useCallback(async (employeeId: string) => {
    if (employeeCache[employeeId]) {
      // Return cached name if it exists
      return employeeCache[employeeId];
    } else {
      // Fetch employee details if not cached
      const response = await fetch(`/api/employees/${employeeId}`);
      if (response.ok) {
        const employeeData = await response.json();
        const employeeName = employeeData.name;
        // Cache the employee name
        employeeCache[employeeId] = employeeName;
        return employeeName;
      } else {
        throw new Error("Failed to fetch employee data");
      }
    }
  }, []);

  const columns: GridColDef[] = [
    {
      field: "employee",
      headerName: "Employee",
      flex: 1,
      renderCell: (params) => {
        const employeeId = params.value;

        const [employeeName, setEmployeeName] = useState<string>("");

        useEffect(() => {
          fetchEmployeeName(employeeId)
            .then(setEmployeeName)
            .catch(() => setEmployeeName("Unknown Employee"));
        }, [employeeId]);

        return employeeName || "Loading...";
      },
    },
    {
      field: "period",
      headerName: "Period",
      flex: 1,
    },
    {
      field: "basic",
      headerName: "Basic Salary",
      type: "number",
      flex: 1,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "noPay",
      headerName: "No Pay",
      flex: 1,
      renderCell: (params) => {
        const { amount, reason } = params.value || {};
        return amount ? (
          <Chip
            label={`LKR ${amount.toLocaleString()} - ${reason || "No reason"}`}
            color="secondary"
            sx={{ textTransform: "capitalize" }}
          />
        ) : null;
      },
    },
    {
      field: "ot",
      headerName: "Overtime",
      flex: 1,
      renderCell: (params) => {
        const { amount, reason } = params.value || {};
        return amount ? (
          <Chip
            label={`LKR ${amount.toLocaleString()} - ${reason || "No reason"}`}
            color="primary"
            sx={{ textTransform: "capitalize" }}
          />
        ) : null;
      },
    },
    {
      field: "finalSalary",
      headerName: "Final Salary",
      type: "number",
      flex: 1,
      align: "left",
      headerAlign: "left",
    },
  ];

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/salaries/?companyId=${companyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch salaries");
        }
        const data = await response.json();
        const salariesWithId = data.salaries.map((salary: any) => ({
          ...salary,
          id: salary._id,
        }));
        setSalaries(salariesWithId);
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

    fetchSalaries();
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
      basic: false,
      period: false,
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
          rows={salaries}
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

export default SalariesDataGrid;
