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
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Link from "next/link";

// Set dayjs format for consistency
dayjs.locale("en-gb");

export interface Employee {
  id: string;
  designation: string;
  name: string;
  memberNo: number;
  nic: string;
  basic: number;
  divideBy: 240 | 200;
  active: boolean;
  otMethod: string;
  shifts: {
    start: string;
    end: string;
  }[];
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
  resignedAt: Date | string;
  company: string;
}

export const ddmmyyyy_to_mmddyyyy = (ddmmyyyy: string) => {
  const [dd, mm, yyyy] = ddmmyyyy.split("-");
  return `${mm}-${dd}-${yyyy}`;
};

const EmployeesDataGrid: React.FC<{
  user: { id: string; name: string; email: string };
  isEditingEmployeeInHome: boolean;
}> = ({ user, isEditingEmployeeInHome }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const columns: GridColDef[] = [
    {
      field: "employerNo",
      headerName: "Employer No",
      flex: 1,
    },
    {
      field: "company",
      headerName: "Company",
      flex: 1,
    },
    {
      field: "memberNo",
      headerName: "Member No",
      editable: isEditingEmployeeInHome,
      type: "number",
      align: "left",
      headerAlign: "left",
      flex: 1,
      display: "text",
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      editable: isEditingEmployeeInHome,
    },
    {
      field: "nic",
      headerName: "NIC",
      flex: 1,
      editable: isEditingEmployeeInHome,
    },
    {
      field: "basic",
      headerName: "Basic",
      flex: 1,
      editable: isEditingEmployeeInHome,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "startedAt",
      headerName: "Started At",
      flex: 1,
      editable: isEditingEmployeeInHome,
      valueGetter: (params) => {
        // Ensure the date is formatted correctly for display
        return params;
      },
      renderEditCell: (params) => (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <DatePicker
            label="Started At"
            openTo="year"
            views={["year", "month", "day"]}
            value={dayjs(ddmmyyyy_to_mmddyyyy(params.value))}
            onChange={(newDate) => {
              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: newDate ? newDate.format("DD-MM-YYYY") : null,
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
      field: "resignedAt",
      headerName: "Resigned At",
      flex: 1,
      editable: isEditingEmployeeInHome,
      valueGetter: (params) => {
        // Ensure the date is formatted correctly for display
        return params;
      },
      renderEditCell: (params) => (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <DatePicker
            label="Resigned At"
            openTo="year"
            views={["year", "month", "day"]}
            value={dayjs(ddmmyyyy_to_mmddyyyy(params.value))}
            onChange={(newDate) => {
              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: newDate ? newDate.format("DD-MM-YYYY") : null,
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
      field: "active",
      headerName: "Active",
      flex: 1,
      editable: isEditingEmployeeInHome,
      type: "boolean",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Link
          href={`/user/mycompanies/${
            employees.find((employee) => employee.id === params.id)?.company
          }?companyPageSelect=employees&employeeId=${params.id}`}
        >
          <Button variant="text">View</Button>
        </Link>
      ),
    },
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        // Fetch employees data
        const response = await fetch(`/api/employees/many?companyId=all`);
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await response.json();

        // Fetch company names and map them to employees
        const employeesWithCompany = await Promise.all(
          data.employees.map(async (employee: any) => {
            try {
              // Fetch the company name using the company ID
              const companyResponse = await fetch(
                `/api/companies/one?companyId=${employee.company}`
              );
              if (!companyResponse.ok) {
                throw new Error("Failed to fetch company name");
              }
              const companyData = await companyResponse.json();

              // Add the company name to the employee object
              return {
                ...employee,
                id: employee._id,
                company: companyData.company?.name || "Unknown",
                employerNo: companyData.company?.employerNo || "Unknown",
              };
            } catch {
              return {
                ...employee,
                id: employee._id,
                company: "Unknown", // Set "Unknown" if there's an error
                employerNo: "Unknown",
              };
            }
          })
        );

        setEmployees(employeesWithCompany);
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
  }, [user]);

  const validate = (newEmployee: {
    id: string;
    name: string;
    memberNo: string;
    nic: string;
    basic: string;
    company: string;
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
    if (newEmployee.memberNo === null || newEmployee.memberNo === "") {
      errors.memberNo = "Member number is required";
    } else {
      //check if number already exists except this one
      const existingEmployee = employees.find((employee) => {
        return (
          employee.memberNo === parseInt(newEmployee.memberNo) &&
          employee.id !== newEmployee.id &&
          employee.company === newEmployee.company
        );
      });
      if (existingEmployee) {
        errors.memberNo = "Member number already exists";
      }
    }
    if (newEmployee.nic === "") {
      errors.nic = "NIC is required";
    }
    if (newEmployee.basic === "") {
      errors.basic = "Basic salary is required";
    }
    return errors;
  };

  const handleRowUpdate = async (newEmployee: any) => {
    try {
      // Validate the new employee data
      const errors = validate(newEmployee);
      if (Object.keys(errors).length > 0) {
        throw new Error(
          `Validation error in ${newEmployee.memberNo}: ${Object.values(
            errors
          ).join(", ")}`
        );
      }

      // Format data
      newEmployee.name = newEmployee.name.toUpperCase();
      newEmployee.nic = newEmployee.nic.toUpperCase();
      newEmployee.basic = parseFloat(newEmployee.basic);
      try {
        // Perform POST request to update the employee
        const response = await fetch("/api/employees/one", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newEmployee,
            userId: user.id, // Include user ID
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setSnackbarMessage(
            result.message || "Error saving employee. Please try again."
          );
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error saving employee:", error);
        setSnackbarMessage("Error saving employee. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
      // }
      //console.log(newEmployee);

      // Success feedback
      setSnackbarMessage(
        `Employee ${newEmployee.memberNo} - updated successfully!`
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      return newEmployee;
    } catch (error: any) {
      // Add type 'any' to the 'error' object
      // Pass the error details along
      throw {
        message:
          error?.message || "An error occurred while updating the employee.",
        error: error,
      };
    }
  };

  const handleRowUpdateError = (params: any) => {
    // Revert changes if necessary
    const updatedEmployees = employees.map((employee) => {
      if (employee.id === params.id) {
        return params.oldRow; // Revert to old row data
      }
      return employee;
    });

    // Log error and revert row updates
    console.error("Row update error:", params.error?.error || params.error);

    setEmployees(updatedEmployees); // Update state with reverted data

    // Display the error details in Snackbar
    setSnackbarMessage(
      params.error?.message || "An unexpected error occurred." // Show detailed error message
    );
    setSnackbarSeverity("error"); // Set snackbar severity to error
    setSnackbarOpen(true); // Open Snackbar
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

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      id: false,
      startedAt: false,
      resignedAt: false,
      nic: false,
      //company: false,
      employerNo: false,
      _id: false,
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
          //checkboxSelection
          disableRowSelectionOnClick
          disableColumnFilter
          disableDensitySelector
          processRowUpdate={handleRowUpdate}
          onProcessRowUpdateError={handleRowUpdateError}
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

export default EmployeesDataGrid;
