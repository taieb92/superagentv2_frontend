"use client";

import { ArrowUpRight, FileText, Mail, TrendingUp, Users } from "lucide-react";

interface DashboardStatsProps {
  userCount: number;
  inviteCount: number;
  contractCount: number;
  avgCompletion: number;
}

export function DashboardStats({
  userCount,
  inviteCount,
  contractCount,
  avgCompletion,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Active Users",
      value: userCount.toString(),
      change: "Live",
      meta: "From Clerk",
      icon: Users,
    },
    {
      title: "Pending Invites",
      value: inviteCount.toString(),
      change: "Pending",
      meta: "Awaiting signup",
      icon: Mail,
    },
    {
      title: "Active Contracts",
      value: contractCount.toString(),
      change: "Total",
      meta: "In system",
      icon: FileText,
    },
    {
      title: "Completion Rate",
      value: `${avgCompletion}%`,
      change: "Avg",
      meta: "Closed vs Total",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="group p-6 bg-white rounded-[10px] border border-[#E5E7EB] hover:border-[#0F766E] transition-all duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-[8px] bg-[#ECFDF5] text-[#0F766E]">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F8F9FB] border border-[#E5E7EB]">
                <span className="text-[11px] font-semibold text-[#0F766E]">
                  {stat.change}
                </span>
                <ArrowUpRight className="h-3 w-3 text-[#0F766E]" />
              </div>
            </div>

            <div>
              <p className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                {stat.title}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-[28px] font-bold text-[#111827] tracking-tight">
                  {stat.value}
                </h3>
                <span className="text-[11px] text-[#9CA3AF]">{stat.meta}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
