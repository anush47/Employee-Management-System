import { Button } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import Link from "next/link";

export const columns: GridColDef[] = [
  { field: "_id", headerName: "ID", flex: 1 },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "employerNo", headerName: "Employer No", flex: 1 },
  { field: "address", headerName: "Address", flex: 1 },
  { field: "paymentMethod", headerName: "Payment Method", flex: 1 },
  {
    field: "actions",
    headerName: "Actions",
    flex: 1,
    renderCell: (params) => (
      <Link href={`/user/mycompanies/${params.id}/`}>
        <Button variant="text">View</Button>
      </Link>
    ),
  },
];
