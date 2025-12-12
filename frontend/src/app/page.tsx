"use client";

import { FeedContainer } from "@/components/feed/feed-container";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div className="container-padding py-8" />}> 
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || undefined;
  return <FeedContainer initialSearch={initialSearch} />;
}
