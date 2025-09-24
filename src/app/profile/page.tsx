"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { saveUser } from "@/lib/firebase-services";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [primaryColor, setPrimaryColor] = useState("210 29% 29%");
  const [backgroundColor, setBackgroundColor] = useState("210 27% 18%");
  const [accentColor, setAccentColor] = useState("282 44% 47%");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      if (user.theme) {
        setPrimaryColor(user.theme.primary);
        setBackgroundColor(user.theme.background);
        setAccentColor(user.theme.accent);
      }
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [user, router]);

  const handleSave = async () => {
    if (!user) return;

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }
    
    const updatedUser = { 
        ...user, 
        displayName, 
        theme: {
            primary: primaryColor,
            background: backgroundColor,
            accent: accentColor,
        } 
    };
    
    try {
      await saveUser(updatedUser);
      // Update local auth state as well
      login(updatedUser);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Redirect to the notes page
      router.push('/');
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save your profile. Please try again.",
      });
    }
  };

  if (!user) {
    // Render nothing or a loading spinner while redirecting
    return null; 
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <CardDescription>
            Manage your account settings and theme preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input 
              id="new-password" 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground">Customize your app's appearance. Enter HSL values (e.g., 210 40% 98%).</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <Input 
              id="primary-color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="background-color">Background Color</Label>
            <Input 
              id="background-color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="accent-color">Accent Color</Label>
            <Input 
              id="accent-color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
                <Link href="/">Cancel</Link>
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
