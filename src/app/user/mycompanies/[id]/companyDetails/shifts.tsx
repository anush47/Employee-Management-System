"use client";
import React, { useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  TextField,
  Typography,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Add, ExpandMore, Remove } from "@mui/icons-material";

interface ShiftsProps {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  shifts: { start: string; end: string; break: number }[];
  setShifts: (shifts: { start: string; end: string; break: number }[]) => void;
  isEditing: boolean;
}

const formatTime = (value: string) => {
  // Format time to HH:MM if necessary
  const [hours, minutes] = value.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

export const Shifts = ({
  handleChange,
  shifts,
  setShifts,
  isEditing,
}: ShiftsProps) => {
  useEffect(() => {
    setShifts(shifts || [{ start: "", end: "", break: 0 }]);
  }, [shifts]);

  const [errors, setErrors] = React.useState<{
    start: string[];
    end: string[];
    break: string[];
  }>({ start: [], end: [], break: [] });

  const handleAddField = () => {
    setShifts([...shifts, { start: "", end: "", break: 1 }]);
    setErrors((prev) => ({
      start: [...prev.start, ""],
      end: [...prev.end, ""],
      break: [...prev.break, ""],
    }));
  };

  const handleRemoveField = (index: number) => {
    const newShifts = shifts.filter((_, i) => i !== index);
    setShifts(newShifts);
    setErrors((prev) => ({
      start: prev.start.filter((_, i) => i !== index),
      end: prev.end.filter((_, i) => i !== index),
      break: prev.break.filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (
    index: number,
    field: "start" | "end" | "break",
    value: string | number
  ) => {
    const newShifts = [...shifts];
    if (field === "break") {
      value = Number(value);
    } else {
      value = formatTime(value as string);
    }

    newShifts[index] = { ...newShifts[index], [field]: value };
    setShifts(newShifts);
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography variant="h5">Shifts</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {shifts &&
              shifts.map((shift, index) => (
                <Grid
                  mb={1}
                  container
                  columnSpacing={2}
                  rowSpacing={1}
                  alignItems="center"
                  key={index}
                >
                  <Grid item xs={12}>
                    <Typography>Shift {index + 1}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <TextField
                        label="Start Time"
                        type="time"
                        variant="filled"
                        value={shift.start}
                        onChange={(e) =>
                          handleFieldChange(index, "start", e.target.value)
                        }
                        InputProps={{
                          readOnly: !isEditing,
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <TextField
                        label="End Time"
                        type="time"
                        variant="filled"
                        value={shift.end}
                        onChange={(e) =>
                          handleFieldChange(index, "end", e.target.value)
                        }
                        InputProps={{
                          readOnly: !isEditing,
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <TextField
                        label="Break Hours"
                        type="number"
                        variant="filled"
                        value={shift.break}
                        onChange={(e) =>
                          handleFieldChange(index, "break", e.target.value)
                        }
                        InputProps={{
                          readOnly: !isEditing,
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={2}>
                    {isEditing && (
                      <Tooltip title="Remove" arrow>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveField(index)}
                        >
                          <Remove />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              ))}
            {isEditing && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddField}
              >
                Add Shift
              </Button>
            )}
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
