import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { LoadingButton } from "@mui/lab";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function CreateHolidaysDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [formVisible, setFormVisible] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
    if (success) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    setError(null);
    setSuccess(null);
    setFormVisible(true); // Reset form visibility for the next open
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const password = formJson.password as string;
    const email = formJson.email as string;
    const name = formJson.name as string;

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message && data.message.startsWith("E11000")) {
          throw new Error("Email already exists");
        }
        throw new Error(data.message || "An error occurred");
      }

      setSuccess(`${data.user.name} created successfully`);
      setFormVisible(false); // Hide the form inputs
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>Create User</DialogTitle>
      <DialogContent>
        {success ? (
          <>
            <Box mb={2}>
              <Alert severity="success">{success}</Alert>
            </Box>
            <DialogActions>
              <Button onClick={handleClose}>OK</Button>
            </DialogActions>
          </>
        ) : (
          <>
            <Box mb={2}>{error && <Alert severity="error">{error}</Alert>}</Box>
            {formVisible && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  name="name"
                  label="Name"
                  type="text"
                  fullWidth
                  variant="standard"
                />
                <TextField
                  autoFocus
                  margin="dense"
                  id="email"
                  name="email"
                  label="Email"
                  type="text"
                  fullWidth
                  variant="standard"
                />
                <TextField
                  required
                  margin="dense"
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              </>
            )}
          </>
        )}
      </DialogContent>
      {!success && (
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            loading={loading}
            type="submit"
            loadingPosition="center"
          >
            <span> Create User</span>
          </LoadingButton>
        </DialogActions>
      )}
    </Dialog>
  );
}
