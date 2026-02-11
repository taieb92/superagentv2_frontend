"use client";

import { AdminShell } from "@/components/superagent/shell/AdminShell";
import { PageHeader } from "@/components/superagent/ui/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  JurisdictionResponseDto,
  TemplateListDto,
} from "@/lib/api/generated/fetch-client";
import { useGetAllJurisdictionsQuery } from "@/lib/api/generated/fetch-client/Query";
import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplatesByJurisdiction,
  useUpdateTemplatePrompt,
  useUpdateTemplateSlug,
} from "@/lib/hooks/use-templates";
import {
  ChevronLeft,
  Edit3,
  FileText,
  Layout,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Addendum = TemplateListDto & {
  slug: string;
  contextPrompt: string;
  title?: string;
};

type CounterOffer = TemplateListDto & {
  slug: string;
  contextPrompt: string;
  title?: string;
};

export default function JurisdictionConfigPage() {
  const { state: jurisdictionCode } = useParams() as { state: string };
  const router = useRouter();
  const decodedCode = useMemo(
    () => decodeURIComponent(jurisdictionCode).toUpperCase(),
    [jurisdictionCode]
  );

  const { data: jurisdictionsData } = useGetAllJurisdictionsQuery();
  const { data: templatesData, isLoading } =
    useTemplatesByJurisdiction(decodedCode);
  const updatePrompt = useUpdateTemplatePrompt();
  const updateSlug = useUpdateTemplateSlug();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const jurisdictions: JurisdictionResponseDto[] =
    (jurisdictionsData as JurisdictionResponseDto[]) || [];
  const templates: TemplateListDto[] =
    (templatesData as TemplateListDto[]) || [];

  const jurisdiction = useMemo(
    () => jurisdictions.find((j) => j.code === decodedCode),
    [jurisdictions, decodedCode]
  );

  const config = useMemo(() => {
    const bba = templates.find((t) => t.templateType === "BBA") || null;
    const purchase =
      templates.find((t) => t.templateType === "CONTRACT") || null;
    const addendums: Addendum[] = templates
      .filter(
        (t) => t.templateType === "ADDENDA" || t.templateType === "ADDENDUM"
      )
      .map(
        (t) =>
          ({
            ...t,
            slug: t.slug || "",
            contextPrompt: t.documentPrompt || "",
            title: t.title || "",
          }) as unknown as Addendum
      );
    const counteroffers: CounterOffer[] = templates
      .filter(
        (t) => t.templateType === "COUNTEROFFERS"
      )
      .map(
        (t) =>
          ({
            ...t,
            slug: t.slug || "",
            contextPrompt: t.documentPrompt || "",
            title: t.title || "",
          }) as unknown as CounterOffer
      );

    return { bba, purchase, addendums, counteroffers };
  }, [templates]);

  const handleUpdatePrompt = (type: "bba" | "purchase", value: string) => {
    const template = type === "bba" ? config.bba : config.purchase;
    const templateType = type === "bba" ? "BBA" : "CONTRACT";

    if (!template) {
      createTemplate.mutate({
        jurisdictionCode: decodedCode,
        templateType,
        documentPrompt: value,
      });
    } else if (template?.id) {
      updatePrompt.mutate({ templateId: template.id, documentPrompt: value });
    }
  };

  const handleUpdateAddendum = (
    templateId: string,
    field: "slug" | "contextPrompt" | "title",
    value: string
  ) => {
    if (field === "contextPrompt") {
      updatePrompt.mutate({ templateId, documentPrompt: value });
    } else if (field === "slug") {
      updateSlug.mutate({ templateId, slug: value });
    } else if (field === "title") {
      const a = config.addendums.find((e) => e.id === templateId);
      if (a)
        updatePrompt.mutate({
          templateId,
          documentPrompt: a.contextPrompt,
          title: value,
        });
    }
  };

  const handleAddAddendum = () => {
    const slug = `new-addendum-${Date.now()}`;
    createTemplate.mutate({
      jurisdictionCode: decodedCode,
      templateType: "ADDENDA",
      documentPrompt: "Addendum template",
      slug,
    });
  };

  const handleRemoveAddendum = (templateId: string) => {
    deleteTemplate.mutate(templateId);
  };

  const handleUpdateCounterOffer = (
    templateId: string,
    field: "slug" | "contextPrompt" | "title",
    value: string
  ) => {
    if (field === "contextPrompt") {
      updatePrompt.mutate({ templateId, documentPrompt: value });
    } else if (field === "slug") {
      updateSlug.mutate({ templateId, slug: value });
    } else if (field === "title") {
      const co = config.counteroffers.find((e) => e.id === templateId);
      if (co)
        updatePrompt.mutate({
          templateId,
          documentPrompt: co.contextPrompt,
          title: value,
        });
    }
  };

  const handleAddCounterOffer = () => {
    const slug = `new-counteroffer-${Date.now()}`;
    createTemplate.mutate({
      jurisdictionCode: decodedCode,
      templateType: "COUNTEROFFERS",
      documentPrompt: "Counter offer template",
      slug,
    });
  };

  const handleRemoveCounterOffer = (templateId: string) => {
    deleteTemplate.mutate(templateId);
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="max-w-[1280px] mx-auto space-y-10 animate-pulse">
          <div className="h-10 w-64 bg-[#E5E7EB] rounded-[6px]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-white border border-[#E5E7EB] rounded-[10px]" />
            <div className="h-[400px] bg-white border border-[#E5E7EB] rounded-[10px]" />
          </div>
        </div>
      </AdminShell>
    );
  }

  if (!jurisdiction) {
    router.push("/admin/designer");
    return null;
  }

  return (
    <AdminShell>
      <div className="max-w-[1280px] mx-auto space-y-12">
        <PageHeader
          title={`${jurisdiction.name} Templates`}
          subtitle={`Configure data extraction prompts and PDF layouts for ${jurisdiction.name}.`}
          action={
            <Link href="/admin/designer">
              <Button
                variant="outline"
                className="h-10 px-4 rounded-[6px] border-[#E5E7EB] text-[#4B5563] gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back to List
              </Button>
            </Link>
          }
        />

        {/* Core Contracts Section */}
        <section className="space-y-6">
          <div className="pb-2 border-b border-[#E5E7EB]">
            <h2 className="text-[18px] font-semibold text-[#111827]">
              Main Contracts
            </h2>
            <p className="text-[13px] text-[#6B7280]">
              Primary binding documents for this jurisdiction.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContractCard
              title="BBA Contract"
              description="Buyer Broker Agreement"
              prompt={config.bba?.documentPrompt || ""}
              exists={!!config.bba}
              isSaving={updatePrompt.isPending}
              onPromptChange={(v: string) => handleUpdatePrompt("bba", v)}
              jurisdictionCode={decodedCode}
              templateType="BBA"
            />
            <ContractCard
              title="Purchase Contract"
              description="Primary Purchase Agreement"
              prompt={config.purchase?.documentPrompt || ""}
              exists={!!config.purchase}
              isSaving={updatePrompt.isPending}
              onPromptChange={(v: string) => handleUpdatePrompt("purchase", v)}
              jurisdictionCode={decodedCode}
              templateType="CONTRACT"
            />
          </div>
        </section>

        {/* Addendums Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-end pb-2 border-b border-[#E5E7EB]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#111827]">
                Addendums
              </h2>
              <p className="text-[13px] text-[#6B7280]">
                Supplemental documents and attachments.
              </p>
            </div>
            <Button
              onClick={handleAddAddendum}
              disabled={createTemplate.isPending}
              className="bg-[#0F766E] hover:bg-[#115E59] text-white h-10 px-4 rounded-[6px] shadow-sm gap-2"
            >
              <Plus className="h-4 w-4" /> Add Addendum
            </Button>
          </div>

          {config.addendums.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[10px] border border-[#E5E7EB]">
              <div className="bg-[#F8F9FB] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-[#9CA3AF]" />
              </div>
              <h3 className="text-[16px] font-semibold text-[#111827] mb-1">
                No addendums configured
              </h3>
              <p className="text-[14px] text-[#6B7280] max-w-xs mx-auto mb-6">
                Start by adding a new addendum template for this region.
              </p>
              <Button
                onClick={handleAddAddendum}
                variant="outline"
                className="h-10 px-5 rounded-[6px] border-[#E5E7EB]"
                disabled={createTemplate.isPending}
              >
                Create First Addendum
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {config.addendums.map((addendum, index) => (
                <AddendumCard
                  key={addendum.id || index}
                  addendum={addendum}
                  isSaving={updatePrompt.isPending || updateSlug.isPending}
                  onUpdate={(
                    field: "slug" | "contextPrompt" | "title",
                    val: string
                  ) =>
                    addendum.id && handleUpdateAddendum(addendum.id, field, val)
                  }
                  onDelete={() =>
                    addendum.id && handleRemoveAddendum(addendum.id)
                  }
                  jurisdictionCode={decodedCode}
                />
              ))}
            </div>
          )}
        </section>

        {/* Counter Offers Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-end pb-2 border-b border-[#E5E7EB]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#111827]">
                Counter Offers
              </h2>
              <p className="text-[13px] text-[#6B7280]">
                Counter offer templates with agent and purchase contract mappings.
              </p>
            </div>
            {config.counteroffers.length === 0 && (
              <Button
                onClick={handleAddCounterOffer}
                disabled={createTemplate.isPending}
                className="bg-[#0F766E] hover:bg-[#115E59] text-white h-10 px-4 rounded-[6px] shadow-sm gap-2"
              >
                <Plus className="h-4 w-4" /> Add Counter Offer
              </Button>
            )}
          </div>

          {config.counteroffers.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[10px] border border-[#E5E7EB]">
              <div className="bg-[#F8F9FB] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-[#9CA3AF]" />
              </div>
              <h3 className="text-[16px] font-semibold text-[#111827] mb-1">
                No counter offers configured
              </h3>
              <p className="text-[14px] text-[#6B7280] max-w-xs mx-auto mb-6">
                Start by adding a new counter offer template for this region.
              </p>
              <Button
                onClick={handleAddCounterOffer}
                variant="outline"
                className="h-10 px-5 rounded-[6px] border-[#E5E7EB]"
                disabled={createTemplate.isPending}
              >
                Create First Counter Offer
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {config.counteroffers.map((counteroffer, index) => (
                <CounterOfferCard
                  key={counteroffer.id || index}
                  counteroffer={counteroffer}
                  isSaving={updatePrompt.isPending || updateSlug.isPending}
                  onUpdate={(
                    field: "slug" | "contextPrompt" | "title",
                    val: string
                  ) =>
                    counteroffer.id && handleUpdateCounterOffer(counteroffer.id, field, val)
                  }
                  onDelete={() =>
                    counteroffer.id && handleRemoveCounterOffer(counteroffer.id)
                  }
                  jurisdictionCode={decodedCode}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function ContractCard({
  title,
  description,
  prompt,
  exists,
  isSaving,
  onPromptChange,
  jurisdictionCode,
  templateType,
}: {
  title: string;
  description: string;
  prompt: string;
  exists: boolean;
  isSaving: boolean;
  onPromptChange: (v: string) => void;
  jurisdictionCode: string;
  templateType: "BBA" | "CONTRACT";
}) {
  const router = useRouter();
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalPrompt(prompt);
    setHasChanges(false);
  }, [prompt]);

  const handleChange = (value: string) => {
    setLocalPrompt(value);
    setHasChanges(value !== prompt);
  };

  const handleSave = () => {
    const trimmedPrompt = localPrompt.trim();
    if (!trimmedPrompt) {
      toast.error("AI Extractions Prompt is required.");
      return;
    }
    if (trimmedPrompt.length > 10000) {
      toast.error("AI Extractions Prompt must be less than 10000 characters.");
      return;
    }
    onPromptChange(trimmedPrompt);
    setHasChanges(false);
  };

  const handleOpenStudio = () => {
    router.push(
      `/admin/designer/studio?jurisdictionCode=${jurisdictionCode}&type=${templateType.toLowerCase()}`
    );
  };

  return (
    <Card className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-none overflow-hidden">
      <CardHeader className="p-6 border-b border-[#F9FAFB]">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-[#F8F9FB] border border-[#E5E7EB] text-[#6B7280] rounded-none">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-[16px] font-semibold text-[#111827]">
              {title}
            </CardTitle>
            <CardDescription className="text-[13px] text-[#6B7280]">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
              AI Extractions Prompt
            </label>
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="h-8 px-3 text-[12px] bg-[#111827] hover:bg-black text-white gap-1.5 rounded-[4px]"
              >
                <Save className="h-3.5 w-3.5" /> Save Changes
              </Button>
            )}
          </div>
          <textarea
            value={localPrompt}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Describe the context for AI extraction..."
            disabled={isSaving}
            className="w-full min-h-[140px] p-4 text-[14px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all resize-none text-[#111827] placeholder:text-[#9CA3AF] disabled:opacity-50"
          />
        </div>

        <Button
          onClick={handleOpenStudio}
          className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white h-11 rounded-[6px] gap-2 font-medium"
        >
          {exists ? (
            <>
              <Edit3 className="h-4 w-4" /> Edit Layout Designer
            </>
          ) : (
            <>
              <Layout className="h-4 w-4" /> Create PDF Template
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function AddendumCard({
  addendum,
  isSaving,
  onUpdate,
  onDelete,
  jurisdictionCode,
}: {
  addendum: Addendum;
  isSaving: boolean;
  onUpdate: (field: "slug" | "contextPrompt" | "title", val: string) => void;
  onDelete: () => void;
  jurisdictionCode: string;
}) {
  const router = useRouter();
  const [localSlug, setLocalSlug] = useState(addendum.slug);
  const [localPrompt, setLocalPrompt] = useState(addendum.contextPrompt);
  const [localTitle, setLocalTitle] = useState(addendum.title || "");
  const [hasSlugChanges, setHasSlugChanges] = useState(false);
  const [hasPromptChanges, setHasPromptChanges] = useState(false);
  const [hasTitleChanges, setHasTitleChanges] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setLocalSlug(addendum.slug);
    setLocalPrompt(addendum.contextPrompt);
    setLocalTitle(addendum.title || "");
    setHasSlugChanges(false);
    setHasPromptChanges(false);
    setHasTitleChanges(false);
  }, [addendum.slug, addendum.contextPrompt, addendum.title]);

  const handleSlugChange = (value: string) => {
    setLocalSlug(value);
    setHasSlugChanges(value !== addendum.slug);
  };

  const handlePromptChange = (value: string) => {
    setLocalPrompt(value);
    setHasPromptChanges(value !== addendum.contextPrompt);
  };

  const handleTitleChange = (value: string) => {
    setLocalTitle(value);
    setHasTitleChanges(value !== (addendum.title || ""));
  };

  const handleSaveSlug = () => {
    const trimmedSlug = localSlug.trim();
    if (!trimmedSlug) {
      toast.error("Addendum Identifier (Slug) is required.");
      return;
    }
    if (trimmedSlug.length > 100) {
      toast.error("Addendum Identifier must be less than 100 characters.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      toast.error(
        "Addendum Identifier can only contain lowercase letters, numbers, and hyphens."
      );
      return;
    }
    onUpdate("slug", trimmedSlug);
    setHasSlugChanges(false);
  };

  const handleSavePrompt = () => {
    const trimmedPrompt = localPrompt.trim();
    if (!trimmedPrompt) {
      toast.error("Description is required.");
      return;
    }
    if (trimmedPrompt.length > 10000) {
      toast.error("Description must be less than 10000 characters.");
      return;
    }
    onUpdate("contextPrompt", trimmedPrompt);
    setHasPromptChanges(false);
  };

  const handleSaveTitle = () => {
    const trimmedTitle = localTitle.trim();
    if (!trimmedTitle) {
      toast.error("Enter addendum's Name.");
      return;
    }
    if (trimmedTitle.length > 200) {
      toast.error("Name must be less than 200 characters.");
      return;
    }
    onUpdate("title", trimmedTitle);
    setHasTitleChanges(false);
  };

  const handleOpenStudio = () => {
    router.push(
      `/admin/designer/studio?jurisdictionCode=${jurisdictionCode}&type=addendum&slug=${addendum.slug}`
    );
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-[10px] border border-[#E5E7EB] p-6 hover:border-[#0F766E] transition-all duration-200 group">
        <div className="flex items-start gap-6">
          <div className="p-2.5 bg-[#ECFDF5] text-[#0F766E] rounded-none shrink-0 group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
            <FileText className="h-5 w-5" />
          </div>

          <div className="flex-1 grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Name
                </label>
                {hasTitleChanges && (
                  <Button
                    onClick={handleSaveTitle}
                    disabled={isSaving}
                    size="sm"
                    className="h-7 px-2.5 text-[11px] bg-[#111827] hover:bg-black text-white"
                  >
                    Save
                  </Button>
                )}
              </div>
              <Input
                value={localTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={isSaving}
                className="h-10 text-[14px] font-medium border-[#E5E7EB] rounded-[6px] focus-visible:ring-[#0F766E] disabled:opacity-50"
                placeholder="e.g. HOA Disclosure"
              />
            </div>

            {/* Slug (Identifier) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Addendum Identifier (Slug)
                </label>
                {hasSlugChanges && (
                  <Button
                    onClick={handleSaveSlug}
                    disabled={isSaving}
                    size="sm"
                    className="h-7 px-2.5 text-[11px] bg-[#111827] hover:bg-black text-white"
                  >
                    Save
                  </Button>
                )}
              </div>
              <Input
                value={localSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                disabled={isSaving}
                className="h-10 text-[14px] font-medium border-[#E5E7EB] rounded-[6px] focus-visible:ring-[#0F766E] disabled:opacity-50"
                placeholder="e.g. hoa-disclosure"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Description
                </label>
                {hasPromptChanges && (
                  <Button
                    onClick={handleSavePrompt}
                    disabled={isSaving}
                    size="sm"
                    className="h-7 px-2.5 text-[11px] bg-[#111827] hover:bg-black text-white"
                  >
                    Save
                  </Button>
                )}
              </div>
              <textarea
                value={localPrompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="Describe the context for AI extraction..."
                disabled={isSaving}
                className="w-full min-h-[80px] p-2.5 text-[14px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all resize-none text-[#111827] placeholder:text-[#9CA3AF] disabled:opacity-50"
              />
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <Button
                onClick={handleOpenStudio}
                disabled={!addendum.slug}
                variant="outline"
                className="flex-1 h-10 rounded-[6px] border-[#E5E7EB] hover:bg-[#F8F9FB] hover:text-[#0F766E] text-[#4B5563] font-medium gap-2"
              >
                <Layout className="h-4 w-4" />
                {addendum.slug ? "Open Studio" : "Define Slug to Open Studio"}
              </Button>

              <Button
                onClick={handleDeleteClick}
                variant="ghost"
                size="icon"
                className="bg-[#FEF2F2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-[6px] h-10 w-10 shrink-0 border border-[#FEE2E2]"
                aria-label="Delete addendum"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-white border-zinc-200 shadow-2xl sm:max-w-[400px] p-6 gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900">
              Delete this addendum?
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              This will remove the addendum template. Documents already created
              from it are not affected.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CounterOfferCard({
  counteroffer,
  isSaving,
  onUpdate,
  onDelete,
  jurisdictionCode,
}: {
  counteroffer: CounterOffer;
  isSaving: boolean;
  onUpdate: (field: "slug" | "contextPrompt" | "title", val: string) => void;
  onDelete: () => void;
  jurisdictionCode: string;
}) {
  const router = useRouter();
  const [localSlug, setLocalSlug] = useState(counteroffer.slug);
  const [localPrompt, setLocalPrompt] = useState(counteroffer.contextPrompt);
  const [localTitle, setLocalTitle] = useState(counteroffer.title || "");
  const [hasSlugChanges, setHasSlugChanges] = useState(false);
  const [hasPromptChanges, setHasPromptChanges] = useState(false);
  const [hasTitleChanges, setHasTitleChanges] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setLocalSlug(counteroffer.slug);
    setLocalPrompt(counteroffer.contextPrompt);
    setLocalTitle(counteroffer.title || "");
    setHasSlugChanges(false);
    setHasPromptChanges(false);
    setHasTitleChanges(false);
  }, [counteroffer.slug, counteroffer.contextPrompt, counteroffer.title]);

  const handleSlugChange = (value: string) => {
    setLocalSlug(value);
    setHasSlugChanges(value !== counteroffer.slug);
  };

  const handlePromptChange = (value: string) => {
    setLocalPrompt(value);
    setHasPromptChanges(value !== counteroffer.contextPrompt);
  };

  const handleTitleChange = (value: string) => {
    setLocalTitle(value);
    setHasTitleChanges(value !== (counteroffer.title || ""));
  };

  const handleSaveSlug = () => {
    const trimmedSlug = localSlug.trim();
    if (!trimmedSlug) {
      toast.error("Counter Offer Identifier (Slug) is required.");
      return;
    }
    if (trimmedSlug.length > 100) {
      toast.error("Counter Offer Identifier must be less than 100 characters.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      toast.error(
        "Counter Offer Identifier can only contain lowercase letters, numbers, and hyphens."
      );
      return;
    }
    onUpdate("slug", trimmedSlug);
    setHasSlugChanges(false);
  };

  const handleSavePrompt = () => {
    const trimmedPrompt = localPrompt.trim();
    if (!trimmedPrompt) {
      toast.error("Description is required.");
      return;
    }
    if (trimmedPrompt.length > 10000) {
      toast.error("Description must be less than 10000 characters.");
      return;
    }
    onUpdate("contextPrompt", trimmedPrompt);
    setHasPromptChanges(false);
  };

  const handleSaveTitle = () => {
    const trimmedTitle = localTitle.trim();
    if (!trimmedTitle) {
      toast.error("Enter counter offer's Name.");
      return;
    }
    if (trimmedTitle.length > 200) {
      toast.error("Name must be less than 200 characters.");
      return;
    }
    onUpdate("title", trimmedTitle);
    setHasTitleChanges(false);
  };

  const handleOpenStudio = () => {
    router.push(
      `/admin/designer/studio?jurisdictionCode=${jurisdictionCode}&type=counteroffers&slug=${counteroffer.slug}`
    );
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-[10px] border border-[#E5E7EB] p-6 hover:border-[#0F766E] transition-all duration-200 group">
        <div className="flex items-start gap-6">
          <div className="p-2.5 bg-[#ECFDF5] text-[#0F766E] rounded-none shrink-0 group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
            <FileText className="h-5 w-5" />
          </div>

          <div className="flex-1 grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Name
                </label>
                {hasTitleChanges && (
                  <Button
                    onClick={handleSaveTitle}
                    disabled={isSaving}
                    size="sm"
                    className="h-7 px-2.5 text-[11px] bg-[#111827] hover:bg-black text-white"
                  >
                    Save
                  </Button>
                )}
              </div>
              <Input
                value={localTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={isSaving}
                className="h-10 text-[14px] font-medium border-[#E5E7EB] rounded-[6px] focus-visible:ring-[#0F766E] disabled:opacity-50"
                placeholder="e.g. Price Adjustment"
              />
            </div>

            {/* Slug (Identifier) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Counter Offer Identifier (Slug)
                </label>
                {hasSlugChanges && (
                  <Button
                    onClick={handleSaveSlug}
                    disabled={isSaving}
                    size="sm"
                    className="h-7 px-2.5 text-[11px] bg-[#111827] hover:bg-black text-white"
                  >
                    Save
                  </Button>
                )}
              </div>
              <Input
                value={localSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                disabled={isSaving}
                className="h-10 text-[14px] font-medium border-[#E5E7EB] rounded-[6px] focus-visible:ring-[#0F766E] disabled:opacity-50"
                placeholder="e.g. price-adjustment"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                  Description
                </label>
                {hasPromptChanges && (
                  <Button
                    onClick={handleSavePrompt}
                    disabled={isSaving}
                    size="sm"
                    className="h-7 px-2.5 text-[11px] bg-[#111827] hover:bg-black text-white"
                  >
                    Save
                  </Button>
                )}
              </div>
              <textarea
                value={localPrompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="Describe context for AI extraction..."
                disabled={isSaving}
                className="w-full min-h-[80px] p-2.5 text-[14px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all resize-none text-[#111827] placeholder:text-[#9CA3AF] disabled:opacity-50"
              />
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <Button
                onClick={handleOpenStudio}
                disabled={!counteroffer.slug}
                variant="outline"
                className="flex-1 h-10 rounded-[6px] border-[#E5E7EB] hover:bg-[#F8F9FB] hover:text-[#0F766E] text-[#4B5563] font-medium gap-2"
              >
                <Layout className="h-4 w-4" />
                {counteroffer.slug ? "Open Studio" : "Define Slug to Open Studio"}
              </Button>

              <Button
                onClick={handleDeleteClick}
                variant="ghost"
                size="icon"
                className="bg-[#FEF2F2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-[6px] h-10 w-10 shrink-0 border border-[#FEE2E2]"
                aria-label="Delete counter offer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-white border-zinc-200 shadow-2xl sm:max-w-[400px] p-6 gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900">
              Delete this counter offer?
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              This will remove the counter offer template. Documents already created
              from it are not affected.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
