"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCompleteOnboardingMutation,
  useGetAllJurisdictionsQuery,
} from "@/lib/api/generated/fetch-client/Query";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Globe,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OnboardingRequestDTO } from "@/lib/api/generated/fetch-client";
import { parseApiError } from "@/lib/api/error-handler";

interface OnboardingFormProps {
  userId: string;
  onComplete?: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "Jurisdiction",
    description: "Select your jurisdiction",
    icon: Globe,
    fields: ["jurisdictionCode"],
    mandatory: true,
  },
  {
    id: 2,
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: User,
    fields: ["firstName", "lastName"],
    mandatory: false,
  },
  {
    id: 3,
    title: "License Information",
    description: "Your professional licenses",
    icon: FileCheck2,
    fields: ["licenseNumber", "stateLicenseNumbers"],
    mandatory: false,
  },
  {
    id: 4,
    title: "MLS Information",
    description: "MLS codes and IDs",
    icon: Hash,
    fields: ["mlsCode", "mlsId"],
    mandatory: false,
  },
  {
    id: 5,
    title: "Firm Information",
    description: "Your brokerage details",
    icon: Building2,
    fields: ["firmName"],
    mandatory: false,
  },
  {
    id: 6,
    title: "Firm Address & Contact",
    description: "Firm location and contact info",
    icon: MapPin,
    fields: [
      "firmAddressStreet",
      "firmAddressCity",
      "firmAddressState",
      "firmAddressZip",
      "brokeragePhone",
      "brokerageEmail",
      "brokerageFax",
    ],
    mandatory: false,
  },
] as const;

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { data: jurisdictions, isLoading: isLoadingJurisdictions } =
    useGetAllJurisdictionsQuery();
  const { mutateAsync: completeOnboarding, isPending: isLoading } =
    useCompleteOnboardingMutation();

  const [formData, setFormData] = useState<OnboardingRequestDTO>(
    new OnboardingRequestDTO({
      firstName: "",
      lastName: "",
      licenseNumber: "",
      stateLicenseNumbers: "",
      mlsCode: "",
      mlsId: "",
      firmName: "",
      firmAddressStreet: "",
      firmAddressCity: "",
      firmAddressState: "",
      firmAddressZip: "",
      brokeragePhone: "",
      brokerageEmail: "",
      brokerageFax: "",
      jurisdictionCode: "",
    })
  );

  const updateField = (field: keyof OnboardingRequestDTO, value: string) => {
    setFormData(
      (prev) =>
        new OnboardingRequestDTO({
          ...prev,
          [field]: value,
        })
    );
  };

  const currentStepData = STEPS.find((step) => step.id === currentStep);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;
  const isReviewStep = currentStep === STEPS.length; // semantic clarity

  const canProceed = () => {
    if (!currentStepData) return false;

    // For mandatory steps, ALL required fields must be filled
    if (currentStepData.mandatory) {
      return currentStepData.fields.every(
        (field) =>
          formData[field as keyof OnboardingRequestDTO]?.toString().trim() !==
          ""
      );
    }

    // For optional steps, always allow proceeding
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      if (currentStepData?.mandatory) {
        toast.error("Please complete all required fields");
      }
      return;
    }

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const jurisdictionCode = formData.jurisdictionCode;

    // Validate mandatory field
    if (!jurisdictionCode || !jurisdictionCode.trim()) {
      toast.error("Please select a jurisdiction");
      setCurrentStep(1);
      return;
    }

    // Filter out empty fields and create payload
    const dataToSend = new OnboardingRequestDTO();
    (Object.keys(formData) as Array<keyof OnboardingRequestDTO>).forEach(
      (key) => {
        // Skip internal properties if any, though generated DTOs usually don't have them enumerable
        // also skip methods
        if (typeof formData[key] === "function") return;

        const value = formData[key];
        if (value && value.toString().trim() !== "") {
          (dataToSend as any)[key] = value;
        }
      }
    );

    // Ensure jurisdiction is included
    if (!dataToSend.jurisdictionCode) {
      toast.error("Jurisdiction is required");
      return;
    }

    try {
      await completeOnboarding(dataToSend);

      toast.success("Profile completed successfully!");
      if (onComplete) {
        onComplete();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Onboarding error:", error);
      const { message, description } = parseApiError(error);
      toast.error(message, { description });
    }
  };

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        {/* Step Circles and Connector Lines */}
        <div className="flex items-center justify-between mb-4 relative">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className="flex items-center"
                style={{
                  flex:
                    index === 0 || index === STEPS.length - 1
                      ? "0 0 auto"
                      : "1 1 0%",
                }}
              >
                {/* Connector Line - Before */}
                {step.id > 1 && (
                  <div
                    className={`h-0.5 transition-colors duration-300`}
                    style={{
                      width:
                        index === STEPS.length - 1
                          ? "calc(100% - 20px)"
                          : "100%",
                      backgroundColor: isCompleted ? "#0F766E" : "#E5E7EB",
                    }}
                  />
                )}

                {/* Step Circle */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#0F766E] border-[#0F766E] text-white"
                        : isCurrent
                          ? "bg-white border-[#0F766E] text-[#0F766E]"
                          : "bg-white border-[#E5E7EB] text-[#6B7280]"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {step.mandatory && (
                    <span className="absolute -top-1 -right-1 text-[10px] text-[#0F766E] font-semibold">
                      *
                    </span>
                  )}
                </div>

                {/* Connector Line - After */}
                {step.id < STEPS.length && index !== STEPS.length - 1 && (
                  <div
                    className={`h-0.5 transition-colors duration-300`}
                    style={{
                      width: index === 0 ? "calc(100% - 20px)" : "100%",
                      backgroundColor: isCompleted ? "#0F766E" : "#E5E7EB",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Labels */}
        <div className="flex items-start justify-between mt-3">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={`label-${step.id}`}
                className="flex flex-col items-center justify-center"
                style={{ flex: "1 1 0%", minWidth: 0 }}
              >
                <p
                  className={`text-[11px] font-medium text-center ${
                    isCurrent
                      ? "text-[#111827]"
                      : isCompleted
                        ? "text-[#0F766E]"
                        : "text-[#6B7280]"
                  } transition-colors`}
                >
                  {step.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="min-h-[400px]">
          {/* Step 1: Jurisdiction */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-[#F0FDF4] mb-4">
                  <Globe className="h-8 w-8 text-[#0F766E]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#111827] mb-2">
                  Select Your Jurisdiction
                </h3>
                <p className="text-[#6B7280] text-sm">
                  This helps us customize your experience
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="jurisdictionCode"
                  className="text-[#111827] text-sm font-medium"
                >
                  Jurisdiction <span className="text-[#0F766E]">*</span>
                </Label>
                <Select
                  value={formData.jurisdictionCode}
                  onValueChange={(value) =>
                    updateField("jurisdictionCode", value)
                  }
                  disabled={isLoading || isLoadingJurisdictions}
                >
                  <SelectTrigger className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none">
                    <SelectValue placeholder="Select a jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictions && jurisdictions.length > 0 ? (
                      jurisdictions.map((jurisdiction) => (
                        <SelectItem
                          key={jurisdiction.id ?? ""}
                          value={jurisdiction.code ?? ""}
                        >
                          {jurisdiction.name} ({jurisdiction.code})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-[#6B7280]">
                        No jurisdictions available
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#6B7280] mt-1">
                  Required to continue
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-[#F0FDF4] mb-4">
                  <User className="h-8 w-8 text-[#0F766E]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#111827] mb-2">
                  Personal Information
                </h3>
                <p className="text-[#6B7280] text-sm">
                  Tell us a bit about yourself
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-[#111827] text-sm font-medium"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-[#111827] text-sm font-medium"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: License Information */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-[#F0FDF4] mb-4">
                  <FileCheck2 className="h-8 w-8 text-[#0F766E]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#111827] mb-2">
                  License Information
                </h3>
                <p className="text-[#6B7280] text-sm">
                  Your professional license details
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="licenseNumber"
                    className="text-[#111827] text-sm font-medium"
                  >
                    Primary License Number
                  </Label>
                  <Input
                    id="licenseNumber"
                    placeholder="e.g. 01234567"
                    className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      updateField("licenseNumber", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="stateLicenseNumbers"
                    className="text-[#111827] text-sm font-medium"
                  >
                    State License Numbers
                  </Label>
                  <Input
                    id="stateLicenseNumbers"
                    placeholder="e.g. CA: 01234567, AZ: 98765432"
                    className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                    value={formData.stateLicenseNumbers}
                    onChange={(e) =>
                      updateField("stateLicenseNumbers", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: MLS Information */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-[#F0FDF4] mb-4">
                  <Hash className="h-8 w-8 text-[#0F766E]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#111827] mb-2">
                  MLS Information
                </h3>
                <p className="text-[#6B7280] text-sm">
                  Your MLS codes and identifiers
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="mlsCode"
                    className="text-[#111827] text-sm font-medium"
                  >
                    MLS Code
                  </Label>
                  <Input
                    id="mlsCode"
                    placeholder="e.g. CRMLS"
                    className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                    value={formData.mlsCode}
                    onChange={(e) => updateField("mlsCode", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="mlsId"
                    className="text-[#111827] text-sm font-medium"
                  >
                    MLS ID
                  </Label>
                  <Input
                    id="mlsId"
                    placeholder="e.g. 123456"
                    className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                    value={formData.mlsId}
                    onChange={(e) => updateField("mlsId", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Firm Information */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-[#F0FDF4] mb-4">
                  <Building2 className="h-8 w-8 text-[#0F766E]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#111827] mb-2">
                  Firm Information
                </h3>
                <p className="text-[#6B7280] text-sm">Your brokerage details</p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="firmName"
                  className="text-[#111827] text-sm font-medium"
                >
                  Firm Name
                </Label>
                <Input
                  id="firmName"
                  placeholder="e.g. Compass Real Estate"
                  className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                  value={formData.firmName}
                  onChange={(e) => updateField("firmName", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Step 6: Firm Address & Contact */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-[#F0FDF4] mb-4">
                  <MapPin className="h-8 w-8 text-[#0F766E]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#111827] mb-2">
                  Firm Address & Contact
                </h3>
                <p className="text-[#6B7280] text-sm">
                  Your firm's location and contact information
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firmAddressStreet"
                    className="text-[#111827] text-sm font-medium"
                  >
                    Street Address
                  </Label>
                  <Input
                    id="firmAddressStreet"
                    placeholder="e.g. 123 Main Street"
                    className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                    value={formData.firmAddressStreet}
                    onChange={(e) =>
                      updateField("firmAddressStreet", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firmAddressCity"
                      className="text-[#111827] text-sm font-medium"
                    >
                      City
                    </Label>
                    <Input
                      id="firmAddressCity"
                      placeholder="Phoenix"
                      className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                      value={formData.firmAddressCity}
                      onChange={(e) =>
                        updateField("firmAddressCity", e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="firmAddressState"
                      className="text-[#111827] text-sm font-medium"
                    >
                      State
                    </Label>
                    <Input
                      id="firmAddressState"
                      placeholder="AZ"
                      className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                      value={formData.firmAddressState}
                      onChange={(e) =>
                        updateField("firmAddressState", e.target.value)
                      }
                      disabled={isLoading}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="firmAddressZip"
                      className="text-[#111827] text-sm font-medium"
                    >
                      Zip Code
                    </Label>
                    <Input
                      id="firmAddressZip"
                      placeholder="85001"
                      className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                      value={formData.firmAddressZip}
                      onChange={(e) =>
                        updateField("firmAddressZip", e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="brokeragePhone"
                    className="text-[#111827] text-sm font-medium"
                  >
                    Phone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-[#6B7280]" />
                    <Input
                      id="brokeragePhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="pl-10 h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                      value={formData.brokeragePhone}
                      onChange={(e) =>
                        updateField("brokeragePhone", e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="brokerageEmail"
                    className="text-[#111827] text-sm font-medium"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#6B7280]" />
                    <Input
                      id="brokerageEmail"
                      type="email"
                      placeholder="contact@firm.com"
                      className="pl-10 h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                      value={formData.brokerageEmail}
                      onChange={(e) =>
                        updateField("brokerageEmail", e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="brokerageFax"
                    className="text-[#111827] text-sm font-medium"
                  >
                    Fax{" "}
                    <span className="text-[#6B7280] font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="brokerageFax"
                    type="tel"
                    placeholder="(555) 123-4568"
                    className="h-12 bg-white border-[#E5E7EB] focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] rounded-none"
                    value={formData.brokerageFax}
                    onChange={(e) =>
                      updateField("brokerageFax", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E7EB]">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep || isLoading}
            className="h-11 px-6 border-[#E5E7EB] text-[#111827] hover:bg-[#F8F9FB] rounded-none"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !formData.jurisdictionCode?.trim()}
              className="h-11 px-8 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-medium rounded-none transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="h-11 px-8 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-medium rounded-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-[#6B7280] mt-4">
          {isLastStep
            ? "You can update these details anytime in Settings"
            : `Step ${currentStep} of ${STEPS.length}`}
        </p>
      </form>
    </div>
  );
}
