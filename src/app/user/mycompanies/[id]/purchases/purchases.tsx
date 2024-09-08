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

// Lazily load PurchasesDataGrid
const PurchasesDataGrid = lazy(() => import("./purchasesDataGrid"));

export let purchaseId: string | null;

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

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleBackClick = () => {
    setIsAdding(false);
  };

  useEffect(() => {
    if (purchaseId) {
      setIsAdding(false);
    }
  }, [purchaseId]);

  return (
    <Box>
      {isAdding ? (
        <Slide direction="left" in={isAdding} mountOnEnter unmountOnExit>
          <Card
            sx={{
              height: "85vh",
              overflowY: "auto",
              "@media (max-width: 600px)": {
                height: "auto",
              },
            }}
          >
            <NewPurchaseForm user={user} handleBackClick={handleBackClick} />
          </Card>
        </Slide>
      ) : (
        <Card
          sx={{
            height: "85vh",
            overflowY: "auto",
            "@media (max-width: 600px)": {
              height: "auto",
            },
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
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddClick}
                  >
                    New Purchase
                  </Button>
                </Tooltip>
              </Box>
            }
          />
          <CardContent>
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
