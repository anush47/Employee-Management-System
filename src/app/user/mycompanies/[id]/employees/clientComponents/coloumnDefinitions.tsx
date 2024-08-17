import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Link from "next/link";
import dayjs from "dayjs";

import { GridColDef } from "@mui/x-data-grid";
import { Button } from "@mui/material";
export const columns: GridColDef[] = [
  {
    field: "memberNo",
    headerName: "Member No",
    editable: true,
    type: "number",
    align: "left",
    headerAlign: "left",
    flex: 1,
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1,
    editable: true,
  },
  {
    field: "nic",
    headerName: "NIC",
    flex: 1,
    editable: true,
  },
  {
    field: "basic",
    headerName: "Basic",
    flex: 1,
  },
  {
    field: "startedAt",
    headerName: "Started At",
    flex: 1,
    editable: true,
    renderEditCell: (params) => (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        <DatePicker
          label="Started At"
          openTo="year"
          views={["year", "month", "day"]}
          value={dayjs(params.value)}
          onChange={(newDate) => {
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: newDate?.format("DD-MM-YYYY") as string,
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
