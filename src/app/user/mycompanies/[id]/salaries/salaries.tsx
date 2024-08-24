"use client";
import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import React from "react";

const Salaries = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  return (
    <Card>
      <CardHeader
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Typography variant="h4">Salaries</Typography>
          </div>
        }
      />
      <CardContent></CardContent>
    </Card>
  );
};

export default Salaries;
