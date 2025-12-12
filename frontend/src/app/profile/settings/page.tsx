"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Loader2, Eye, EyeOff, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { updateProfile, changePassword } from "@/lib/api/auth";

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile form state
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Messages
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (name !== user?.name) {
        formData.append('name', name);
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      return updateProfile(formData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
      setProfileSuccess(true);
      setProfileError(null);
      setAvatarFile(null);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (error: Error) => {
      setProfileError(error.message);
      setProfileSuccess(false);
    },
  });

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: () => changePassword({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    }),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (error: Error) => {
      setPasswordError(error.message);
      setPasswordSuccess(false);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = () => {
    if (name.trim() === "" || name.trim().length < 2) {
      setProfileError("Name must be at least 2 characters");
      return;
    }
    profileMutation.mutate();
  };

  const handlePasswordChange = () => {
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    passwordMutation.mutate();
  };

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const hasProfileChanges = name !== user.name || avatarFile !== null;
  const canChangePassword = currentPassword && newPassword && confirmPassword;

  return (
    <div className="container-padding py-8 lg:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 lg:mb-12">
          <Link href="/profile">
            <button className="h-10 w-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your account</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <section className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8">
            <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
            
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <Avatar className="h-20 w-20 lg:h-24 lg:w-24">
                  <AvatarImage src={avatarPreview || user.avatar_url || undefined} alt={user.name} />
                  <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "absolute bottom-0 right-0 h-8 w-8 rounded-full",
                    "bg-primary text-primary-foreground",
                    "flex items-center justify-center",
                    "hover:bg-primary/90 transition-colors",
                    "shadow-lg"
                  )}
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-medium">Profile Photo</p>
                <p className="text-sm text-muted-foreground">JPG, PNG. Max 2MB</p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-12 rounded-xl bg-secondary border-0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={user.email}
                  disabled
                  className="h-12 rounded-xl bg-secondary/50 border-0 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>

            {/* Error/Success Messages */}
            {profileError && (
              <div className="mt-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mt-4 p-4 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                <Check className="h-4 w-4" />
                Profile updated successfully
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleProfileSave}
              disabled={!hasProfileChanges || profileMutation.isPending}
              className="mt-6 rounded-full px-6"
            >
              {profileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </section>

          {/* Password Section */}
          <section className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8">
            <h2 className="text-lg font-semibold mb-6">Change Password</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 rounded-xl bg-secondary border-0 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 rounded-xl bg-secondary border-0 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl bg-secondary border-0"
                />
              </div>
            </div>

            {/* Error/Success Messages */}
            {passwordError && (
              <div className="mt-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mt-4 p-4 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                <Check className="h-4 w-4" />
                Password changed successfully
              </div>
            )}

            <Button
              onClick={handlePasswordChange}
              disabled={!canChangePassword || passwordMutation.isPending}
              className="mt-6 rounded-full px-6"
            >
              {passwordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </section>

          {/* Danger Zone */}
          <section className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-destructive/20">
            <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive" className="rounded-full px-6" disabled>
              Delete Account
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
