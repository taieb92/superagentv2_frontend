"use client";

import { ProfileField } from "@/components/superagent/profile/ProfileField";
import { ProfileSection } from "@/components/superagent/profile/ProfileSection";
import { PageShell } from "@/components/superagent/shell/PageShell";
import {
  useGetAllJurisdictionsQuery,
  useGetCurrentUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
  setGetCurrentUserProfileData,
} from "@/lib/api/generated/fetch-client/Query";
import {
  OnboardingRequestDTO,
  type JurisdictionResponseDto,
} from "@/lib/api/generated/fetch-client";
import { useUser } from "@clerk/nextjs";
import {
  Building2,
  FileCheck2,
  Globe,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Input } from "@headlessui/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profileData, isLoading } = useGetCurrentUserProfileQuery();

  // Mutation to update profile
  const updateProfileMutation = useUpdateCurrentUserProfileMutation({
    onSuccess: (data) => {
      // Update the query cache directly with the response data (no refetch needed)
      setGetCurrentUserProfileData(queryClient, () => data);
      toast.success("Profile updated successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update profile: ${errorMessage}`);
    },
  });

  // Fetch jurisdictions for the select dropdown
  const { data: jurisdictions, isLoading: isLoadingJurisdictions } =
    useGetAllJurisdictionsQuery();

  // Local state for editable profile and saving field
  // Using Partial<OnboardingRequestDTO> since we only update individual fields
  const [profile, setProfile] = useState<
    (Partial<OnboardingRequestDTO> & { email?: string }) | null
  >(null);
  const [savingField, setSavingField] = useState<string | null>(null);

  // Initialize local profile state when query loads
  useEffect(() => {
    if (profileData) {
      setProfile({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email:
          profileData.email || user?.primaryEmailAddress?.emailAddress || "",
        licenseNumber: profileData.licenseNumber || "",
        stateLicenseNumbers: profileData.stateLicenseNumbers || "",
        mlsCode: profileData.mlsCode || "",
        mlsId: profileData.mlsId || "",
        jurisdictionCode: profileData.jurisdictionCode || "",
        firmName: profileData.firmName || "",
        firmAddressStreet: profileData.firmAddressStreet || "",
        firmAddressCity: profileData.firmAddressCity || "",
        firmAddressState: profileData.firmAddressState || "",
        firmAddressZip: profileData.firmAddressZip || "",
        brokeragePhone: profileData.brokeragePhone || "",
        brokerageEmail: profileData.brokerageEmail || "",
        brokerageFax: profileData.brokerageFax || "",
      });
    }
  }, [profileData, user]);

  // Handle updating a field
  const handleUpdate = async (
    field: string,
    value: string | undefined
  ): Promise<void> => {
    const fieldMap: Record<string, keyof OnboardingRequestDTO> = {
      "First Name": "firstName",
      "Last Name": "lastName",
      "License Number": "licenseNumber",
      "State License Numbers": "stateLicenseNumbers",
      "MLS Code": "mlsCode",
      "MLS ID": "mlsId",
      Jurisdiction: "jurisdictionCode",
      "Firm Name": "firmName",
      "Firm Address Street": "firmAddressStreet",
      "Firm Address City": "firmAddressCity",
      "Firm Address State": "firmAddressState",
      "Firm Address Zip": "firmAddressZip",
      "Brokerage Phone": "brokeragePhone",
      "Brokerage Email": "brokerageEmail",
      "Brokerage Fax": "brokerageFax",
    };

    const dtoField = fieldMap[field];
    if (!dtoField) {
      console.warn(`Unknown field: ${field}`);
      return;
    }

    // Skip API call when value did not change (avoids "updated successfully" for no-op)
    const currentValue = profile?.[dtoField] ?? "";
    const newValue = value ?? "";
    if (String(currentValue).trim() === String(newValue).trim()) {
      return;
    }

    try {
      setSavingField(field);

      // Create OnboardingRequestDTO with only the field to update
      // All fields are optional, so we can create a partial object
      const updateData = new OnboardingRequestDTO({
        [dtoField]: value || undefined,
      } as Partial<OnboardingRequestDTO>);

      await updateProfileMutation.mutateAsync(updateData);

      // Update local state after successful save
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [dtoField]: value || undefined,
        };
      });
    } catch (error: unknown) {
      console.error(`Failed to update ${field}`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update ${field}: ${errorMessage}`);
    } finally {
      setSavingField(null);
    }
  };

  // Loading state
  if (isLoading || !profile) {
    return (
      <PageShell>
        <div className="space-y-8 max-w-[1200px] mx-auto animate-pulse">
          <div className="h-10 w-48 bg-[#F9FAFB] rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-[#F9FAFB] rounded-xl" />
            <div className="h-[400px] bg-[#F9FAFB] rounded-xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-[1200px] mx-auto space-y-10">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-[24px] font-semibold text-[#111827]">Profile</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Manage your agent profile information. All fields are optional and
            can be updated at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            {/* Personal Information */}
            <ProfileSection
              title="Personal Information"
              icon={User}
              description="Your basic identification details"
            >
              <div className="space-y-6">
                <ProfileField
                  label="First Name"
                  value={profile.firstName || ""}
                  onSave={(v) => handleUpdate("First Name", v)}
                  placeholder="John"
                />
                <ProfileField
                  label="Last Name"
                  value={profile.lastName || ""}
                  onSave={(v) => handleUpdate("Last Name", v)}
                  placeholder="Doe"
                />
                <ProfileField
                  label="Email"
                  value={profile.email || ""}
                  disabled
                  helperText="Managed by authentication provider"
                />
              </div>
            </ProfileSection>

            {/* Jurisdiction */}
            <ProfileSection
              title="Jurisdiction"
              icon={Globe}
              description="Your primary jurisdiction for contract templates"
            >
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                    Jurisdiction
                  </Label>
                  <Select
                    value={profile.jurisdictionCode}
                    onValueChange={(value) =>
                      handleUpdate("Jurisdiction", value)
                    }
                    disabled={
                      isLoadingJurisdictions || savingField === "Jurisdiction"
                    }
                  >
                    <SelectTrigger className="h-11 bg-white border-[#E5E7EB] text-[#111827] focus:border-[#0F766E] focus:ring-[#0F766E]/20 rounded-none">
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictions && jurisdictions.length > 0 ? (
                        jurisdictions.map((j: JurisdictionResponseDto) => (
                          <SelectItem key={j.id} value={j.code || ""}>
                            {j.name} ({j.code})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-[#6B7280]">
                          No jurisdictions available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[12px] text-[#9CA3AF] pl-0.5">
                    Required for contract generation
                  </p>
                </div>
              </div>
            </ProfileSection>

            {/* License Information */}
            <ProfileSection
              title="License Information"
              icon={FileCheck2}
              description="Your professional license credentials"
            >
              <div className="space-y-6">
                <ProfileField
                  label="License Number"
                  value={profile.licenseNumber || ""}
                  onSave={(v) => handleUpdate("License Number", v)}
                  placeholder="e.g. 01234567"
                />
                <ProfileField
                  label="State License Numbers"
                  value={profile.stateLicenseNumbers || ""}
                  onSave={(v) => handleUpdate("State License Numbers", v)}
                  placeholder="e.g. CA: 01234567, AZ: 98765432"
                  helperText="Multiple licenses separated by commas"
                />
              </div>
            </ProfileSection>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            {/* MLS Information */}
            <ProfileSection
              title="MLS Information"
              icon={Hash}
              description="Your MLS codes and identifiers"
            >
              <div className="space-y-6">
                <ProfileField
                  label="MLS Code"
                  value={profile.mlsCode || ""}
                  onSave={(v) => handleUpdate("MLS Code", v)}
                  placeholder="e.g. CRMLS"
                />
                <ProfileField
                  label="MLS ID"
                  value={profile.mlsId || ""}
                  onSave={(v) => handleUpdate("MLS ID", v)}
                  placeholder="e.g. 123456"
                />
              </div>
            </ProfileSection>

            {/* Firm Information */}
            <ProfileSection
              title="Firm Information"
              icon={Building2}
              description="Your brokerage or firm details"
            >
              <div className="space-y-6">
                <ProfileField
                  label="Firm Name"
                  value={profile.firmName || ""}
                  onSave={(v) => handleUpdate("Firm Name", v)}
                  placeholder="e.g. Compass Real Estate"
                />
              </div>
            </ProfileSection>

            {/* Firm Address */}
            <ProfileSection
              title="Firm Address"
              icon={MapPin}
              description="Your firm's physical address"
            >
              <div className="space-y-6">
                <ProfileField
                  label="Street Address"
                  value={profile.firmAddressStreet || ""}
                  onSave={(v) => handleUpdate("Firm Address Street", v)}
                  placeholder="e.g. 123 Main Street"
                />
                <div className="grid gap-4 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="min-w-0 overflow-hidden">
                    <InputField
                      label="City"
                      value={profile.firmAddressCity}
                      onUpdate={(v) => handleUpdate("Firm Address City", v)}
                    />
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <StateSelectField
                      label="State"
                      value={profile.firmAddressState}
                      onUpdate={(v) => handleUpdate("Firm Address State", v)}
                      disabled={savingField === "Firm Address State"}
                    />
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <InputField
                      label="Zip Code"
                      value={profile.firmAddressZip}
                      onUpdate={(v) => handleUpdate("Firm Address Zip", v)}
                    />
                  </div>
                </div>
              </div>
            </ProfileSection>

            {/* Brokerage Contact */}
            <ProfileSection
              title="Brokerage Contact"
              icon={Phone}
              description="Contact information for your firm"
            >
              <div className="space-y-6">
                <InputField
                  label="Phone"
                  value={profile.brokeragePhone}
                  onUpdate={(v) => handleUpdate("Brokerage Phone", v)}
                  icon={Phone}
                />
                <InputField
                  label="Email"
                  value={profile.brokerageEmail}
                  onUpdate={(v) => handleUpdate("Brokerage Email", v)}
                  icon={Mail}
                  type="email"
                />
                <InputField
                  label="Fax (Optional)"
                  value={profile.brokerageFax}
                  onUpdate={(v) => handleUpdate("Brokerage Fax", v)}
                />
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// TODO: these inputs need to go to another file

// US states for State dropdown (Firm Address)
const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
];

function StateSelectField({
  label,
  value,
  onUpdate,
  disabled,
}: Readonly<{
  label: string;
  value: string | undefined;
  onUpdate: (val: string) => void;
  disabled?: boolean;
}>) {
  // Normalize value so Radix Select can display it (must match a SelectItem value or be "")
  const normalizedValue =
    value && US_STATES.includes(value.trim().toUpperCase())
      ? value.trim().toUpperCase()
      : "";
  return (
    <div className="space-y-1.5 min-w-0">
      <Label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
        {label}
      </Label>
      <Select
        value={normalizedValue}
        onValueChange={(v) => onUpdate(v)}
        disabled={disabled}
      >
        <SelectTrigger className="h-11 w-full min-w-[5rem] bg-white border-[#E5E7EB] text-[#111827] focus:border-[#0F766E] focus:ring-[#0F766E]/20 rounded-none [&>span]:min-w-[2.5rem] [&>span]:truncate [&>span]:text-left [&>span]:text-[#111827] data-[placeholder]:[&>span]:text-[#6B7280]">
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent>
          {US_STATES.map((code) => (
            <SelectItem key={code} value={code}>
              {code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Reusable input field for right column
function InputField({
  label,
  value,
  onUpdate,
  icon: Icon,
  type = "text",
  maxLength,
}: Readonly<{
  label: string;
  value: string | undefined;
  onUpdate: (val: string) => void;
  icon?: React.ElementType;
  type?: string;
  maxLength?: number;
}>) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const valueFromProps = value ?? "";

  useEffect(() => {
    setLocalValue(valueFromProps);
  }, [valueFromProps]);

  const handleBlur = () => {
    // Only trigger save when value actually changed (avoids "updated successfully" for no-op)
    if (localValue !== valueFromProps) {
      onUpdate(localValue);
    }
  };

  return (
    <div className="space-y-1.5 min-w-0 w-full overflow-hidden">
      <Label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
        {label}
      </Label>
      <div className="relative w-full min-w-0">
        {Icon && (
          <Icon className="absolute left-3 top-3.5 h-5 w-5 text-[#6B7280]" />
        )}
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          placeholder={label}
          type={type}
          maxLength={maxLength}
          className={`h-11 w-full min-w-0 max-w-full bg-white border-[#E5E7EB] text-[#111827] focus:border-[#0F766E] focus:ring-[#0F766E]/20 rounded-none box-border ${Icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}
