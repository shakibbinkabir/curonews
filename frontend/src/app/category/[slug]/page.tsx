"use client";

import { useParams } from "next/navigation";
import { FeedContainer } from "@/components/feed/feed-container";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  return <FeedContainer initialCategory={slug} />;
}
