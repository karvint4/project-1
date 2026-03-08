import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface PaymentProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (profile: any) => void;
  currentProfile?: any;
}

const PaymentProfileDialog = ({ open, onOpenChange, onSave, currentProfile }: PaymentProfileDialogProps) => {
  const [upiId, setUpiId] = useState("");
  const [qrImage, setQrImage] = useState<string>("");
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    if (currentProfile) {
      setUpiId(currentProfile.upiId || "");
      setQrImage(currentProfile.qrImage || "");
      setMobile(currentProfile.mobile || "");
    }
  }, [currentProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ upiId, qrImage, mobile });
    onOpenChange(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setQrImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="mt-1.5 rounded-xl"
              placeholder="yourname@upi"
            />
          </div>
          <div>
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="mt-1.5 rounded-xl"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
          <div>
            <Label htmlFor="qrImage">Payment QR Code</Label>
            <div className="mt-1.5">
              <label htmlFor="qrImage" className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-secondary/50">
                {qrImage ? (
                  <img src={qrImage} alt="QR Code" className="h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-2">Upload QR Code</p>
                  </div>
                )}
              </label>
              <input
                id="qrImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
          <Button type="submit" className="w-full rounded-xl gradient-primary text-primary-foreground">
            Save Payment Profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentProfileDialog;
