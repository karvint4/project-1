import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

interface PaymentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (details: any) => void;
}

const PaymentDetailsDialog = ({ open, onOpenChange, onSubmit }: PaymentDetailsDialogProps) => {
  const [workDetails, setWorkDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [billImage, setBillImage] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ workDetails, amount, billImage });
    setWorkDetails("");
    setAmount("");
    setBillImage("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBillImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Payment Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="workDetails">Work Details</Label>
            <Textarea
              id="workDetails"
              value={workDetails}
              onChange={(e) => setWorkDetails(e.target.value)}
              className="mt-1.5 rounded-xl"
              placeholder="Describe the work completed..."
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 rounded-xl"
              placeholder="Enter amount"
              required
            />
          </div>
          <div>
            <Label htmlFor="billImage">Upload Bill Image</Label>
            <div className="mt-1.5">
              <label htmlFor="billImage" className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-secondary/50">
                {billImage ? (
                  <img src={billImage} alt="Bill" className="h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-2">Click to upload</p>
                  </div>
                )}
              </label>
              <input
                id="billImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
          <Button type="submit" className="w-full rounded-xl gradient-primary text-primary-foreground">
            Send Payment Details
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsDialog;
