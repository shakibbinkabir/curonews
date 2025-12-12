"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bookmark, Settings, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

  const menuItems = [
    {
      href: "/profile/likes",
      icon: Heart,
      label: "Liked Posts",
      description: "Posts you've liked",
    },
    {
      href: "/profile/saved",
      icon: Bookmark,
      label: "Saved Posts",
      description: "Posts you've saved for later",
    },
    {
      href: "/profile/settings",
      icon: Settings,
      label: "Settings",
      description: "Manage your account",
    },
  ];

  return (
    <div className="container-padding py-8 lg:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <Avatar className="h-24 w-24 lg:h-32 lg:w-32 mx-auto mb-6 ring-4 ring-background shadow-xl">
            <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
            <AvatarFallback className="text-2xl lg:text-3xl font-semibold bg-primary text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl lg:text-3xl font-semibold mb-2">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-4 lg:p-5 rounded-2xl",
                "bg-card hover:bg-secondary/50",
                "transition-all duration-200",
                "group"
              )}
            >
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}

          {/* Sign Out */}
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className={cn(
              "flex items-center gap-4 p-4 lg:p-5 rounded-2xl w-full",
              "bg-card hover:bg-destructive/10",
              "transition-all duration-200",
              "group text-left"
            )}
          >
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-destructive">Sign Out</p>
              <p className="text-sm text-muted-foreground">Log out of your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
