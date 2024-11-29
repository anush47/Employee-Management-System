"use client";
import { Button, Snackbar, Slide, Alert } from "@mui/material";
import React, { useEffect, useState } from "react";
import { companyId } from "../../clientComponents/companySideBar";

const ABH: React.FC<{
  user: { id: string; name: string; email: string };
  handleBackClick: () => void;
  employeeId: string | null;
}> = ({ user, handleBackClick, employeeId }) => {
  const [employee, setEmployee] = useState(null);
  const [formDetails, setFormDetails] = useState({
    companyId: companyId,
    fullName: "Anushanga Sharada Galappaththi",
    nameWithInitials: "A S Galappaththi",
    nic: "200105902475",
    employerNo: "B/50139",
    memberNo: "1",
    startDate: "28-02-2001",
    designation: "driver",
    address: "238/1, Thunandahena, Korathota, Kaduwela.",
    birthPlace: "Balangoda",
    nationality: "Sinhala",
  });

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "warning" | "error"
  >("success");

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (employeeId) {
      // Fetch employee data
      fetch(`/api/employees/${employeeId}`)
        .then((response) => response.json())
        .then((data) => setEmployee(data))
        .catch((error) =>
          console.error("Error fetching employee data:", error)
        );
    }
  }, [employeeId]);

  const handleGenerateABH = async () => {
    try {
      const response = await fetch(`/api/employees/formA`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDetails),
      });
      if (!response.ok) {
        const data = await response.json();
        setSnackbarMessage(data.message || "Error generating ABH");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      //set download name
      const filename = `formA_${formDetails.nic}.pdf`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      setSnackbarMessage("ABH generated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error generating ABH:", error);
      setSnackbarMessage("Error generating ABH");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <Button onClick={handleGenerateABH}>Generate ABH</Button>
      <div>Employee ID: {employeeId}</div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ABH;
