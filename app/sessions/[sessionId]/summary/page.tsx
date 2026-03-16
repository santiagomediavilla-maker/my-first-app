"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SummaryRedirect() {
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/sessions/${params.sessionId}`);
  }, [params.sessionId, router]);
  return null;
}
