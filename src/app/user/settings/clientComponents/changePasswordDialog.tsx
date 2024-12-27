import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { TransitionProps } from "@mui/material/transitions";
import { Slide } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { LoadingButton } from "@mui/lab";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function ChangePasswordDialog({
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
  const [showNewPassword, setShowNewPassword] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
    setFormVisible(true); // Reset form visibility for the next open
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const oldPassword = formJson.oldPassword as string;
    const newPassword = formJson.newPassword as string;

    try {
      const response = await fetch("/api/auth/changePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred");
      }

      setSuccess("Password changed successfully!");
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
      <DialogTitle>Change Password</DialogTitle>
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
            <DialogContentText>
              To change your password, please enter your current password and
              your new password below.
            </DialogContentText>
            <Box mb={2}>{error && <Alert severity="error">{error}</Alert>}</Box>
            {formVisible && (
              <>
                <TextField
                  autoFocus
                  required
                  margin="dense"
                  id="oldPassword"
                  name="oldPassword"
                  label="Current Password"
                  type={showOldPassword ? "text" : "password"}
                  fullWidth
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        edge="end"
                      >
                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <TextField
                  required
                  margin="dense"
                  id="newPassword"
                  name="newPassword"
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  fullWidth
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
            <span> Change Password</span>
          </LoadingButton>
        </DialogActions>
      )}
    </Dialog>
  );
}
