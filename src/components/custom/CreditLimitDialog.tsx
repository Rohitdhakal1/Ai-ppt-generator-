import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  openAlert: boolean;
  onOpenChange: (open: boolean) => void;
};

function CreditLimitDialog({ openAlert, onOpenChange }: Props) {
  return (
    <AlertDialog open={openAlert} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Insufficient Credits</AlertDialogTitle>
          <AlertDialogDescription>
            You don't have enough credits to generate slides. Please purchase more credits to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Close
          </AlertDialogCancel>

          {/* Force absolute navigation so router doesn't make the path relative */}
          <AlertDialogAction
            onClick={() => {
              onOpenChange(false);
              window.location.href = "/workspace/pricing";
            }}
          >
            Buy Credits
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CreditLimitDialog;
