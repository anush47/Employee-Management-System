import React from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tooltip,
  Box,
} from "@mui/material";
import CompaniesDataGrid from "./clientComponents/companiesDataGrid";
import { Add } from "@mui/icons-material";

const MyCompanies = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  const handleAddClick = () => {
    // Handle the add button click
    console.log("Add button clicked");
  };

  return (
    <Card>
      <CardHeader
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Typography variant="h4">My Companies</Typography>
            <Tooltip title="Add a new company" arrow>
              <Button
                variant="contained"
                color="success"
                startIcon={<Add />}
                onClick={handleAddClick}
              >
                Add
              </Button>
            </Tooltip>
          </div>
        }
      />
      <CardContent>
        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <CompaniesDataGrid user={user} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default MyCompanies;
