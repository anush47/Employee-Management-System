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
  requiredDocs:
    | {
        epf: boolean;
        etf: boolean;
        salary: boolean;
        paySlip: boolean;
      }
    | undefined;
  paymentMethod: String;
  monthlyPrice: String;
  employerName: String;
  employerAddress: String;
  startedAt: Date | String;
  endedAt: Date | String;
  workingDays: {
    [key: string]: "full" | "half" | "off";
  };
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
    {
      field: "noOfEmployees",
      headerName: "Employees",
      flex: 1,
    },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "paymentMethod", headerName: "Payment Method", flex: 1 },

    { field: "active", headerName: "Active", flex: 1, type: "boolean" },
    { field: "mode", headerName: "Mode", flex: 1 },
    { field: "monthlyPrice", headerName: "Monthly Price", flex: 1 },
  ];

  if (user.role === "admin") {
    columns.push(
      { field: "userName", headerName: "User Name", flex: 1 },
      { field: "userEmail", headerName: "User Email", flex: 1 }
    );
  }

  columns.push({
    field: "actions",
    headerName: "Actions",
    flex: 1,
    renderCell: (params) => (
      <Link href={`/user/mycompanies/${params.id}?companyPageSelect=quick`}>
        <Button variant="text">View</Button>
      </Link>
    ),
  });

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

        // Create a map to store user details to avoid fetching the same user multiple times
        const userCache: { [key: string]: { name: string; email: string } } =
          {};

        // Fetch user details for each company in parallel
        const userFetchPromises = companiesData.companies.map(
          (company: any) => {
            if (company.user && user.role === "admin") {
              if (userCache[company.user]) {
                return Promise.resolve(userCache[company.user]);
              } else {
                return fetch(`/api/auth/users?user=${company.user}`)
                  .then((res) => {
                    if (!res.ok) {
                      throw new Error("Failed to fetch user details");
                    }
                    return res.json();
                  })
                  .then((userData) => {
                    userCache[company.user] = userData.user;
                    return userData.user;
                  });
              }
            } else {
              return Promise.resolve({ name: "Unknown", email: "Unknown" });
            }
          }
        );

        const usersData = await Promise.all(userFetchPromises);

        const companiesWithUserNames = companiesData.companies.map(
          (company: any, index: number) => ({
            ...company,
            id: company._id,
            userName: usersData[index].name,
            userEmail: usersData[index].email,
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
      mode: false,
      monthlyPrice: false,
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
          pageSizeOptions={[5, 10, 20]}
          slots={{
            toolbar: (props) => (
              <GridToolbar
                {...props}
                csvOptions={{ disableToolbarButton: true }}
                printOptions={{ disableToolbarButton: true }}
              />
            ),
          }}
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
