"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLikedPosts } from "@/lib/api/posts";
import { PostGrid } from "@/components/posts/post-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";

export default function LikedPostsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["liked-posts"],
    queryFn: () => getLikedPosts(1),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container-padding py-8 lg:py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 lg:mb-12">
        <Link href="/profile">
          <button className="h-10 w-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold">Liked Posts</h1>
          <p className="text-muted-foreground text-sm">Posts you've shown love to</p>
        </div>
      </div>

      {isLoading ? (
        <PostGrid posts={[]} isLoading={true} />
      ) : error ? (
        <div className="text-center py-16 lg:py-24">
          <p className="text-muted-foreground">Failed to load liked posts</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="text-center py-16 lg:py-24">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl lg:text-2xl font-semibold mb-2">No liked posts yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start exploring and like posts you enjoy!
          </p>
          <Link href="/">
            <Button className="rounded-full px-6">Browse Posts</Button>
          </Link>
        </div>
      ) : (
        <PostGrid posts={data.data} />
      )}
    </div>
  );
}
