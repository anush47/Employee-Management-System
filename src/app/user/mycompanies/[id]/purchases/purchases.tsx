"use client";
import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tooltip,
  Button,
  Box,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery,
  Slide,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import NewPurchaseForm from "./newPurchaseForm";
import Link from "next/link";
import { companyId } from "../clientComponents/companySideBar";

// Lazily load PurchasesDataGrid
const PurchasesDataGrid = lazy(() => import("./purchasesDataGrid"));

export let purchaseId: string | null;
export let newPurchase: string | null;

const Purchases = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const searchParams = useSearchParams();
  purchaseId = searchParams.get("purchaseId");
  newPurchase = searchParams.get("newPurchase");

  const handleBackClick = () => {
    //go back
    window.history.back();
  };

  useEffect(() => {
    if (newPurchase === "true") {
      setIsAdding(true);
    }
  }, [newPurchase]);

  return (
    <Box>
      {isAdding ? (
        <Slide direction="left" in={isAdding} mountOnEnter unmountOnExit>
          <Card
            sx={{
              height: "91vh",
              overflowY: "auto",
            }}
          >
            <NewPurchaseForm handleBackClick={handleBackClick} />
          </Card>
        </Slide>
      ) : (
        <Card
          sx={{
            minHeight: "91vh",
            overflowY: "auto",
          }}
        >
          <CardHeader
            title={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Typography variant={isSmallScreen ? "h5" : "h4"} gutterBottom>
                  Purchases
                </Typography>
                <Tooltip title="New Purchase" arrow>
                  <Link
                    href={`/user/mycompanies/${companyId}?companyPageSelect=purchases&newPurchase=true`}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Add />}
                    >
                      New Purchase
                    </Button>
                  </Link>
                </Tooltip>
              </Box>
            }
          />
          <CardContent
            sx={{ maxWidth: { xs: "100vw", md: "calc(100vw - 240px)" } }}
          >
            <Suspense fallback={<CircularProgress />}>
              <PurchasesDataGrid user={user} />
            </Suspense>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Purchases;
