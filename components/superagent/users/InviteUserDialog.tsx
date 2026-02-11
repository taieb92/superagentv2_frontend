"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  bulkInviteUser,
  createUserDirectly,
  inviteUser,
} from "@/lib/actions/users";
import {
  getDefaultRole,
  UserRole,
  type UserRoleType,
} from "@/lib/constants/roles";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Upload,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { isEmail } from "validator";

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("single");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Dev-only: Track creation mode
  const [creationMode, setCreationMode] = useState<"invite" | "direct">(
    "invite"
  );
  const isDev = true;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRoleType>(getDefaultRole());

  // Bulk Invite State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationStats, setValidationStats] = useState({
    valid: 0,
    invalid: 0,
  });

  const handleSingleInvite = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      // In dev mode, allow direct creation OR invitation
      const res =
        isDev && creationMode === "direct"
          ? await createUserDirectly(email, role)
          : await inviteUser(email, role);

      if (res.success) {
        // Log details to browser console for dev
        if ("invitationId" in res && res.invitationId) {
          console.log("🎫 INVITATION CREATED");
          console.log("📧 Email:", email, "| Role:", role);
          console.log(
            "🔗 URL:",
            "invitationUrl" in res ? res.invitationUrl : "N/A"
          );
        } else if ("userId" in res && res.userId) {
          console.log("⚡ USER CREATED DIRECTLY (DEV MODE)");
          console.log("📧 Email:", email, "| Role:", role);
          console.log("🔐 Test OTP: 424242");
        }
        const successMessage =
          "message" in res && typeof res.message === "string"
            ? res.message
            : "Success!";
        setFeedback({ type: "success", message: successMessage });
        setEmail("");
      } else {
        const errorMessage =
          "error" in res && typeof res.error === "string"
            ? res.error
            : "Failed.";
        setFeedback({ type: "error", message: errorMessage });
      }
    } catch (err) {
      setFeedback({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
    // Assume Header: email,role
    // or just data if no header? Let's check for standard "email,role" header or assume first line is data if it looks like email.

    // Simple parser
    const data = lines.map((line, index) => {
      const [rawEmail, rawRole] = line.split(",");
      const email = rawEmail?.trim().toLowerCase();
      const roleInput = rawRole?.trim().toUpperCase();

      // Validation: use validator library for email format
      const isValidEmail = !!email && isEmail(email);
      const isValidRole =
        roleInput === UserRole.ADMIN || roleInput === UserRole.AGENT;

      return {
        id: index,
        email,
        role: isValidRole ? (roleInput as UserRoleType) : getDefaultRole(), // Default to AGENT for invalid roles
        isValid: isValidEmail && isValidRole,
        error: !isValidEmail
          ? "Invalid Email"
          : !isValidRole
            ? "Invalid Role"
            : null,
      };
    });

    // Filter out header if present (simple check)
    const filteredData = data.filter((r) => r.email !== "email");

    const validCount = filteredData.filter((r) => r.isValid).length;
    const invalidCount = filteredData.filter((r) => !r.isValid).length;

    setPreviewData(filteredData);
    setValidationStats({ valid: validCount, invalid: invalidCount });
  };

  const handleBulkInvite = async () => {
    setIsLoading(true);
    setFeedback(null);
    const validUsers = previewData
      .filter((r) => r.isValid)
      .map((r) => ({ email: r.email, role: r.role }));

    try {
      const res = await bulkInviteUser(validUsers);
      setFeedback({
        type: "success",
        message:
          validUsers.length === 1
            ? "Successfully processed 1 invite."
            : `Successfully processed ${validUsers.length} invites.`,
      });
      // Cleanup after success
      setCsvFile(null);
      setPreviewData([]);
    } catch (err) {
      setFeedback({
        type: "error",
        message: "Failed to process bulk invites.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <Button
        className="bg-zinc-900 text-zinc-50 opacity-50 shadow-sm"
        disabled
      >
        <Plus className="mr-2 h-4 w-4" />
        Invite User
      </Button>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) setFeedback(null);
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 gap-0 overflow-y-auto bg-white border-zinc-200 shadow-xl sm:rounded-none">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-zinc-900">
            Invite Users
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Invite a single team member or bulk upload via CSV.
          </DialogDescription>
          {feedback && (
            <div
              className={cn(
                "mt-4 flex items-center gap-2 rounded-none p-3 text-sm font-medium",
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {feedback.message}
            </div>
          )}
        </DialogHeader>

        <Tabs
          defaultValue="single"
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            setFeedback(null);
          }}
          className="w-full"
        >
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-100/80 p-1">
              <TabsTrigger
                value="single"
                className="text-zinc-500 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
              >
                Single Invite
              </TabsTrigger>
              <TabsTrigger
                value="bulk"
                className="text-zinc-500 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
              >
                Bulk Upload
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="single" className="mt-0 space-y-4">
              {isDev && (
                <div className="rounded-none border border-amber-200 bg-amber-50/50 p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-amber-900 mb-2">
                        Development Mode
                      </h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCreationMode("invite")}
                          className={cn(
                            "px-3 py-1.5 rounded-none text-xs font-medium transition-colors",
                            creationMode === "invite"
                              ? "bg-amber-600 text-white"
                              : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-100"
                          )}
                        >
                          Invite (Email)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCreationMode("direct")}
                          className={cn(
                            "px-3 py-1.5 rounded-none text-xs font-medium transition-colors",
                            creationMode === "direct"
                              ? "bg-amber-600 text-white"
                              : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-100"
                          )}
                        >
                          Direct Creation (Test)
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-700 mt-2">
                        {creationMode === "invite"
                          ? "Sends email invitation (production flow)"
                          : "Creates user immediately with test OTP 424242"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-zinc-200 focus-visible:ring-zinc-900 text-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-zinc-700">
                  Role
                </Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as UserRoleType)}
                >
                  <SelectTrigger
                    id="role"
                    className="bg-white border-zinc-200 text-zinc-900"
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-zinc-200">
                    <SelectItem
                      value={UserRole.ADMIN}
                      className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer"
                    >
                      Admin
                    </SelectItem>
                    <SelectItem
                      value={UserRole.AGENT}
                      className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer"
                    >
                      Agent
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-zinc-400">
                  Admins have full access. Users can only view assigned
                  resources.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="mt-0 space-y-4">
              {!csvFile ? (
                <div className="space-y-4">
                  <div className="rounded-none border border-blue-100 bg-blue-50/50 p-3">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="space-y-2 w-full">
                        <h4 className="text-xs font-semibold text-blue-900">
                          CSV Format Requirements
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Your CSV file must include a header row.
                        </p>

                        <div className="overflow-hidden rounded-none border border-blue-200 bg-white/60">
                          <table className="w-full text-left text-[10px]">
                            <thead className="bg-blue-100/50 text-blue-900">
                              <tr>
                                <th className="px-2 py-1.5 font-semibold">
                                  email
                                </th>
                                <th className="px-2 py-1.5 font-semibold">
                                  role
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100 text-blue-800">
                              <tr>
                                <td className="px-2 py-1.5 font-mono">
                                  john@example.com
                                </td>
                                <td className="px-2 py-1.5 font-mono">admin</td>
                              </tr>
                              <tr>
                                <td className="px-2 py-1.5 font-mono">
                                  jane@example.com
                                </td>
                                <td className="px-2 py-1.5 font-mono">user</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-none border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-8 transition-colors hover:bg-zinc-50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200">
                      <Upload className="h-6 w-6 text-zinc-400" />
                    </div>
                    <div className="mt-4 text-center text-sm">
                      <label
                        htmlFor="csv-upload"
                        className="font-medium text-zinc-900 hover:underline cursor-pointer"
                      >
                        Click to upload
                        <input
                          id="csv-upload"
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <span className="text-zinc-500">
                        or drag and drop CSV
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-none border border-zinc-100 bg-zinc-50 px-3 py-2">
                    <span className="text-sm font-medium text-zinc-700 truncate max-w-[200px]">
                      {csvFile.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCsvFile(null);
                        setPreviewData([]);
                      }}
                      className="h-auto p-0 text-zinc-400 hover:text-zinc-900"
                    >
                      Change
                    </Button>
                  </div>

                  {/* Preview Stats */}
                  <div className="flex gap-3">
                    <div className="flex flex-1 items-center gap-2 rounded-none border border-green-100 bg-green-50/50 px-3 py-2 text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {validationStats.valid} Valid
                      </span>
                    </div>
                    {validationStats.invalid > 0 && (
                      <div className="flex flex-1 items-center gap-2 rounded-none border border-red-100 bg-red-50/50 px-3 py-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {validationStats.invalid} Invalid
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Valid Rows Preview (Limited) */}
                  {previewData.length > 0 && (
                    <div className="rounded-none border border-zinc-200 max-h-[150px] overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-50 text-zinc-500 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 font-medium">Email</th>
                            <th className="px-3 py-2 font-medium">Role</th>
                            <th className="px-3 py-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(0, 10).map((row) => (
                            <tr
                              key={row.id}
                              className="border-t border-zinc-100"
                            >
                              <td className="px-3 py-2 text-zinc-900">
                                {row.email}
                              </td>
                              <td className="px-3 py-2 text-zinc-600 capitalize">
                                {row.role}
                              </td>
                              <td className="px-3 py-2">
                                {row.isValid ? (
                                  <span className="text-green-600">Ready</span>
                                ) : (
                                  <span className="text-red-600 font-medium">
                                    {row.error}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {previewData.length > 10 && (
                        <div className="bg-zinc-50 px-3 py-1.5 text-center text-[10px] text-zinc-400 border-t border-zinc-100">
                          And {previewData.length - 10} more...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </div>

          <DialogFooter className="border-t border-zinc-100 p-6 bg-zinc-50/50">
            <div className="flex w-full justify-between items-center sm:justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  activeTab === "single" ? handleSingleInvite : handleBulkInvite
                }
                disabled={
                  isLoading ||
                  (activeTab === "bulk" && validationStats.valid === 0)
                }
                className="bg-zinc-900 text-white hover:bg-zinc-800"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {activeTab === "single"
                  ? isDev && creationMode === "direct"
                    ? "Create User"
                    : "Send Invite"
                  : `Invite ${validationStats.valid} User${validationStats.valid === 1 ? "" : "s"}`}
              </Button>
            </div>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
