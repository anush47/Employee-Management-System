import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridToolbar,
} from "@mui/x-data-grid";
import React from "react";

interface SalaryRecord {
  employeeName: string;
  employeeNIC: string;
  inOut: {
    _id: string;
    in: Date;
    out: Date;
    workingHours: number;
    otHours: number;
    holiday: string;
    ot: number;
    noPay: number;
    description: string;
  }[];
  _id: string;
}

const dateTimeFormat = (dateTime: string | number | Date) => {
  const date = new Date(dateTime);
  const formattedDate = date.toISOString().split("T")[0];
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  const time = hours12 + ":" + minutes + " " + ampm;
  return `${time} ${formattedDate}`;
};

interface InOutTableProps {
  salaryRecords: SalaryRecord[];
}

export const InOutTable = ({ salaryRecords }: InOutTableProps) => {
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      id: false,
      //employeeName: false,
      employeeNIC: false,
    });
  //add id to salaryRecords and expand inOut need one row for one inOut
  let modifiedSalaryRecords = salaryRecords.flatMap((record) =>
    record.inOut.map((inOut, index) => ({
      ...record,
      in: inOut.in,
      out: inOut.out,
      workingHours: inOut.workingHours,
      otHours: inOut.otHours,
      ot: inOut.ot,
      holiday: inOut.holiday,
      noPay: inOut.noPay,
      description: inOut.description,
      id: inOut._id || index,
    }))
  );

  console.log(modifiedSalaryRecords);

  const columns: GridColDef[] = [
    { field: "id", headerName: "In-Out", flex: 1 },
    { field: "employeeName", headerName: "Employee", flex: 1 },
    { field: "employeeNIC", headerName: "NIC", flex: 1 },
    {
      field: "in",
      headerName: "In",
      flex: 1,
      renderCell(params) {
        const time = dateTimeFormat(params.value);
        return time;
      },
    },
    {
      field: "out",
      headerName: "Out",
      flex: 1,
      renderCell(params) {
        const time = dateTimeFormat(params.value);
        return time;
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
    },
    { field: "description", headerName: "Description", flex: 1 },
  ];

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={modifiedSalaryRecords}
        columns={columns}
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
        disableRowSelectionOnClick
      />
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
