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
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [user, router]);

  const handleSave = () => {
    if (!user) return;

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }
    
    // In a real app, you would also handle password change logic securely.
    const updatedUser = { ...user, displayName };
    login(updatedUser);

    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });

    // Optionally reset password fields after save
    setNewPassword("");
    setConfirmPassword("");
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
            Manage your account settings.
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
