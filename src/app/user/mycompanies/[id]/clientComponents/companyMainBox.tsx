"use client";
import React, { Suspense, lazy, useState, useEffect } from "react";
import {
  Box,
  Toolbar,
  LinearProgress,
  CircularProgress,
  Alert,
} from "@mui/material";
import "@fontsource/roboto/400.css";
import { selected } from "./companySideBar";
import { Company } from "../../clientComponents/companiesDataGrid";
import { companyId } from "./companySideBar";

// // Lazy load the components
const CompanyDetails = lazy(() => import("../companyDetails/companyDetails"));
const Employees = lazy(() => import("../employees/employees"));
const Dashboard = lazy(() => import("../dashboard/dashboard"));
const Payments = lazy(() => import("../payments/payments"));
const Salaries = lazy(() => import("../salaries/salaries"));
const Purchases = lazy(() => import("../purchases/purchases"));
const Documents = lazy(() => import("../documents/documents"));

const CompanyMainBox = ({
  user,
}: {
  user: { name: string; email: string; id: string; role: string };
}) => {
  const RenderComponent = () => {
    // Simulate a delay
    return (
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh", // Full viewport height to center vertically
            }}
          >
            <CircularProgress size={80} /> {/* Adjust size as needed */}
          </div>
        }
      >
        <div>
          {(() => {
            switch (selected) {
              case "dashboard":
                return <Dashboard user={user} />;
              case "details":
                return <CompanyDetails user={user} />;
              case "employees":
                return <Employees user={user} />;
              case "payments":
                return <Payments user={user} />;
              case "salaries":
                return <Salaries user={user} />;
              case "purchases":
                return <Purchases user={user} />;
              case "documents":
                return <Documents user={user} />;
              default:
                return <div>Component not found</div>;
            }
          })()}
        </div>
      </Suspense>
    );
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 2,
      }}
    >
      <Toolbar />
      <RenderComponent />
    </Box>
  );
};

export default CompanyMainBox;
