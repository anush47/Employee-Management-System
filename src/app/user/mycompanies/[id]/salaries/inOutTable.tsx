import { Autorenew, DeleteOutline, SaveOutlined } from "@mui/icons-material";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridRowSelectionModel,
  GridToolbar,
} from "@mui/x-data-grid";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { inOutCalcOne } from "./csvUpload";

const DateTimeFormat = ({ date }: { date: string }) => {
  const dateObj = dayjs(date.slice(0, 23), "YYYY-MM-DDTHH:mm:ss.SSS");
  const formattedDate = dateObj.format("MM-DD");
  const time = dateObj.format("hh:mm A");

  return (
    <Chip
      label={`${time} | ${formattedDate}`} // Combine time and date with a separator
      variant="outlined" // Use outlined variant for a subtle effect
      color="default"
      style={{
        fontSize: "12px", // Set a smaller font size
        padding: "6px 10px", // Add padding for a better appearance
        borderRadius: "16px", // Rounded corners
        margin: "4px", // Space around the chip
      }}
    />
  );
};

//inout interface
export interface InOut {
  id: any;
  employeeName: string | undefined;
  employeeNIC: string | undefined;
  basic: number;
  divideBy: number;
  in: string;
  out: string;
  workingHours: number;
  otHours: number;
  ot: number;
  noPay: number;
  holiday: string;
  description: string;
}

export const InOutTable = ({
  inOuts,
  setInOuts,
  fetchSalary,
  editable,
}: {
  inOuts: InOut[];
  setInOuts: any;
  fetchSalary: any;
  editable: boolean;
}) => {
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      id: false,
      employeeName: false,
      employeeNIC: false,
      workingHours: false,
      otHours: false,
      description: false,
      delete: false,
    });

  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

  const columns: GridColDef[] = [
    { field: "employeeName", headerName: "Employee", flex: 1 },
    { field: "employeeNIC", headerName: "NIC", flex: 1 },
    {
      field: "in",
      headerName: "In",
      flex: 1,
      editable: editable,
      // Render cell for displaying the formatted date
      renderCell(params) {
        return <DateTimeFormat date={params.value} />;
      },
      renderEditCell(params) {
        // Create a dayjs object from the value without considering timezone
        //remove z and get date and time seperately
        const date = dayjs(
          params.value.slice(0, 23),
          "YYYY-MM-DDTHH:mm:ss.SSS"
        );

        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              // Use the dayjs object directly
              value={date.isValid() ? date : null} // Ensure the value is valid
              onChange={(newDate) => {
                if (newDate && newDate.isValid()) {
                  params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: newDate.format("YYYY-MM-DDTHH:mm:ss.SSS"), // Store the value as a string
                  });
                }
              }}
            />
          </LocalizationProvider>
        );
      },
    },
    {
      field: "out",
      headerName: "Out",
      flex: 1,
      editable: editable,
      // Render cell for displaying the formatted date
      renderCell(params) {
        return <DateTimeFormat date={params.value} />;
      },
      renderEditCell(params) {
        // Create a dayjs object from the value without considering timezone
        //remove z and get date and time seperately
        const date = dayjs(
          params.value.slice(0, 23),
          "YYYY-MM-DDTHH:mm:ss.SSS"
        );

        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              // Use the dayjs object directly
              value={date.isValid() ? date : null} // Ensure the value is valid
              onChange={(newDate) => {
                if (newDate && newDate.isValid()) {
                  params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: newDate.format("YYYY-MM-DDTHH:mm:ss.SSS"), // Store the value as a string
                  });
                }
              }}
            />
          </LocalizationProvider>
        );
      },
    },
    {
      field: "workingHours",
      headerName: "Working Hours",
      flex: 1,
      renderCell(params) {
        return params.value.toFixed(2);
      },
    },
    {
      field: "otHours",
      headerName: "OT Hours",
      flex: 1,
      renderCell(params) {
        return params.value.toFixed(2);
      },
    },
    {
      field: "ot",
      headerName: "OT",
      flex: 1,
      renderCell(params) {
        return params.value.toFixed(2);
      },
    },
    {
      field: "noPay",
      headerName: "No Pay",
      flex: 1,
      renderCell(params) {
        return params.value.toFixed(2);
      },
    },
    {
      field: "holiday",
      headerName: "Holiday",
      flex: 1,
      editable: editable,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      editable: editable,
    },
    {
      //delete
      field: "delete",
      headerName: "Delete",
      renderCell(params) {
        return (
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row.id)} // Show confirmation dialog
            disabled={!editable}
          >
            <DeleteOutline />
          </IconButton>
        );
      },
    },
  ];

  const [edited, setEdited] = useState(false);

  const handleRowUpdate = async (newInOut: any) => {
    try {
      // Ensure 'in' and 'out' fields have 'Z' at the end if not present
      if (!newInOut.in.endsWith("Z")) {
        newInOut.in += "Z";
      }
      if (!newInOut.out.endsWith("Z")) {
        newInOut.out += "Z";
      }

      setEdited(true);

      // Perform the update operation
      const newInOuts = inOuts.map((inOut) => {
        if (inOut.id === newInOut.id) {
          return newInOut;
        }
        return inOut;
      });
      setInOuts(newInOuts);
      return newInOut;
    } catch (error: any) {
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
    const updatedInOuts = inOuts.map((inOut) => {
      if (inOut.id === params.id) {
        return params.oldRow; // Revert to old row data
      }
      return inOut;
    });

    // Log error and revert row updates
    console.error("Row update error:", params.error?.error || params.error);

    //setInOuts(updatedInOuts); // Update state with reverted data
  };

  // State for managing dialog visibility
  const [openDelete, setOpenDelete] = useState(false);

  // State for storing the ids of the items to delete (support for multiple)
  const [deleteIds, setDeleteIds] = useState<(string | null)[]>([]);

  // Handle click for deleting a single row (opens dialog)
  const handleDeleteClick = (id: string | null) => {
    setDeleteIds([id]); // Store single ID in an array
    setOpenDelete(true); // Open the dialog
  };

  // Handle click for deleting multiple rows (opens dialog)
  const handleMultipleDeleteClick = (
    rowSelectionModel: GridRowSelectionModel
  ) => {
    setDeleteIds([...rowSelectionModel] as string[]); // Store multiple selected IDs in the array
    setOpenDelete(true); // Open the dialog
  };

  // Confirm deletion of selected rows (single or multiple)
  const handleConfirmDelete = () => {
    const newInOuts = inOuts.filter((inOut) => !deleteIds.includes(inOut.id));
    setInOuts(newInOuts); // Update the state with filtered data
    setOpenDelete(false); // Close the dialog
  };

  // Close the dialog without deleting anything
  const handleClose = () => {
    setOpenDelete(false); // Close the dialog
  };

  //calculate function
  const handleCalculate = async () => {
    try {
      await fetchSalary(true);
      setEdited(false);
    } catch (error) {
      console.error("Error during calculation:", error);
    }
  };

  return (
    <div
      style={{ height: 400, width: "100%" }}
      className={edited || rowSelectionModel.length > 0 ? "mb-20" : "mb-10"}
    >
      <Typography variant="h6" gutterBottom>
        In-Out Records
      </Typography>
      {editable && rowSelectionModel.length > 0 && (
        <Button
          variant="outlined"
          color="error"
          onClick={
            rowSelectionModel.length === 1
              ? () => handleDeleteClick(rowSelectionModel[0] as string)
              : () => handleMultipleDeleteClick(rowSelectionModel)
          }
          disabled={!editable}
          sx={{
            mb: 1,
            mr: 1,
          }}
          startIcon={
            <DeleteOutline
              style={{ marginRight: "8px" }}
              color="error"
              fontSize="small"
            />
          }
        >
          Delete Selected
        </Button>
      )}
      {edited && (
        <Button
          variant="contained"
          color="success"
          onClick={async () => {
            await handleCalculate();
          }}
          disabled={!editable}
          sx={{
            mb: 1,
          }}
          startIcon={
            <Autorenew style={{ marginRight: "8px" }} fontSize="small" />
          }
        >
          Calculate
        </Button>
      )}
      <DataGrid
        rows={inOuts}
        columns={columns}
        editMode="row"
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
          filter: {
            filterModel: {
              items: [],
              quickFilterExcludeHiddenColumns: false,
            },
          },
        }}
        pageSizeOptions={[5, 10]}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) =>
          setColumnVisibilityModel(newModel)
        }
        processRowUpdate={handleRowUpdate}
        disableRowSelectionOnClick
        disableDensitySelector
        checkboxSelection={editable}
        onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
      />
      {/* Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this record?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export const SimpleDialog = (props: {
  inOutFetched: string | React.ReactNode;
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { inOutFetched, openDialog, setOpenDialog } = props;
  const theme = useTheme();
  //const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      maxWidth={"xl"}
      fullWidth
    >
      <DialogTitle>Fetched In-Out</DialogTitle>
      <DialogContent>
        {typeof inOutFetched === "string"
          ? inOutFetched
              .split("\n")
              .map((line, index) => <Typography key={index}>{line}</Typography>)
          : inOutFetched}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpenDialog(false);
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
