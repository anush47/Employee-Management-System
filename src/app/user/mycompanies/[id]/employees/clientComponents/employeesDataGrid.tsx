import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  Alert,
  CircularProgress,
  Button,
  Snackbar,
  Slide,
} from "@mui/material";
import { companyId } from "../../clientComponents/companySideBar";
import { columns } from "./coloumnDefinitions";

export interface Employee {
  id: string;
  designation: string;
  name: string;
  memberNo: number;
  nic: string;
  basic: number;
  paymentStructure: {
    additions: {
      name: string;
      amount: string;
    }[];
    deductions: {
      name: string;
      amount: string;
    }[];
  };
  startedAt: Date | string;
  company: string;
}

const EmployeesDataGrid = ({
  user,
}: {
  user: { id: string; name: string; email: string };
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/employees/many?companyId=${companyId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await response.json();
        const employeesWithId = data.employees.map((employee: any) => ({
          ...employee,
          id: employee._id,
        }));
        setEmployees(employeesWithId);
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

    fetchEmployees();
  }, [user, companyId]);

  const validate = (newEmployee: {
    name: string;
    memberNo: string;
    nic: string;
    basic: string;
  }) => {
    const errors: {
      name?: string;
      memberNo?: string;
      nic?: string;
      basic?: string;
    } = {};
    if (newEmployee.name === "") {
      errors.name = "Name is required";
    }
    if (newEmployee.memberNo === "") {
      errors.memberNo = "Member number is required";
    }
    if (newEmployee.nic === "") {
      errors.nic = "NIC is required";
    }
    if (newEmployee.basic === "") {
      errors.basic = "Basic salary is required";
    }
    return errors;
  };

  // Handle successful row update
  const handleRowUpdate = async (newEmployee: any) => {
    try {
      const errors = validate(newEmployee);
      if (Object.keys(errors).length > 0) {
        throw new Error("Validation error");
      }

      // Uncomment and modify the fetch request if you have a real API
      // const response = await fetch(`/api/employees/${newEmployee.id}`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(newEmployee),
      // });
      // if (!response.ok) {
      //   throw new Error("Failed to update employee");
      // }
      console.log(newEmployee);

      setSnackbarMessage("Employee updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      return newEmployee;
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Handle row update errors
  const handleRowUpdateError = (params: any) => {
    // Revert changes if necessary
    const updatedEmployees = employees.map((employee) => {
      if (employee.id === params.id) {
        return params.oldRow;
      }
      return employee;
    });

    setEmployees(updatedEmployees);
    setSnackbarMessage("Error updating employee.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
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
          rows={employees}
          columns={columns}
          editMode="row"
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
          checkboxSelection
          disableRowSelectionOnClick
          disableColumnFilter
          disableDensitySelector
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

export default EmployeesDataGrid;
