"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCancelSubscription } from "@/hooks/use-user";

type CancelSubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CancelSubscriptionDialog({
  open,
  onOpenChange,
}: CancelSubscriptionDialogProps) {
  const cancelSubscriptionMutation = useCancelSubscription();

  const handleConfirmCancel = async () => {
    try {
      await cancelSubscriptionMutation.mutateAsync();
      onOpenChange(false);
    } catch {
      // Toast handled in hook
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-2 inline-flex size-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <AlertTriangle className="size-5" />
          </div>
          <AlertDialogTitle>Cancel your Pro subscription?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Your subscription will be cancelled immediately.</p>
            <p>
              You will retain Pro access until the end of your current billing
              period.
            </p>
            <p>
              After that, your account will revert to the Free plan and you will
              be limited to 3 clients.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="outline"
              disabled={cancelSubscriptionMutation.isPending}
              autoFocus
            >
              Keep My Plan
            </Button>
          </AlertDialogCancel>

          <Button
            type="button"
            onClick={() => void handleConfirmCancel()}
            disabled={cancelSubscriptionMutation.isPending}
            className="gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            {cancelSubscriptionMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel Subscription"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
