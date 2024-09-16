import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridToolbar,
} from "@mui/x-data-grid";
import { Box, Alert, CircularProgress, Button } from "@mui/material";
import Link from "next/link";

export interface Company {
  shifts: any;
  id: string;
  name: string;
  employerNo: string;
  address: string;
  mode: string;
  active: boolean;
  paymentMethod: String;
  monthlyPrice: String;
  startedAt: Date | String;
  endedAt: Date | String;
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
}

const CompaniesDataGrid = ({
  user,
}: {
  user: { id: string; name: string; email: string; role: string };
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "employerNo", headerName: "Employer No", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "paymentMethod", headerName: "Payment Method", flex: 1 },
    { field: "active", headerName: "Active", flex: 1, type: "boolean" },
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

  if (user.role === "admin") {
    columns.push(
      { field: "userName", headerName: "User Name", flex: 1 },
      { field: "userEmail", headerName: "User Email", flex: 1 }
    );
  }

  useEffect(() => {
    const fetchCompaniesAndUsers = async () => {
      try {
        setLoading(true);

        // Fetch companies
        const companiesResponse = await fetch(`/api/companies/many`);
        if (!companiesResponse.ok) {
          throw new Error("Failed to fetch companies");
        }
        const companiesData = await companiesResponse.json();

        // Fetch user details for each company
        const companiesWithUserNames = await Promise.all(
          companiesData.companies.map(async (company: any) => {
            // Fetch the user for each company
            if (company.user && user.role === "admin") {
              const userResponse = await fetch(
                `/api/auth/users?user=${company.user}`
              );
              if (!userResponse.ok) {
                throw new Error("Failed to fetch user details");
              }
              const userData = await userResponse.json();
              return {
                ...company,
                id: company._id,
                userName: userData.user.name || "Unknown", // Include the user name
                userEmail: userData.user.email || "Unknown", // Include the user email
              };
            } else {
              return {
                ...company,
                id: company._id,
                userName: "Unknown", // Default for companies without a user
                userEmail: "Unknown", // Default for companies without a user
              };
            }
          })
        );

        setCompanies(companiesWithUserNames);
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

    fetchCompaniesAndUsers();
  }, [user]);

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      id: false,
      _id: false,
      address: false,
      userName: false,
      userEmail: false,
      paymentMethod: false,
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
          rows={companies}
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
          //checkboxSelection
          disableRowSelectionOnClick
          disableColumnFilter
          disableDensitySelector
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
        />
      )}
    </Box>
  );
};

export default CompaniesDataGrid;
