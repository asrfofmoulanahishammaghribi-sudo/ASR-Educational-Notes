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
import { ColorPicker } from "@/components/color-picker";

const PRIMARY_COLORS = [
  "210 29% 29%",
  "262 82% 57%",
  "347 77% 66%",
  "160 60% 45%",
  "30 80% 55%",
  "220 70% 50%",
  "280 65% 60%",
  "340 75% 55%",
];
const BACKGROUND_COLORS = [
  "210 27% 18%",
  "220 13% 18%",
  "215 28% 17%",
  "224 71% 4%",
  "240 10% 4%",
  "220 14% 10%",
  "240 5% 15%",
  "0 0% 8%",
];
const ACCENT_COLORS = [
  "282 44% 47%",
  "262 82% 57%",
  "347 77% 66%",
  "22 96% 54%",
  "142 71% 45%",
  "190 80% 50%",
  "320 70% 60%",
  "50 90% 55%",
];

const FONT_COLORS = [
  "210 40% 98%",
  "210 40% 80%",
  "210 40% 60%",
  "0 0% 100%",
  "220 70% 90%",
  "340 80% 90%",
  "160 60% 85%",
  "50 90% 85%",
];

export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [primaryColor, setPrimaryColor] = useState(PRIMARY_COLORS[0]);
  const [backgroundColor, setBackgroundColor] = useState(BACKGROUND_COLORS[0]);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [noteColor, setNoteColor] = useState(FONT_COLORS[2]);
  const [categoryColor, setCategoryColor] = useState(FONT_COLORS[1]);
  const [subcategoryColor, setSubcategoryColor] = useState(FONT_COLORS[1]);


  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      if (user.theme) {
        setPrimaryColor(user.theme.primary || PRIMARY_COLORS[0]);
        setBackgroundColor(user.theme.background || BACKGROUND_COLORS[0]);
        setAccentColor(user.theme.accent || ACCENT_COLORS[0]);
        setNoteColor(user.theme.note || FONT_COLORS[2]);
        setCategoryColor(user.theme.category || FONT_COLORS[1]);
        setSubcategoryColor(user.theme.subcategory || FONT_COLORS[1]);
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
            note: noteColor,
            category: categoryColor,
            subcategory: subcategoryColor,
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
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
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
            <p className="text-sm text-muted-foreground">Customize your app's appearance.</p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Primary Color</Label>
              <ColorPicker
                  colors={PRIMARY_COLORS}
                  selectedColor={primaryColor}
                  onSelectColor={setPrimaryColor}
                />
            </div>
             <div className="grid gap-2">
              <Label>Background Color</Label>
               <ColorPicker
                  colors={BACKGROUND_COLORS}
                  selectedColor={backgroundColor}
                  onSelectColor={setBackgroundColor}
                />
            </div>
             <div className="grid gap-2">
              <Label>Accent Color</Label>
               <ColorPicker
                  colors={ACCENT_COLORS}
                  selectedColor={accentColor}
                  onSelectColor={setAccentColor}
                />
            </div>
            <Separator/>
             <div className="grid gap-2">
              <Label>Note Font Color</Label>
               <ColorPicker
                  colors={FONT_COLORS}
                  selectedColor={noteColor}
                  onSelectColor={setNoteColor}
                />
            </div>
            <div className="grid gap-2">
              <Label>Category Font Color</Label>
               <ColorPicker
                  colors={FONT_COLORS}
                  selectedColor={categoryColor}
                  onSelectColor={setCategoryColor}
                />
            </div>
            <div className="grid gap-2">
              <Label>Sub-category Font Color</Label>
               <ColorPicker
                  colors={FONT_COLORS}
                  selectedColor={subcategoryColor}
                  onSelectColor={setSubcategoryColor}
                />
            </div>
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
