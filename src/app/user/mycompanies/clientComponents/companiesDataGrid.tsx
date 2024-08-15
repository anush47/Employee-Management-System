import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box, Alert, CircularProgress } from "@mui/material";
import { columns } from "./coloumnDefinitions";

export interface Company {
  id: string;
  name: string;
  employerNo: string;
  address: string;
}

const CompaniesDataGrid = ({
  user,
}: {
  user: { id: string; name: string; email: string };
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/companies/many`);
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data = await response.json();
        const companiesWithId = data.companies.map((company: any) => ({
          ...company,
          id: company._id,
        }));
        setCompanies(companiesWithId);
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

    fetchCompanies();
  }, [user]);

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
          checkboxSelection
          disableRowSelectionOnClick
          disableColumnFilter
          disableDensitySelector
        />
      )}
    </Box>
  );
};

export default CompaniesDataGrid;
