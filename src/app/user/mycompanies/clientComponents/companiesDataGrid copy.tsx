import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Box,
  Alert,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { Business, Cancel, CheckCircle, People } from "@mui/icons-material";

export interface Company {
  shifts: any;
  id: string;
  name: string;
  employerNo: string;
  address: string;
  mode: string;
  active: boolean;
  noOfEmployees: number;
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

const normalizeString = (str: string) =>
  str.replace(/[\s\W_]+/g, "").toLowerCase();

const CompaniesCards = ({
  user,
}: {
  user: { id: string; name: string; email: string; role: string };
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredCompanies = companies.filter(
    (company) =>
      normalizeString(company.name).includes(normalizeString(searchQuery)) ||
      normalizeString(company.employerNo).includes(normalizeString(searchQuery))
  );

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
        console.log(companiesData);

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
  const CompanyCard = ({ company }: { company: Company }) => {
    return (
      <Card
        sx={{
          height: "auto",
          marginBottom: 2,
          borderRadius: 2,
          boxShadow: 2,
          padding: 1,
          backgroundColor: (theme) =>
            theme.palette.mode === "light" ? "#f9f9f9" : "#222222", // Light and dark mode background colors
          transition: "transform 0.2s, background-color 0.2s",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: 4,
          },
        }}
      >
        <CardHeader
          avatar={<Business sx={{ fontSize: 36, color: "primary.main" }} />}
          title={
            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: "text.primary" }}
            >
              {company.name}
            </Typography>
          }
        />
        <CardContent>
          <Stack spacing={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "500", color: "text.secondary" }}
              >
                Employer No: {company.employerNo}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <People sx={{ color: "primary.main" }} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Employees: {company.noOfEmployees}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {company.active ? (
                <Chip
                  icon={<CheckCircle sx={{ color: "success.main" }} />}
                  label="Active"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<Cancel sx={{ color: "error.main" }} />}
                  label="Inactive"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "400",
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
        <>
          <TextField
            label="Search Companies"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Grid container spacing={3}>
            {filteredCompanies.map((company) => (
              <Grid item xs={12} sm={6} md={4} key={company.id}>
                <Link
                  href={`/user/mycompanies/${company.id}?companyPageSelect=quick`}
                >
                  <CompanyCard company={company} />
                </Link>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default CompaniesCards;
