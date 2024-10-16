"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { companyId } from "../clientComponents/companySideBar";
import Link from "next/link";
import { AutoAwesome, ShoppingBag, Upload } from "@mui/icons-material";
import dayjs from "dayjs";
import { LoadingButton } from "@mui/lab";
import { handleCsvUpload } from "../salaries/csvUpload";
import { SimpleDialog } from "../salaries/inOutTable";

const QuickTools = ({
  user,
}: {
  user: { name: string; email: string; id: string };
}) => {
  const [period, setPeriod] = useState<string>(dayjs().format("YYYY-MM"));
  const [purchased, setPurchased] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [inOut, setInOut] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const checkPurchased = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/purchases/check?companyId=${companyId}&month=${period}`,
          {
            method: "GET",
          }
        );
        try {
          const result = await response.json();
          setPurchased(result?.purchased === "approved");
        } catch (error) {
          console.error("Error parsing JSON or updating state:", error);
          setPurchased(false); // or handle the error state as needed
        }
      } catch (error) {
        console.error("Error fetching salaries:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPurchased();
  }, [period]);

  //handle genAuto
  const handleGenAllAuto = async () => {
    //delay
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  };

  return (
    <Card
      sx={{
        height: "91vh",
        overflowY: "auto",
      }}
    >
      <CardHeader
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Typography variant="h4">Dashboard</Typography>
          </div>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <TextField
                label="Period"
                name="period"
                type="month"
                variant="filled"
                fullWidth
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                //end adormnt button
                InputProps={{
                  endAdornment: !purchased ? (
                    <InputAdornment position="end">
                      <Link
                        href={`/user/mycompanies/${companyId}?companyPageSelect=purchases&newPurchase=true&periods=${
                          period.split("-")[1]
                        }-${period.split("-")[0]}`}
                      >
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<ShoppingBag />}
                        >
                          Purchase
                        </Button>
                      </Link>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <Button
                variant="outlined"
                color="primary"
                component="label"
                startIcon={<Upload />}
              >
                Upload In-Out CSV
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (event) => {
                    if (event.target.files && event.target.files[0]) {
                      const _inOut = await handleCsvUpload(
                        event.target.files[0]
                      );
                      setInOut(_inOut);
                    }
                  }}
                />
              </Button>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              {/* show fetched inout in a dialog */}
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setOpenDialog(true)}
                disabled={!inOut || inOut === ""}
              >
                View In-Out
              </Button>
              {inOut && (
                <SimpleDialog
                  inOutFetched={inOut}
                  openDialog={openDialog}
                  setOpenDialog={setOpenDialog}
                />
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={handleGenAllAuto}
            >
              <span>Generate All Auto</span>
            </LoadingButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickTools;
