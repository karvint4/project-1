import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PaymentRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDetails: any;
  onPayNow: () => void;
}

const PaymentRequestDialog = ({ open, onOpenChange, paymentDetails, onPayNow }: PaymentRequestDialogProps) => {
  if (!paymentDetails) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Work Details</p>
            <p className="text-sm text-foreground mt-1">{paymentDetails.workDetails}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold text-foreground mt-1">₹{paymentDetails.amount}</p>
          </div>
          {paymentDetails.billImage && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Bill Image</p>
              <img src={paymentDetails.billImage} alt="Bill" className="w-full rounded-xl border" />
            </div>
          )}
          <div className="pt-2">
            <Button 
              onClick={onPayNow} 
              className="w-full rounded-xl gradient-primary text-primary-foreground"
            >
              Pay Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRequestDialog;
