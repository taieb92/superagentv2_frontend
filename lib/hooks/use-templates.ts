import {
  useGetTemplatesQuery,
  useFindOrCreateTemplateQuery,
  useGetTemplateVersionByIdQuery,
  useUpdatePromptsMutationWithParameters,
  useUpdateSlugMutationWithParameters,
  useUpdatePdfmeLayoutMutationWithParameters,
  useCreateMutation,
  getTemplatesQueryKey,
} from "@/lib/api/generated/fetch-client/Query";
import { parseApiError } from "@/lib/api/error-handler";
import {
  ContractTemplateUpdateRequest,
  TemplateSlugUpdateRequest,
  PdfmeLayoutUpdateRequest,
  ContractTemplateCreateRequest,
  ContractTemplateCreateRequestTemplateType,
  TemplateType2,
  JsonNode,
  TemplateListDto,
  type ContractTemplateVersionDto,
} from "@/lib/api/generated/fetch-client";
import type { PdfmeLayout } from "@/lib/types/pdfme";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Client } from "@/lib/api/generated/fetch-client";
import { getClientFactory } from "@/lib/api/generated/fetch-client/helpers";

// Type aliases for compatibility
export type TemplateType = "BBA" | "CONTRACT" | "ADDENDA" | "COUNTEROFFERS";
export type Template = ContractTemplateVersionDto;
export type TemplateListItem = TemplateListDto;

// Helper to map TemplateType to ContractTemplateCreateRequestTemplateType
function mapTemplateTypeToCreateRequestType(
  templateType: TemplateType
): ContractTemplateCreateRequestTemplateType {
  const upper = templateType.toUpperCase();
  if (upper === "BBA") return ContractTemplateCreateRequestTemplateType.BBA;
  if (upper === "CONTRACT")
    return ContractTemplateCreateRequestTemplateType.CONTRACT;
  if (upper === "ADDENDA")
    return ContractTemplateCreateRequestTemplateType.ADDENDA;
  if (upper === "COUNTEROFFERS")
    return ContractTemplateCreateRequestTemplateType.COUNTEROFFERS;
  return ContractTemplateCreateRequestTemplateType.CONTRACT; // default
}

export const useTemplatesByJurisdiction = (
  jurisdictionCode: string | null,
  templateType?: TemplateType
) => {
  // Map TemplateType to generated TemplateType2 enum
  let templateTypeEnum: TemplateType2 | undefined = undefined;
  if (templateType) {
    const upper = templateType.toUpperCase();
    if (upper === "BBA") templateTypeEnum = TemplateType2.BBA;
    else if (upper === "CONTRACT") templateTypeEnum = TemplateType2.CONTRACT;
    else if (upper === "ADDENDA") templateTypeEnum = TemplateType2.ADDENDA;
    else if (upper === "COUNTEROFFERS")
      templateTypeEnum = TemplateType2.COUNTEROFFERS;
  }

  const query = useGetTemplatesQuery(
    jurisdictionCode?.toUpperCase() || "",
    templateTypeEnum,
    {
      enabled: !!jurisdictionCode,
    }
  );

  useEffect(() => {
    if (query.error) {
      const errorMessage =
        query.error instanceof Error ? query.error.message : "Unknown error";
      toast.error(`Failed to load templates: ${errorMessage}`);
    }
  }, [query.error]);

  return query;
};

export const useTemplateById = (templateId: string | null) => {
  // Use DRAFT status to get the latest draft version
  const query = useGetTemplateVersionByIdQuery(
    templateId || "",
    "DRAFT" as any, // Status2 enum
    {
      enabled: !!templateId,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (query.error) {
      const errorMessage =
        query.error instanceof Error ? query.error.message : "Unknown error";
      toast.error(`Failed to load template: ${errorMessage}`);
    }
  }, [query.error]);

  return query;
};

export const useTemplate = (
  jurisdictionCode: string | null,
  templateType: TemplateType | null,
  slug?: string | null
) => {
  // Map TemplateType to generated enum
  const templateTypeEnum = templateType
    ? (templateType.toUpperCase() as
        | "BBA"
        | "CONTRACT"
        | "ADDENDA"
        | "COUNTEROFFERS")
    : null;

  const query = useFindOrCreateTemplateQuery(
    jurisdictionCode?.toUpperCase() || "",
    templateTypeEnum as any,
    slug || undefined,
    {
      enabled: !!jurisdictionCode && !!templateType,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (query.error) {
      const errorMessage =
        query.error instanceof Error ? query.error.message : "Unknown error";
      toast.error(`Failed to load template: ${errorMessage}`);
    }
  }, [query.error]);

  return query;
};

export const useUpdateTemplatePrompt = () => {
  const queryClient = useQueryClient();

  const patchList = (
    old: TemplateListDto[] | undefined,
    templateId: string,
    documentPrompt: string | undefined,
    title: string | undefined
  ): TemplateListDto[] | undefined => {
    if (!old || !Array.isArray(old)) return old;
    const i = old.findIndex((t) => t.id === templateId);
    if (i < 0) return old;
    const next = [...old];
    next[i] = {
      ...next[i],
      ...(documentPrompt !== undefined && { documentPrompt }),
      ...(title !== undefined && { title }),
    } as TemplateListDto;
    return next;
  };

  const mutation = useUpdatePromptsMutationWithParameters({
    onMutate: async (variables) => {
      const templateId = variables?.id;
      if (!templateId) return undefined;
      await queryClient.cancelQueries({ queryKey: ["Client", "getTemplates"] });
      const previousList = queryClient.getQueriesData<TemplateListDto[]>({
        queryKey: ["Client", "getTemplates"],
      });
      queryClient.setQueriesData(
        { queryKey: ["Client", "getTemplates"] },
        (old: TemplateListDto[] | undefined) =>
          patchList(
            old,
            templateId,
            variables?.body?.documentPrompt,
            variables?.body?.title
          ) ?? old
      );
      return { previousList };
    },
    onError: (err, _variables, ctx) => {
      if (ctx?.previousList) {
        ctx.previousList.forEach(([key, data]) =>
          queryClient.setQueryData(key, data)
        );
      }
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to save prompt: ${msg}`);
    },
    onSuccess: (_data, variables) => {
      const templateId = variables?.id;
      const documentPrompt = variables?.body?.documentPrompt;
      const title = variables?.body?.title;
      if (templateId) {
        queryClient.setQueriesData(
          { queryKey: ["Client", "getTemplates"] },
          (old: TemplateListDto[] | undefined) =>
            patchList(old, templateId, documentPrompt, title) ?? old
        );
      }
      toast.success("Prompt saved successfully");
    },
  });

  // Wrap to match old API: mutate({ templateId, documentPrompt, title? })
  return {
    ...mutation,
    mutate: (params: {
      templateId: string;
      documentPrompt: string;
      title?: string;
    }) => {
      const request = new ContractTemplateUpdateRequest({
        documentPrompt: params.documentPrompt,
        title: params.title,
      });
      mutation.mutate({
        id: params.templateId,
        body: request,
      } as any);
    },
    mutateAsync: async (params: {
      templateId: string;
      documentPrompt: string;
      title?: string;
    }) => {
      const request = new ContractTemplateUpdateRequest({
        documentPrompt: params.documentPrompt,
        title: params.title,
      });
      return mutation.mutateAsync({
        id: params.templateId,
        body: request,
      } as any);
    },
  };
};

export const useUpdateTemplateSlug = () => {
  const queryClient = useQueryClient();

  const mutation = useUpdateSlugMutationWithParameters({
    onMutate: async (variables) => {
      const templateId = variables?.id;
      const slug = variables?.body?.slug;
      if (!templateId || slug === undefined) return undefined;
      await queryClient.cancelQueries({ queryKey: ["Client", "getTemplates"] });
      const previousList = queryClient.getQueriesData<TemplateListDto[]>({
        queryKey: ["Client", "getTemplates"],
      });
      queryClient.setQueriesData(
        { queryKey: ["Client", "getTemplates"] },
        (old: TemplateListDto[] | undefined) => {
          if (!old || !Array.isArray(old)) return old;
          const i = old.findIndex((t) => t.id === templateId);
          if (i < 0) return old;
          const next = [...old];
          next[i] = { ...next[i], slug } as TemplateListDto;
          return next;
        }
      );
      return { previousList };
    },
    onError: (err, variables, ctx) => {
      // Rollback optimistic update
      if (ctx?.previousList) {
        ctx.previousList.forEach(([key, data]) =>
          queryClient.setQueryData(key, data)
        );
      }

      // Force cache refresh to ensure UI reverts to last saved value
      queryClient.invalidateQueries({ queryKey: ["Client", "getTemplates"] });

      // Parse error for user-friendly message
      const { message, description } = parseApiError(err);
      const slugValue = variables?.body?.slug;

      // Provide specific guidance for duplicate slug error
      if (
        message.toLowerCase().includes("already exists") ||
        message.toLowerCase().includes("duplicate")
      ) {
        toast.error(
          `The slug "${slugValue}" is already in use. Please choose a different unique identifier.`,
          description ? { description } : undefined
        );
      } else {
        toast.error(message, description ? { description } : undefined);
      }
    },
    onSuccess: (_data, variables) => {
      const templateId = variables?.id;
      const slug = variables?.body?.slug;
      if (templateId && slug !== undefined) {
        queryClient.setQueriesData(
          { queryKey: ["Client", "getTemplates"] },
          (old: TemplateListDto[] | undefined) => {
            if (!old || !Array.isArray(old)) return old;
            const i = old.findIndex((t) => t.id === templateId);
            if (i < 0) return old;
            const next = [...old];
            next[i] = { ...next[i], slug } as TemplateListDto;
            return next;
          }
        );
      }
      toast.success("Slug saved successfully");
    },
  });

  // Wrap to match old API: mutate({ templateId, slug })
  return {
    ...mutation,
    mutate: (params: { templateId: string; slug: string }) => {
      const request = new TemplateSlugUpdateRequest({
        slug: params.slug,
      });
      mutation.mutate({
        id: params.templateId,
        body: request,
      } as any);
    },
    mutateAsync: async (params: { templateId: string; slug: string }) => {
      const request = new TemplateSlugUpdateRequest({
        slug: params.slug,
      });
      return mutation.mutateAsync({
        id: params.templateId,
        body: request,
      } as any);
    },
  };
};

export const useUpdateTemplateLayout = () => {
  const queryClient = useQueryClient();

  const mutation = useUpdatePdfmeLayoutMutationWithParameters({
    onSuccess: () => {
      // Invalidate template list queries
      queryClient.invalidateQueries({ queryKey: ["Client", "getTemplates"] });
      // Invalidate findOrCreateTemplate queries so the studio page refetches the updated template
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.length >= 2 &&
            key[0] === "Client" &&
            (key[1] === "findOrCreateTemplate" ||
              key[1] === "getTemplateVersionById")
          );
        },
      });
      toast.success("Template layout saved successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save template: ${errorMessage}`);
    },
  });

  // Wrap to match old API: mutate({ templateId, pdfmeLayout })
  return {
    ...mutation,
    mutate: (params: { templateId: string; pdfmeLayout: PdfmeLayout }) => {
      // Convert PdfmeLayout to JsonNode
      const jsonNode = JsonNode.fromJS(params.pdfmeLayout);
      const request = new PdfmeLayoutUpdateRequest({
        pdfmeLayout: jsonNode,
      });
      mutation.mutate({
        id: params.templateId,
        body: request,
      } as any);
    },
    mutateAsync: async (params: {
      templateId: string;
      pdfmeLayout: PdfmeLayout;
    }) => {
      const jsonNode = JsonNode.fromJS(params.pdfmeLayout);
      const request = new PdfmeLayoutUpdateRequest({
        pdfmeLayout: jsonNode,
      });
      return mutation.mutateAsync({
        id: params.templateId,
        body: request,
      } as any);
    },
  };
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  const mutation = useCreateMutation({
    onSuccess: (data, variables) => {
      const templateType = String(variables?.templateType);
      const isAddenda = templateType === "ADDENDA";
      const isCounterOffers = templateType === "COUNTEROFFERS";

      if (data && (isAddenda || isCounterOffers) && variables) {
        const code = variables.jurisdictionCode?.toUpperCase();
        const key = getTemplatesQueryKey(code ?? "", undefined);
        const newItem = TemplateListDto.fromJS({
          id: data,
          jurisdictionCode: variables.jurisdictionCode ?? "",
          templateType: templateType,
          slug: variables.slug ?? undefined,
          title: variables.title ?? (isAddenda ? "Addendum" : "Counter Offers"),
          documentPrompt: variables.documentPrompt ?? "",
          createdAt: new Date().toISOString(),
        });
        queryClient.setQueryData<TemplateListDto[]>(key, (old) => {
          if (!old) return [newItem];
          const others = old.filter(
            (t) => t.templateType !== templateType &&
              (templateType !== "ADDENDA" || (t.templateType as string) !== "ADDENDUM")
          );
          const matching = old.filter(
            (t) => t.templateType === templateType ||
              (templateType === "ADDENDA" && (t.templateType as string) === "ADDENDUM")
          );
          return [...others, newItem, ...matching];
        });
      }
      toast.success("Template created successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create template: ${errorMessage}`);
    },
  });

  // Wrap to match old API: mutate({ jurisdictionCode, templateType, documentPrompt, slug?, title? })
  return {
    ...mutation,
    mutate: (params: {
      jurisdictionCode: string;
      templateType: TemplateType;
      documentPrompt: string;
      slug?: string;
      title?: string;
    }) => {
      const templateTypeEnum = mapTemplateTypeToCreateRequestType(
        params.templateType
      );
      const request = new ContractTemplateCreateRequest({
        jurisdictionCode: params.jurisdictionCode.toUpperCase(),
        templateType: templateTypeEnum,
        documentPrompt: params.documentPrompt,
        slug: params.slug,
        title: params.title,
      });
      mutation.mutate(request);
    },
    mutateAsync: async (params: {
      jurisdictionCode: string;
      templateType: TemplateType;
      documentPrompt: string;
      slug?: string;
      title?: string;
    }) => {
      const templateTypeEnum = mapTemplateTypeToCreateRequestType(
        params.templateType
      );
      const request = new ContractTemplateCreateRequest({
        jurisdictionCode: params.jurisdictionCode.toUpperCase(),
        templateType: templateTypeEnum,
        documentPrompt: params.documentPrompt,
        slug: params.slug,
        title: params.title,
      });
      return mutation.mutateAsync(request);
    },
  };
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  return {
    mutate: async (id: string) => {
      setIsPending(true);
      try {
        const client = getClientFactory()(Client);
        await client.deleteTemplate(id);
        queryClient.invalidateQueries({ queryKey: ["Client", "getTemplates"] });
        toast.success("Template deleted successfully");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to delete template: ${errorMessage}`);
      } finally {
        setIsPending(false);
      }
    },
    mutateAsync: async (id: string) => {
      setIsPending(true);
      try {
        const client = getClientFactory()(Client);
        await client.deleteTemplate(id);
        queryClient.invalidateQueries({ queryKey: ["Client", "getTemplates"] });
        toast.success("Template deleted successfully");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to delete template: ${errorMessage}`);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    isPending,
  };
};
