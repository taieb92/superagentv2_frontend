"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentUsersProps {
  users?: {
    name: string;
    email: string;
    image: string;
    initial: string;
    createdAt?: string;
  }[];
}

export function RecentUsers({ users = [] }: RecentUsersProps) {
  const displayUsers =
    users.length > 0
      ? users
      : [{ name: "No recent users", email: "-", image: "", initial: "?" }];

  return (
    <Card className="rounded-[10px] border-[#E5E7EB] shadow-none h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-[18px] font-semibold text-[#111827]">
          Recent Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {displayUsers.map((user) => (
            <div key={user.email} className="flex items-center gap-4">
              <Avatar className="h-9 w-9 border border-[#E5E7EB]">
                <AvatarImage src={user.image} />
                <AvatarFallback className="bg-[#F8F9FB] text-[#6B7280] text-[12px] font-medium">
                  {user.initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-[14px] font-semibold text-[#111827] leading-none">
                  {user.name}
                </p>
                <p className="text-[12px] text-[#6B7280]">{user.email}</p>
              </div>
              <div className="text-[11px] text-[#9CA3AF] font-medium uppercase tracking-wider">
                {user.createdAt || "Recent"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
