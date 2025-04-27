"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/portfolio");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <p className="text-lg text-gray-500">Redirecting to portfolio...</p>
    </div>
  );
}
