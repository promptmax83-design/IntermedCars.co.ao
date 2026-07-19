"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SessionChat from "@/components/intermediation/SessionChat";

function getUserIdFromToken(): number | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id || payload.id || null;
  } catch {
    return null;
  }
}

function getUserRoleFromToken(): string {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "user";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "user";
  } catch {
    return "user";
  }
}

export default function SessaoPage() {
  const params = useParams();
  const router = useRouter();
  const sessaoId = Number(params.id);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const id = getUserIdFromToken();
    const role = getUserRoleFromToken();
    setUserId(id);
    setUserRole(role);

    if (!id) {
      router.push("/login");
    }
  }, [router]);

  if (!userId || !sessaoId) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8F9FA] flex flex-col">
      <SessionChat
        sessaoId={sessaoId}
        currentUserId={userId}
        currentUserRole={userRole}
      />
    </div>
  );
}
