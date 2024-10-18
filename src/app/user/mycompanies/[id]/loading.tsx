import React from "react";
import { LinearProgress } from "@mui/material";

const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh", // Full viewport height to center vertically
        width: "100%", // Full width to center horizontally
      }}
    >
      <div style={{ width: "80%", maxWidth: "800px" }}>
        {/* Adjust width as needed */}
        <LinearProgress
          sx={{ height: 10 }} // Adjust height as needed
        />
      </div>
    </div>
  );
};

export default Loading;
