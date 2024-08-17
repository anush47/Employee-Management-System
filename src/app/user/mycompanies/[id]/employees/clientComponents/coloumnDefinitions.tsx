import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import { GridColDef } from "@mui/x-data-grid";
import { Button } from "@mui/material";

// Set dayjs format for consistency
dayjs.locale("en-gb");

const ddmmyyyy_to_mmddyyyy = (ddmmyyyy: {
  split: (arg0: string) => [any, any, any];
}) => {
  const [dd, mm, yyyy] = ddmmyyyy.split("-");
  return `${mm}-${dd}-${yyyy}`;
};

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
    editable: true,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
  {
    field: "startedAt",
    headerName: "Started At",
    flex: 1,
    editable: true,
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
