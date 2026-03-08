import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Building2, Phone, DoorOpen } from "lucide-react";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-soft hover:opacity-90 transition-opacity">
          {user.name.charAt(0).toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-xl shadow-elevated" align="end">
        <DropdownMenuLabel className="font-semibold">{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" /> {user.mobile}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" /> {user.apartmentName}
        </DropdownMenuItem>
        {user.role === "user" && user.roomNumber && user.floorNumber && (
          <DropdownMenuItem className="gap-2 text-muted-foreground">
            <DoorOpen className="h-4 w-4" /> Room {user.roomNumber}, Floor {user.floorNumber}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-destructive cursor-pointer" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
