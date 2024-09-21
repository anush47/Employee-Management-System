import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import React from "react";

const GenerateSalaryAll = ({ period }: { period: string }) => {
  return (
    <>
      <Card>
        <CardHeader
          title="Generate All"
          subheader={`Generate all salaries for ${period}`}
        />
        <CardContent>
          <Typography>
            Generate all salaries for the period: <strong>{period}</strong>
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default GenerateSalaryAll;
