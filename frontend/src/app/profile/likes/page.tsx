"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLikedPosts } from "@/lib/api/posts";
import { PostGrid } from "@/components/posts/post-grid";
import { PostSkeleton } from "@/components/posts/post-skeleton";
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
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-bold">Liked Posts</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load liked posts</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No liked posts yet</h2>
          <p className="text-muted-foreground mb-4">
            Start exploring and like posts you enjoy!
          </p>
          <Link href="/">
            <Button>Browse Posts</Button>
          </Link>
        </div>
      ) : (
        <PostGrid posts={data.data} />
      )}
    </div>
  );
}
