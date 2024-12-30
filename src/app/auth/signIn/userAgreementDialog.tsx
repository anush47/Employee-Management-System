import Agreement from "@/app/policies/agreement/agreement";
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
    <Dialog
      fullWidth
      open={openConsentDialog}
      onClose={handleCloseConsentDialog}
    >
      <DialogContent>
        <Agreement />
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
