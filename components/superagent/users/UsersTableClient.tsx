"use client";

import { Pagination } from "@/components/superagent/ui/Pagination";
import { UserActionsMenu } from "@/components/superagent/users/UserActionsMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";
import { NormalizedUser } from "@/lib/utils/clerk";
import { format } from "date-fns";
import {
  Calendar,
  Filter,
  Mail,
  Search,
  Shield,
  User as UserIcon,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface UsersTableClientProps {
  initialUsers: NormalizedUser[];
}

export function UsersTableClient({ initialUsers }: UsersTableClientProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Filtering logic
  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [initialUsers, search, roleFilter, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = currentPage * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const isFiltered =
    search !== "" || roleFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              className="pl-10 h-10 bg-white border-[#E5E7EB] rounded-none text-[14px] focus:ring-[#0F766E] focus:border-[#0F766E]"
            />
          </div>
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-10 px-3 text-[#6B7280] hover:text-[#111827] text-[13px] font-medium transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="w-full md:w-[140px] h-10 bg-white border-[#E5E7EB] rounded-none text-[13px] font-medium text-[#4B5563]">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-[#9CA3AF]" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E5E7EB] rounded-none">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="deactivated">Deactivated</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="uninvited">Uninvited</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val);
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="w-full md:w-[140px] h-10 bg-white border-[#E5E7EB] rounded-none text-[13px] font-medium text-[#4B5563]">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-[#9CA3AF]" />
                <SelectValue placeholder="Role" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E5E7EB] rounded-none">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
              <SelectItem value={UserRole.AGENT}>Agent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-none overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-[#F8F9FB] p-4 rounded-none mb-3">
                        <UserIcon className="h-6 w-6 text-[#9CA3AF]" />
                      </div>
                      <p className="text-[14px] font-semibold text-[#111827]">
                        {isFiltered
                          ? "No users found matching filters"
                          : "No users found"}
                      </p>
                      <p className="text-[13px] text-[#6B7280] mt-1">
                        {isFiltered
                          ? "Try clearing your search or filters"
                          : "There are no users registered in the system yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-[#F8F9FB] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-[#E5E7EB]">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-[#F3F4F6] text-[#6B7280] text-[12px] font-semibold">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-[#111827] truncate">
                            {user.name}
                          </div>
                          <div className="text-[12px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "p-1.5 rounded-none",
                            user.role === "ADMIN"
                              ? "bg-[#F5F3FF] text-[#7C3AED]"
                              : "bg-[#F3F4F6] text-[#6B7280]"
                          )}
                        >
                          {user.role === "ADMIN" ? (
                            <Shield className="h-3.5 w-3.5" />
                          ) : (
                            <UserIcon className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span className="text-[13px] font-medium text-[#4B5563]">
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <UserStatusPill status={user.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] text-[#111827]">
                          {format(new Date(user.joinedAt), "MMM d, yyyy")}
                        </span>
                        <span className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {user.type === "invite" ? "Invited" : "Joined"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <UserActionsMenu
                          user={{
                            id: user.id,
                            role: user.role,
                            status: user.status,
                            name: user.name,
                            type: user.type,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 0 && (
          <div className="px-6 py-4 border-t border-[#E5E7EB]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function UserStatusPill({ status }: { status: string }) {
  const isInvite = status === "invited";
  const isActive = status === "active";
  const isDeactivated = status === "deactivated" || status === "banned";
  const isUninvited = status === "uninvited";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
        isActive && "bg-[#ECFDF5] text-[#0F766E] border-[#0F766E]/20",
        isInvite && "bg-[#EFF6FF] text-[#1D4ED8] border-[#1D4ED8]/20",
        (isDeactivated || isUninvited) &&
          "bg-[#FEF2F2] text-[#B91C1C] border-[#B91C1C]/20"
      )}
    >
      {status}
    </span>
  );
}
