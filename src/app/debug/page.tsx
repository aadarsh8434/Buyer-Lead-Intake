// app/debug/page.tsx
"use client";
import { useSession } from "next-auth/react";

export default function Debug() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1>Debug Session</h1>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
