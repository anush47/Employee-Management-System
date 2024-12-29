import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
} from "@mui/material";
import React from "react";

interface UserAgreementDialogProps {
  openConsentDialog: boolean;
  handleCloseConsentDialog: () => void;
}

const userAgreementDialog: React.FC<UserAgreementDialogProps> = ({
  openConsentDialog,
  handleCloseConsentDialog,
}) => {
  return (
    <Dialog open={openConsentDialog} onClose={handleCloseConsentDialog}>
      <DialogTitle>User Agreement</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          {/* Add the user agreement content here */}
          This is the user agreement content.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseConsentDialog} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default userAgreementDialog;
