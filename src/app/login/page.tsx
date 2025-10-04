
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
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUser } from "@/lib/firebase-services";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    if (!email) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Please enter your email.",
        });
        return;
    }
    
    // In a real app, you would also validate the password against a backend.
    
    try {
        const userFromDb = await getUser(email);
        
        if (userFromDb) {
            login(userFromDb);
        } else {
            // If user doesn't exist, log them in with a default profile.
            // They can update their details on the profile page.
            login({ displayName: '', email });
        }
        router.push("/");
    } catch (error) {
        console.error("Login error:", error);
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "An error occurred during sign-in. Please try again.",
        });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <Card className="w-full max-w-sm relative">
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email below to sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" onClick={handleSignIn}>Sign In</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
