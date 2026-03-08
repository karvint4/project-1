import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { problemCategories } from "@/data/problemCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ArrowLeft, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const NewProblemPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, addIssue, canAddIssue } = useAuth();

  const preselected = searchParams.get("category") || "";
  const [category, setCategory] = useState(preselected);
  const [scope, setScope] = useState<"personal" | "common">("personal");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");

  const selectedCat = problemCategories.find((c) => c.id === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description) {
      toast({ title: "Missing fields", description: "Please select a category and add a description.", variant: "destructive" });
      return;
    }
    if (scope === "personal" && !scheduledDate) {
      toast({ title: "Schedule required", description: "Please select a date and time for the worker visit.", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Error", description: "You must be logged in to report an issue.", variant: "destructive" });
      return;
    }

    if (!canAddIssue(user.id)) {
      toast({ title: "Limit Reached", description: "You can only have 3 active issues. Complete an existing issue first.", variant: "destructive" });
      return;
    }

    const newIssue = {
      id: "issue_" + Date.now(),
      category,
      description,
      imageUrl: image ? URL.createObjectURL(image) : "",
      scope,
      status: "waiting",
      scheduledDate: scope === "personal" ? scheduledDate : undefined,
      paymentStatus: "none",
      createdBy: user.id,
      createdByName: user.name,
      apartmentId: user.apartmentServerId || "",
      serverId: user.apartmentServerId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const success = addIssue(newIssue);
    if (success) {
      toast({ title: "Issue Reported! ✅", description: "Your issue has been submitted. Track it in My Issues." });
      navigate("/home");
    } else {
      toast({ title: "Error", description: "Failed to submit issue. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-6">Report a Problem</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Issue Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {problemCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-soft"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${cat.color}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scope */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Problem Scope</Label>
            <div className="flex gap-3">
              {(["personal", "common"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium capitalize transition-all duration-200 ${
                    scope === s
                      ? "border-primary bg-primary/10 text-primary shadow-soft"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="desc" className="text-sm font-medium">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="mt-1.5 rounded-xl min-h-[100px]"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium">Upload Image</Label>
            <label className="mt-1.5 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/40 transition-colors bg-secondary/30">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {image ? image.name : "Click to upload a photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Schedule (Personal only) */}
          {scope === "personal" && (
            <div>
              <Label htmlFor="schedule" className="text-sm font-medium">Schedule Worker Visit</Label>
              <div className="relative mt-1.5">
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full rounded-xl gradient-primary text-primary-foreground h-12 text-base">
            Submit Issue
          </Button>
        </form>
      </main>
    </div>
  );
};

export default NewProblemPage;
