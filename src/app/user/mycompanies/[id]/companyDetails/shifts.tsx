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
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

interface ShiftsProps {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  shifts: { start: string; end: string }[];
  setShifts: (shifts: { start: string; end: string }[]) => void;
  isEditing: boolean;
}

const validateTime = (value: string) => {
  // Regex to validate time in HH:MM format (24-hour)
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(value);
};

export const Shifts = ({
  handleChange,
  shifts,
  setShifts,
  isEditing,
}: ShiftsProps) => {
  useEffect(() => {
    setShifts(shifts || [{ start: "", end: "" }]);
  }, [shifts]);

  const [errors, setErrors] = React.useState<{
    start: string[];
    end: string[];
  }>({ start: [], end: [] });

  const handleAddField = () => {
    setShifts([...shifts, { start: "", end: "" }]);
    setErrors((prev) => ({
      start: [...prev.start, ""],
      end: [...prev.end, ""],
    }));
  };

  const handleRemoveField = (index: number) => {
    const newShifts = shifts.filter((_, i) => i !== index);
    setShifts(newShifts);
    setErrors((prev) => ({
      start: prev.start.filter((_, i) => i !== index),
      end: prev.end.filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const newShifts = [...shifts];
    const newErrors = { ...errors };

    newShifts[index] = { ...newShifts[index], [field]: value };
    setShifts(newShifts);

    newErrors[field][index] = validateTime(value) ? "" : "Invalid time format";
    setErrors(newErrors);
  };

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h5" mb={2}>
            Shifts
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {shifts &&
              shifts.map((shift, index) => (
                <Grid
                  mb={1}
                  container
                  spacing={2}
                  alignItems="center"
                  key={index}
                >
                  <Grid item xs={5}>
                    <FormControl fullWidth>
                      <TextField
                        label="Start Time"
                        type="text"
                        variant="filled"
                        value={shift.start}
                        onChange={(e) =>
                          handleFieldChange(index, "start", e.target.value)
                        }
                        helperText={errors.start[index]}
                        error={!!errors.start[index]}
                        InputProps={{
                          readOnly: !isEditing,
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={5}>
                    <FormControl fullWidth>
                      <TextField
                        label="End Time"
                        type="text"
                        variant="filled"
                        value={shift.end}
                        onChange={(e) =>
                          handleFieldChange(index, "end", e.target.value)
                        }
                        helperText={errors.end[index]}
                        error={!!errors.end[index]}
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
      </CardContent>
    </Card>
  );
};
