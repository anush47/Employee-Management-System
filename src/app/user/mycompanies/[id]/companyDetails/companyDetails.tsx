"use client";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Company } from "../../clientComponents/companiesDataGrid";
import { companyId } from "../clientComponents/companySideBar";

const CompanyDetails = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company>();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/companies/one?companyId=${companyId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data = await response.json();
        const companyWithId = { ...data.company, id: data.company._id };
        setCompany(companyWithId);
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

    if (companyId?.length === 24) {
      // Assuming the correct length is 24
      fetchCompanies();
    } else {
      setError("Invalid ID");
    }
  }, [companyId, user]);

  return (
    <Card>
      <CardHeader
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Typography variant="h4">Company Details</Typography>
          </div>
        }
      />
      <CardContent>
        {loading && <CircularProgress />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {
          // Display the company details
          !loading && !error && company && (
            <Box>
              <Typography variant="h5">{company.name}</Typography>
              <Typography variant="body1">{company.employerNo}</Typography>
              <Typography variant="body1">{company.address}</Typography>
            </Box>
          )
        }
      </CardContent>
    </Card>
  );
};

export default CompanyDetails;
