"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box, Alert, Button, CircularProgress } from "@mui/material";
import { columns } from "./coloumnDefinitions";

interface Company {
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
        const response = await fetch(`/api/companies/getCompanies`);
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data = await response.json();
        // Map data to include 'id' property
        const companiesWithId = data.companies.map((company: any) => ({
          id: company._id, // Use _id as id
          name: company.name,
          employerNo: company.employerNo,
          address: company.address,
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
          //disableColumnSelector
          disableDensitySelector
        />
      )}
    </Box>
  );
};

export default CompaniesDataGrid;
