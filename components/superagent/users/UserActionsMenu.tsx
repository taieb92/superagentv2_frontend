"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteUser,
  revokeInvitation,
  toggleUserStatus,
  updateUserRole,
} from "@/lib/actions/users";
import { UserRole, type UserRoleType } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";
import {
  Loader2,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { platformStatus } from "@/lib/utils/clerk";

interface UserActionsMenuProps {
  user: {
    id: string;
    role: UserRoleType;
    status: platformStatus;
    name: string;
    type?: "user" | "invite";
  };
}

export function UserActionsMenu({ user }: UserActionsMenuProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    "deactivate" | "activate" | "delete" | null
  >(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRoleUpdate = async (newRole: UserRoleType) => {
    if (newRole === user.role) return;
    setIsLoading(true);
    const res = await updateUserRole(user.id, newRole);
    setIsLoading(false);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const handleStatusAction = async () => {
    if (!dialogType) return;
    setIsLoading(true);

    let res;
    if (dialogType === "delete") {
      res =
        user.type === "invite"
          ? await revokeInvitation(user.id)
          : await deleteUser(user.id);
    } else {
      const currentlyInactive =
        user.status === "banned" ||
        user.status === "deactivated" ||
        user.status === "uninvited";
      res = await toggleUserStatus(user.id, currentlyInactive);
    }

    setIsLoading(false);
    setDialogOpen(false);

    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const openConfirmDialog = (type: "deactivate" | "activate" | "delete") => {
    setDialogType(type);
    setDialogOpen(true);
  };

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-zinc-400"
        disabled
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 transition-colors data-[state=open]:bg-zinc-100 data-[state=open]:text-zinc-900"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[200px] p-1 bg-white border border-zinc-200 shadow-xl"
        >
          <DropdownMenuLabel className="text-xs font-medium text-zinc-500 px-2 py-1.5">
            User Actions
          </DropdownMenuLabel>

          {user.type !== "invite" && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-none px-2 py-1.5 text-sm cursor-pointer text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900">
                <Shield className="mr-2 h-4 w-4 text-zinc-500" />
                <span>Change Role</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-1 bg-white border border-zinc-200 shadow-xl">
                <DropdownMenuRadioGroup
                  value={user.role}
                  onValueChange={(v) => handleRoleUpdate(v as UserRoleType)}
                >
                  <DropdownMenuRadioItem
                    value={UserRole.ADMIN}
                    className="cursor-pointer rounded-none text-zinc-700 focus:bg-zinc-100 focus:text-zinc-900"
                  >
                    <Shield className="mr-2 h-4 w-4 text-purple-600" />
                    Admin
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value={UserRole.AGENT}
                    className="cursor-pointer rounded-none text-zinc-700 focus:bg-zinc-100 focus:text-zinc-900"
                  >
                    <UserCheck className="mr-2 h-4 w-4 text-zinc-500" />
                    Agent
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          <DropdownMenuSeparator className="my-1 bg-zinc-100" />

          {user.type !== "invite" &&
            (user.status === "banned" ||
            user.status === "deactivated" ||
            user.status === "uninvited" ? (
              <DropdownMenuItem
                onClick={() => openConfirmDialog("activate")}
                className="text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50 rounded-none px-2 py-1.5 cursor-pointer hover:bg-emerald-50"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Activate User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => openConfirmDialog("deactivate")}
                className="text-amber-700 focus:text-amber-800 focus:bg-amber-50 rounded-none px-2 py-1.5 cursor-pointer hover:bg-amber-50 gap-2"
              >
                <UserX className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            ))}

          <DropdownMenuItem
            onClick={() => openConfirmDialog("delete")}
            className="text-red-700 focus:text-red-800 focus:bg-red-50 rounded-none px-2 py-1.5 cursor-pointer hover:bg-red-50 gap-2"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {user.type === "invite" ? "Revoke Invitation" : "Delete User"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-zinc-200 shadow-2xl sm:max-w-[425px] p-6 gap-6">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "p-3 rounded-full shrink-0 mt-1",
                  dialogType === "delete" && "bg-red-50 text-red-600",
                  dialogType === "deactivate" && "bg-amber-50 text-amber-600",
                  dialogType === "activate" && "bg-emerald-50 text-emerald-600"
                )}
              >
                {dialogType === "delete" && <Trash2 className="h-6 w-6" />}
                {dialogType === "deactivate" && (
                  <ShieldAlert className="h-6 w-6" />
                )}
                {dialogType === "activate" && <UserCheck className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-lg font-semibold text-zinc-900">
                  {dialogType === "deactivate" && "Deactivate this user?"}
                  {dialogType === "activate" && "Reactivate this user?"}
                  {dialogType === "delete" &&
                    (user.type === "invite"
                      ? "Revoke this invitation?"
                      : "Delete this user?")}
                </DialogTitle>
                <DialogDescription className="text-sm text-zinc-500 leading-relaxed">
                  {dialogType === "deactivate" &&
                    `This will immediately block ${user.name} from signing in. They will not be able to access any part of the admin panel.`}
                  {dialogType === "activate" &&
                    `This will restore access for ${user.name} immediately. They will be able to sign in again.`}
                  {dialogType === "delete" &&
                    `This action cannot be undone. ${user.name}'s account and all associated data will be permanently removed.`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
            >
              Cancel
            </Button>
            <Button
              variant={dialogType === "activate" ? "default" : "destructive"}
              className={cn(
                "shadow-sm",
                dialogType === "activate" &&
                  "bg-emerald-600 hover:bg-emerald-700 text-white",
                dialogType === "deactivate" &&
                  "bg-amber-600 hover:bg-amber-700 text-white",
                dialogType === "delete" &&
                  "bg-red-600 hover:bg-red-700 text-white"
              )}
              onClick={handleStatusAction}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialogType === "activate" && "Reactivate User"}
              {dialogType === "deactivate" && "Deactivate User"}
              {dialogType === "delete" &&
                (user.type === "invite" ? "Revoke Invitation" : "Delete User")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
