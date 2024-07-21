import React from "react";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import CompaniesDataGrid from "./clientComponents/companiesDataGrid";

const MyCompanies = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  return (
    <Card>
      <CardHeader title={<Typography variant="h4">My Companies</Typography>} />
      <CardContent>
        <CompaniesDataGrid user={user} />
      </CardContent>
    </Card>
  );
};

export default MyCompanies;
