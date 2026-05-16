// components/ProfileIcon.tsx
"use client";
import { UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientForClientComponent } from "@/lib/supabase/client";

interface ProfileIconProps {
  size?: number;
  className?: string;
}

import type { User } from "@supabase/supabase-js";

export default function ProfileIcon() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createClientForClientComponent();
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleProfileClick = (e: React.MouseEvent) => {
    if (loading) return;

    if (user) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleProfileClick}
      className="relative rounded-full hover:bg-gray-100 transition-colors cursor-pointer block"
      aria-label={user ? "Profile" : "Login"}
    >
      <UserCircle size={32} className="text-gray-700 shrink-0" />
    </button>
  );
}
