import { Button } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

export const columns: GridColDef[] = [
  { field: "name", headerName: "Name", flex: 1 },
  { field: "employerNo", headerName: "Employer No", flex: 1 },
  { field: "address", headerName: "Address", flex: 1 },
  {
    field: "actions",
    headerName: "Actions",
    flex: 1,
    renderCell: (params) => (
      <Button
        variant="outlined"
        onClick={() => {
          alert(`View company: ${params.row.employerNo}`);
        }}
      >
        View
      </Button>
    ),
  },
];
