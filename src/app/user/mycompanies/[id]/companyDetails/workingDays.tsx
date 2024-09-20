import React from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  Typography,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  useTheme,
} from "@mui/material";

interface WorkingDaysProps {
  workingDays: { [key: string]: "full" | "half" | "off" };
  setWorkingDays: (workingDays: {
    [key: string]: "full" | "half" | "off";
  }) => void;
  isEditing: boolean;
}

const daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const WorkingDays = ({
  workingDays,
  setWorkingDays,
  isEditing,
}: WorkingDaysProps) => {
  const theme = useTheme();

  const handleDayChange = (day: string) => {
    const currentValue = workingDays ? workingDays[day] : "off";
    const nextValue =
      currentValue === "full"
        ? "half"
        : currentValue === "half"
        ? "off"
        : "full";
    setWorkingDays({ ...workingDays, [day]: nextValue });
  };

  const getColor = (value: "full" | "half" | "off") => {
    switch (value) {
      case "full":
        return theme.palette.success.main;
      case "half":
        return theme.palette.warning.main;
      case "off":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h5" mb={2}>
            Working Days
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          {daysOfWeek.map((day) => (
            <Grid item xs={12} sm={6} md={4} key={day}>
              <FormControl fullWidth>
                <Tooltip title={workingDays?.[day] ?? "off"}>
                  <>
                    <Button
                      variant="outlined"
                      style={{
                        borderColor: getColor(workingDays?.[day] ?? "off"),
                        color: getColor(workingDays?.[day] ?? "off"),
                      }}
                      onClick={() => handleDayChange(day)}
                      disabled={!isEditing}
                    >
                      {day.toUpperCase()}: {workingDays?.[day] ?? "off"}
                    </Button>
                  </>
                </Tooltip>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
