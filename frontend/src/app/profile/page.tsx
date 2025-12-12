"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, Bookmark, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <nav className="space-y-2">
            <Link href="/profile/likes">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Heart className="h-5 w-5" />
                Liked Posts
              </Button>
            </Link>
            <Link href="/profile/saved">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Bookmark className="h-5 w-5" />
                Saved Posts
              </Button>
            </Link>
            <Link href="/profile/settings">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Settings className="h-5 w-5" />
                Settings
              </Button>
            </Link>
            <Separator className="my-4" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
