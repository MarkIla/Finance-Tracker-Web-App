"use client";
import { ReactNode } from "react";
import { useAuth } from "../app/lib/auth-context";
import { redirect } from "next/navigation";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    redirect("/login");
  }
  return <>{children}</>;
}
