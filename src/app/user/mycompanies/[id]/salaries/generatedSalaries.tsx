import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridToolbar,
} from "@mui/x-data-grid";
import Link from "next/link";
import React, { useState } from "react";
import { companyId } from "../clientComponents/companySideBar";
import { LoadingButton } from "@mui/lab";
import { Salary } from "./salariesDataGrid";

interface GeneratedSalariesProps {
  generatedSalaries: Salary[];
  setGeneratedSalaries: React.Dispatch<React.SetStateAction<Salary[]>>;
  error: string | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GeneratedSalaries: React.FC<GeneratedSalariesProps> = ({
  generatedSalaries,
  setGeneratedSalaries,
  error,
  loading,
  setLoading,
}) => {
  const columns: GridColDef[] = [
    {
      field: "memberNo",
      headerName: "Member No",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "nic",
      headerName: "NIC",
      flex: 1,
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
      editable: true,
    },
    {
      field: "ot",
      headerName: "OT",
      type: "number",
      flex: 1,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "otReason",
      headerName: "OT Reason",
      flex: 1,
      editable: true,
    },
    {
      field: "noPay",
      headerName: "No Pay",
      type: "number",
      flex: 1,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "noPayReason",
      headerName: "No Pay Reason",
      flex: 1,
      editable: true,
    },
    {
      field: "paymentStructure",
      headerName: "Payment Structure",
      flex: 1,
      renderCell: (params) => {
        const value = params.value;
        if (typeof value === "object") {
          const additions = value.additions.map(
            (addition: { name: string; amount: number }) =>
              `${addition.name}: ${addition.amount}`
          );
          const deductions = value.deductions.map(
            (deduction: { name: string; amount: number }) =>
              `${deduction.name}: ${deduction.amount}`
          );
          return [...additions, ...deductions].join(", ");
        }
        return value;
      },
    },
    {
      field: "advanceAmount",
      headerName: "Advance",
      type: "number",
      flex: 1,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "finalSalary",
      headerName: "Final Salary",
      type: "number",
      flex: 1,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "delete",
      headerName: "Delete",
      flex: 1,
      renderCell: (params) => {
        return (
          <Button
            variant="text"
            color="error"
            size="small"
            onClick={() => {
              handleDeleteClick(params.id.toString());
            }}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      id: false,
      basic: false,
      otReason: false,
      noPayReason: false,
      nic: false,
      delete: false,
      paymentStructure: false,
    });

  const handleRowUpdate = async (newSalary: any) => {
    try {
      // Validate the new employee data
      const errors: { [key: string]: string } = {};
      if (!newSalary.basic) {
        errors.basic = "Basic Salary is required";
      }
      if (!newSalary.finalSalary) {
        errors.finalSalary = "Final Salary is required";
      }

      if (Object.keys(errors).length > 0) {
        throw new Error(
          `Validation error in ${newSalary.period}: ${Object.values(
            errors
          ).join(", ")}`
        );
      }
      console.log(newSalary);

      // Format data
      newSalary.basic = parseFloat(newSalary.basic);
      newSalary.ot = {
        amount: parseFloat(newSalary.ot),
        reason: newSalary.otReason,
      };
      newSalary.noPay = {
        amount: parseFloat(newSalary.noPay),
        reason: newSalary.noPayReason,
      };
      newSalary.advanceAmount = parseFloat(newSalary.advanceAmount);
      console.log(newSalary);
      // Calculate total additions
      const totalAdditions = newSalary.paymentStructure.additions.reduce(
        (total: number, addition: { amount: number }) =>
          total + addition.amount,
        0
      );

      // Calculate total deductions
      const totalDeductions = newSalary.paymentStructure.deductions.reduce(
        (total: number, deduction: { amount: number }) =>
          total + deduction.amount,
        0
      );

      // Calculate final salary with payment structures
      newSalary.finalSalary =
        newSalary.basic +
        newSalary.ot.amount -
        newSalary.noPay.amount -
        newSalary.advanceAmount +
        totalAdditions -
        totalDeductions;

      const body = {
        ...newSalary,
        ot: newSalary.ot,
        noPay: newSalary.noPay,
      };

      // Perform POST request to update the employee
      const response = await fetch("/api/salaries", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      //reset newsalary

      newSalary.ot = newSalary.ot.amount;
      newSalary.noPay = newSalary.noPay.amount;

      // }
      //console.log(newEmployee);

      return newSalary;
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
    const updatedSalaries = generatedSalaries.map((salary: { id: any }) => {
      if (salary.id === params.id) {
        return params.oldRow; // Revert to old row data
      }
      return salary;
    });

    // Log error and revert row updates
    console.error("Row update error:", params.error?.error || params.error);

    setGeneratedSalaries(updatedSalaries); // Update state with reverted data
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [salaryId, setSalaryId] = useState("");

  const handleDeleteClick = (salayId: string) => {
    setSalaryId(salayId);
    setDialogOpen(true);
  };

  const handleDialogClose = async (confirmed: boolean) => {
    if (confirmed) {
      // Perform the delete action here
      console.log(`Deleting salary record`);
      await onDeleteClick(salaryId);
    }
    setDialogOpen(false);
  };

  interface ConfirmationDialogProps {
    open: boolean;
    onClose: (confirmed: boolean) => void;
    title: string;
    message: string;
  }

  const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onClose,
    title,
    message,
  }) => {
    const handleConfirm = () => {
      onClose(true);
    };

    const handleCancel = () => {
      onClose(false);
    };

    return (
      <Dialog open={open} onClose={() => onClose(false)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <LoadingButton
            onClick={handleConfirm}
            color="primary"
            loading={loading}
          >
            Confirm
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  };

  const onDeleteClick = async (salaryId: string) => {
    setLoading(true);
    // Perform DELETE request to delete the salary record
    const response = await fetch(`/api/salaries/?salaryId=${salaryId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (response.ok) {
      // Wait before clearing the form
      await new Promise((resolve) => setTimeout(resolve, 200));
      //remove row
      setGeneratedSalaries(
        generatedSalaries.filter((salary) => salary.id !== salaryId)
      );
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader title={"Generated Salaries"} />
      <CardContent>
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
              rows={generatedSalaries}
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
          <ConfirmationDialog
            open={dialogOpen}
            onClose={handleDialogClose}
            title="Confirm Deletion"
            message={`Are you sure you want to delete the salary record?`}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default GeneratedSalaries;
