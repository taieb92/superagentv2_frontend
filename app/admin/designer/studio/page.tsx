"use client";

import DesignerHeader from "@/components/DesignerHeader";
import { DesignerNavBar, NavItem } from "@/components/DesignerNavBar";
import { Button } from "@/components/ui/button";
import {
  type ContractTemplateVersionDto as ApiTemplate,
  TemplateType2 as TemplateType,
} from "@/lib/api/generated/fetch-client";
import {
  generatePDF,
  getBlankTemplate,
  getFontsData,
  readFile,
  removeTitleFromTemplate,
  validateTemplateFields,
} from "@/lib/helper";
import {
  useTemplate,
  useUpdateTemplateLayout,
  type TemplateType as HookTemplateType,
} from "@/lib/hooks/use-templates";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GetFieldsRequest } from "@/lib/api/generated/fetch-client";
import {
  useGetMlsFieldsQuery,
  Client,
} from "@/lib/api/generated/fetch-client/Query";
import { getPlugins } from "@/lib/plugins";
import { logger } from "@/lib/utils/logger";
import { checkTemplate, cloneDeep, Template } from "@pdfme/common";
import { Designer } from "@pdfme/ui";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

/**
 * Main Designer component for creating and editing PDF templates.
 *
 * Features:
 * - Load templates from API (auto-creates if doesn't exist)
 * - Change base PDF
 * - Save templates to API
 * - Generate PDFs from templates
 * - All templates are automatically cleaned to remove title fields
 *
 * @component
 */
function DesignerApp() {
  const searchParams = useSearchParams();
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Designer | null>(null);
  const currentTemplateId = useRef<string | null>(null);
  const previousType = useRef<TemplateType | null>(null);

  const jurisdictionCode = searchParams.get("jurisdictionCode");
  const typeParam = searchParams.get("type");
  const slug = searchParams.get("slug");

  // Convert URL parameter to API TemplateType enum
  // URL uses lowercase: "bba", "purchase", "addendum"
  // API expects uppercase: "BBA", "CONTRACT", "ADDENDA"
  const type: TemplateType | null = useMemo(() => {
    if (!typeParam) return null;
    const normalized = typeParam.toLowerCase();
    if (normalized === "bba") return TemplateType.BBA;
    if (normalized === "purchase" || normalized === "contract")
      return TemplateType.CONTRACT;
    if (normalized === "addendum" || normalized === "addenda")
      return TemplateType.ADDENDA;
    if (normalized === "counteroffers" || normalized === "counteroffer")
      return TemplateType.COUNTEROFFERS;
    return null;
  }, [typeParam]);

  const {
    data: templateData,
    isLoading: isLoadingTemplate,
    error: templateError,
  } = useTemplate(
    jurisdictionCode,
    type as HookTemplateType,
    slug || undefined
  ) as {
    data: ApiTemplate | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const queryClient = useQueryClient();

  // Direct query implementations
  const { data: mlsFields } = useGetMlsFieldsQuery(jurisdictionCode ?? "", {
    enabled: !!jurisdictionCode,
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const { userId } = useAuth();
  const queryParams = {
    enabled: !!jurisdictionCode && !!userId,
    refetchOnWindowFocus: true, // Refetch when window regains focus
  };

  // Extract mappable field keys from getFields response.
  // API returns { id, createdAt, buyerName, address, fields: { key: type, ... } } - use keys from fields.
  const extractFieldKeys = (response: Record<string, unknown> | null): string[] => {
    if (!response) return [];
    const fields = response.fields;
    if (fields && typeof fields === "object" && !Array.isArray(fields)) {
      return Object.keys(fields);
    }
    // Fallback: flat response (legacy) - exclude metadata keys
    return Object.keys(response).filter(
      (k) => !["id", "createdAt", "buyerName", "address"].includes(k)
    );
  };

  const { data: bbaFields } = useQuery({
    queryKey: ["bbaFields", jurisdictionCode, userId],
    queryFn: async () => {
      const response = await Client().getFields(
        new GetFieldsRequest({
          type: "bba",
          userId: userId!,
          jurisdictionCode: jurisdictionCode!,
        })
      );
      return extractFieldKeys(response as Record<string, unknown>);
    },
    ...queryParams,
  });

  const { data: purchaseFields } = useQuery({
    queryKey: ["purchaseFields", jurisdictionCode, userId],
    queryFn: async () => {
      const response = await Client().getFields(
        new GetFieldsRequest({
          type: "purchase",
          userId: userId!,
          jurisdictionCode: jurisdictionCode!,
        })
      );
      return extractFieldKeys(response as Record<string, unknown>);
    },
    ...queryParams,
  });

  const { data: agentFields } = useQuery({
    queryKey: ["agentFields", jurisdictionCode],
    queryFn: async () => {
      const response = await Client().getFields(
        new GetFieldsRequest({
          type: "agent",
          jurisdictionCode: jurisdictionCode!,
        })
      );
      return extractFieldKeys(response as Record<string, unknown>);
    },
    enabled: !!jurisdictionCode,
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Stable references for data
  const mlsFieldsRef = useRef(mlsFields);
  const bbaFieldsRef = useRef(bbaFields);
  const purchaseFieldsRef = useRef(purchaseFields);
  const agentFieldsRef = useRef(agentFields);

  useEffect(() => {
    mlsFieldsRef.current = mlsFields;
    bbaFieldsRef.current = bbaFields;
    purchaseFieldsRef.current = purchaseFields;
    agentFieldsRef.current = agentFields;
  }, [mlsFields, bbaFields, purchaseFields, agentFields]);

  const updateLayout = useUpdateTemplateLayout();

  /**
   * Invalidates all field queries to refresh mapping lists.
   * Called when fields might have been created or updated.
   */
  const invalidateFieldQueries = useCallback(() => {
    if (jurisdictionCode) {
      // Invalidate MLS fields query
      queryClient.invalidateQueries({
        queryKey: ["Client", "getMlsFields", jurisdictionCode],
      });

      // Invalidate BBA fields query
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["bbaFields", jurisdictionCode, userId],
        });
      }

      // Invalidate Purchase fields query
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["purchaseFields", jurisdictionCode, userId],
        });
      }

      // Invalidate Agent fields query
      queryClient.invalidateQueries({
        queryKey: ["agentFields", jurisdictionCode],
      });
    }
  }, [jurisdictionCode, userId, queryClient]);

  // Invalidate field queries when window regains focus
  // This handles the case where a user creates a field in another tab/window
  useEffect(() => {
    const handleFocus = () => {
      invalidateFieldQueries();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [invalidateFieldQueries]);

  // Invalidate field queries when jurisdiction or user changes
  // This ensures fresh data when switching contexts
  useEffect(() => {
    if (jurisdictionCode) {
      invalidateFieldQueries();
    }
  }, [jurisdictionCode, userId, invalidateFieldQueries]);

  // Invalidate field queries after template layout is saved
  // This handles the case where fields might have been created elsewhere
  useEffect(() => {
    if (updateLayout.isSuccess) {
      // Small delay to ensure backend has processed the field creation
      const timer = setTimeout(() => {
        invalidateFieldQueries();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [updateLayout.isSuccess, invalidateFieldQueries]);

  // Debug logging
  useEffect(() => {
    if (templateError) {
      logger.error("Template query error:", templateError);
    }
    if (templateData) {
      logger.log("Template loaded:", {
        id: templateData.id,
        hasLayout: !!templateData.pdfmeLayout,
      });
    }
  }, [templateData, templateError]);

  /**
   * Saves the current template to the API (called automatically by PDFME on changes).
   */
  const onSaveTemplate = useCallback(
    (template?: Template) => {
      if (!designer.current || !currentTemplateId.current) return;

      const templateToSave = template || designer.current.getTemplate();

      // Validate required fields
      const validation = validateTemplateFields(templateToSave);
      if (!validation.isValid) {
        // Don't show error for auto-saves, just skip
        return;
      }

      const cleanedTemplate = removeTitleFromTemplate(templateToSave);
      /* 
        // Auto-save disabled per user request
        updateLayout.mutate({
            templateId: currentTemplateId.current,
            pdfmeLayout: cleanedTemplate,
        });
        */
    },
    [updateLayout]
  );

  /**
   * Initializes the PDF Designer instance.
   * Loads template from API (auto-creates if doesn't exist).
   */
  const buildDesigner = useCallback(async () => {
    if (!designerRef.current || !templateData) return;

    try {
      let template: Template = getBlankTemplate();

      // Use PDFME layout from API if available and valid, otherwise use blank template
      if (templateData.pdfmeLayout) {
        try {
          const layout = templateData.pdfmeLayout as unknown as Template;
          // Validate PDFME layout structure
          checkTemplate(layout);
          template = removeTitleFromTemplate(layout);
        } catch (error) {
          // If PDFME layout is invalid (e.g., missing schemas/basePdf), use blank template
          logger.warn(
            "Invalid pdfmeLayout from API, using blank template:",
            error
          );
          template = getBlankTemplate();
        }
      }

      currentTemplateId.current = templateData.id ?? null;

      designer.current = new Designer({
        domContainer: designerRef.current,
        template,
        options: {
          font: getFontsData(),
          lang: "en",
          labels: {
            "signature.clear": "🗑️",
          },
          theme: {
            token: { colorPrimary: "#25c2a0" },
          },
          maxZoom: 250,
        },
        plugins: getPlugins(type as any),
      });

      // Handle selection changes via DOM events since Designer API method is uncertain in this version
      const container = designerRef.current;
      const handleInteraction = () => {
        // Trigger an update check
        // We'll use a short timeout to let internal state update
        setTimeout(() => {
          const selection =
            (designer.current as any).getSelection?.() ||
            (designer.current as any).getSelectedSchema?.();
          window.dispatchEvent(
            new CustomEvent("pdfme-selection-change", { detail: selection })
          );
        }, 100);
      };

      if (container) {
        container.addEventListener("click", handleInteraction);
        container.addEventListener("keyup", handleInteraction);
      }

      // Cleanup
      const originalDestroy = designer.current.destroy;
      designer.current.destroy = () => {
        if (container) {
          container.removeEventListener("click", handleInteraction);
          container.removeEventListener("keyup", handleInteraction);
        }
        originalDestroy.call(designer.current);
      };

      // designer.current.onSaveTemplate(onSaveTemplate);
    } catch (error) {
      logger.error("Error initializing designer:", error);
      toast.error(
        `Failed to load template: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }, [templateData, onSaveTemplate, type]);

  /**
   * Handles changing the base PDF for the current template.
   * Reads the selected PDF file and updates the template's basePdf property.
   * Automatically saves to API after updating.
   *
   * @param e - File input change event
   */
  const onChangeBasePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && designer.current && currentTemplateId.current) {
      readFile(e.target.files[0], "dataURL").then(async (basePdf) => {
        const newTemplate = cloneDeep(designer.current!.getTemplate());
        newTemplate.basePdf = basePdf;
        designer.current!.updateTemplate(newTemplate);

        // Auto-save disabled per user request
        /*
                const cleanedTemplate = removeTitleFromTemplate(newTemplate);
                updateLayout.mutate({
                    templateId: currentTemplateId.current!,
                    pdfmeLayout: cleanedTemplate,
                });
                */
      });
    }
  };

  /**
   * Saves the current template to the API.
   * Blocks save if any field has an empty description.
   */
  const onSaveRemote = async () => {
    if (!designer.current || !currentTemplateId.current) {
      toast.error("Template not loaded");
      return;
    }

    const template = designer.current.getTemplate();

    // Validate - block save if validation fails
    const validation = validateTemplateFields(template);
    if (!validation.isValid) {
      const errorMessage =
        validation.errors.slice(0, 5).join("\n") +
        (validation.errors.length > 5
          ? `\n... and ${validation.errors.length - 5} more field(s)`
          : "");
      toast.error(
        `Cannot save: Some fields are missing required information:\n${errorMessage}`,
        {
          duration: 8000,
        }
      );
      return; // Block save
    }

    // Save to server only if validation passes
    const cleanedTemplate = removeTitleFromTemplate(template);

    updateLayout.mutate({
      templateId: currentTemplateId.current,
      pdfmeLayout: cleanedTemplate,
    });
  };

  /**
   * Shows confirmation dialog before resetting the template.
   */
  const showResetConfirmation = () => {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:10000;";

    // Create modal
    const modal = document.createElement("div");
    modal.style.cssText =
      "background:white;border-radius:14px;padding:32px;width:400px;max-width:90vw;display:flex;flex-direction:column;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);";

    // Title
    const title = document.createElement("h3");
    title.textContent = "Reset Template";
    title.style.cssText =
      "margin:0 0 16px 0;font-size:18px;font-weight:500;color:#111827;";

    // Message
    const message = document.createElement("p");
    message.textContent =
      "Are you sure you want to reset the template? This will remove all fields and cannot be undone.";
    message.style.cssText =
      "margin:0 0 24px 0;font-size:14px;color:#6b7280;line-height:1.5;";

    // Buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.cssText =
      "display:flex;gap:12px;justify-content:flex-end;";

    // Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.cssText =
      "padding:8px 16px;border:1px solid #d1d5db;border-radius:6px;background:white;color:#374151;font-size:14px;font-weight:400;cursor:pointer;transition:all 0.2s;";
    cancelButton.addEventListener("mouseenter", () => {
      cancelButton.style.backgroundColor = "#f9fafb";
    });
    cancelButton.addEventListener("mouseleave", () => {
      cancelButton.style.backgroundColor = "white";
    });
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });

    // Confirm button
    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Reset";
    confirmButton.style.cssText =
      "padding:8px 16px;border:none;border-radius:6px;background:#dc2626;color:white;font-size:14px;font-weight:400;cursor:pointer;transition:all 0.2s;";
    confirmButton.addEventListener("mouseenter", () => {
      confirmButton.style.backgroundColor = "#b91c1c";
    });
    confirmButton.addEventListener("mouseleave", () => {
      confirmButton.style.backgroundColor = "#dc2626";
    });
    confirmButton.addEventListener("click", () => {
      if (designer.current) {
        const blankTemplate = getBlankTemplate();
        designer.current.updateTemplate(blankTemplate);

        // Explicitly save the blank template to backend since auto-save is disabled
        if (currentTemplateId.current) {
          const cleanedTemplate = removeTitleFromTemplate(blankTemplate);
          updateLayout.mutate({
            templateId: currentTemplateId.current,
            pdfmeLayout: cleanedTemplate,
          });
        }

        toast.info("Template reset");
      }
      document.body.removeChild(overlay);
    });

    // Close on overlay click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    // Assemble modal
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(confirmButton);
    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(buttonsContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  };

  /**
   * Resets the template to a blank template.
   */
  const onResetTemplate = () => {
    showResetConfirmation();
  };

  useEffect(() => {
    if (designerRef.current && templateData && !isLoadingTemplate) {
      const typeChanged = previousType.current !== type;
      previousType.current = type;

      // Only build designer if it's not initialized OR if we switched to a different template OR type changed
      if (
        !designer.current ||
        currentTemplateId.current !== templateData.id ||
        typeChanged
      ) {
        if (designer.current && typeChanged) {
          designer.current.destroy();
        }
        buildDesigner();
      }
    }
    // NOTE: We do NOT want to destroy the designer just because templateData updated (e.g. from background refetch)
    // Cleanup only happens when component unmounts or we actually switch templates
  }, [buildDesigner, templateData, isLoadingTemplate, type]);

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      designer.current?.destroy();
    };
  }, []);

  // Add modal functionality to description fields
  useEffect(() => {
    const setupDescriptionModals = () => {
      // Find all description input fields by looking for inputs near "Description" labels
      const observer = new MutationObserver(() => {
        const labels = Array.from(
          document.querySelectorAll(
            'label, .ant-form-item-label label, [class*="label"]'
          )
        );
        labels.forEach((label) => {
          if (label.textContent?.includes("Description")) {
            // Find the input/textarea field associated with this label
            let input: HTMLInputElement | HTMLTextAreaElement | null = null;

            // Try different ways to find the input or textarea
            const parent =
              label.parentElement?.parentElement || label.parentElement;
            if (parent) {
              input = parent.querySelector('input[type="text"], textarea') as
                | HTMLInputElement
                | HTMLTextAreaElement;
            }

            // Also try finding by form item structure
            if (!input) {
              const formItem = label.closest(
                '[class*="form-item"], [class*="FormItem"]'
              );
              if (formItem) {
                input = formItem.querySelector(
                  'input[type="text"], textarea'
                ) as HTMLInputElement | HTMLTextAreaElement;
              }
            }

            if (input && !input.dataset.modalEnabled) {
              input.dataset.modalEnabled = "true";
              // Make it readOnly and clickable to open modal
              if (input.tagName === "INPUT") {
                (input as HTMLInputElement).readOnly = true;
              } else {
                (input as HTMLTextAreaElement).readOnly = true;
              }
              input.style.cursor = "pointer";
              input.style.backgroundColor = "#f9fafb";

              input.addEventListener("click", () => {
                const currentValue = input.value || "";

                // Create modal
                const overlay = document.createElement("div");
                overlay.style.cssText =
                  "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;";

                const modal = document.createElement("div");
                modal.style.cssText =
                  "background:white;border-radius:8px;padding:24px;width:600px;max-width:90vw;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);";

                const title = document.createElement("h3");
                title.textContent = "Edit Description";
                title.style.cssText =
                  "margin:0 0 16px 0;font-size:18px;font-weight:600;";

                const textarea = document.createElement("textarea");
                textarea.value = currentValue;
                textarea.rows = 10;
                textarea.style.cssText =
                  "width:100%;padding:12px;border:1px solid #d1d5db;border-radius:4px;font-size:14px;font-family:inherit;resize:vertical;min-height:200px;";

                const buttonContainer = document.createElement("div");
                buttonContainer.style.cssText =
                  "display:flex;gap:8px;justify-content:flex-end;margin-top:16px;";

                const cancelBtn = document.createElement("button");
                cancelBtn.textContent = "Cancel";
                cancelBtn.className =
                  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-all h-8 px-3 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

                const saveBtn = document.createElement("button");
                saveBtn.textContent = "Save";
                saveBtn.className =
                  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-all h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

                const closeModal = () => {
                  if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                  }
                };

                cancelBtn.addEventListener("click", closeModal);
                saveBtn.addEventListener("click", () => {
                  const newValue = textarea.value.trim();
                  const oldValue = input.value || "";

                  // Close modal first
                  closeModal();

                  if (!designer.current) {
                    return;
                  }

                  // Find schema name from the form panel before we do anything that might close it
                  let schemaName = "";
                  const formPanel = input.closest(
                    '[class*="panel"], [class*="form"], [class*="prop"]'
                  );
                  if (formPanel) {
                    const nameInputs =
                      formPanel.querySelectorAll('input[type="text"]');
                    nameInputs.forEach((nameInput: Element) => {
                      const label = nameInput
                        .closest('[class*="form-item"]')
                        ?.querySelector("label");
                      if (label && label.textContent?.includes("Name")) {
                        schemaName =
                          (nameInput as HTMLInputElement).value || "";
                      }
                    });
                  }

                  // Use native setter to ensure React/AntD detects the change
                  const nativeSetter = (
                    el: HTMLInputElement | HTMLTextAreaElement,
                    value: string
                  ) => {
                    const prototype =
                      el instanceof HTMLTextAreaElement
                        ? HTMLTextAreaElement.prototype
                        : HTMLInputElement.prototype;
                    const descriptor = Object.getOwnPropertyDescriptor(
                      prototype,
                      "value"
                    );
                    if (descriptor && descriptor.set) {
                      descriptor.set.call(el, value);
                    } else {
                      el.value = value;
                    }
                    // Trigger events
                    el.dispatchEvent(new Event("input", { bubbles: true }));
                    el.dispatchEvent(new Event("change", { bubbles: true }));
                  };

                  // Update input field value
                  const wasReadOnly = input.readOnly;
                  input.readOnly = false;
                  nativeSetter(input, newValue);

                  // Store old value for later matching
                  input.setAttribute("data-old-value", oldValue);

                  // Restore readOnly after a short delay
                  setTimeout(() => {
                    if (wasReadOnly) {
                      input.readOnly = true;
                    }
                  }, 50);

                  // Helper to re-open the panel if it closes
                  const reOpenPanel = (name: string) => {
                    if (!name) return;
                    // Wait for PDFME to potentially re-render the sidebar
                    setTimeout(() => {
                      // Check if panel is already open (Edit Field view)
                      const hasEditFieldTitle = Array.from(
                        document.querySelectorAll("h3, div")
                      ).some((el) => el.textContent?.includes("Edit Field"));
                      if (!hasEditFieldTitle) {
                        // Try to find the field in the list and click it
                        const fieldItems = Array.from(
                          document.querySelectorAll(
                            '[class*="field-item"], [class*="FieldItem"], [class*="list-item"]'
                          )
                        );
                        const target = fieldItems.find((item) =>
                          item.textContent?.includes(name)
                        );
                        if (target) {
                          (target as HTMLElement).click();
                          logger.log(`Re-opened panel for field: ${name}`);
                        }
                      }
                    }, 300);
                  };

                  // DON'T call updateTemplate immediately - it closes the panel
                  // Instead, let PDFME's form system handle the save via onSaveTemplate callback
                  setTimeout(() => {
                    if (designer.current) {
                      // Check if the form field was updated by PDFME
                      const currentTemplate = designer.current.getTemplate();

                      // Check if description was saved by PDFME's form system
                      let descriptionSaved = false;
                      if (
                        currentTemplate.schemas &&
                        Array.isArray(currentTemplate.schemas)
                      ) {
                        currentTemplate.schemas.forEach((schemaArray) => {
                          if (Array.isArray(schemaArray)) {
                            schemaArray.forEach((schema: unknown) => {
                              if (schema && typeof schema === "object") {
                                const schemaObj = schema as Record<
                                  string,
                                  unknown
                                >;
                                const matchesByName =
                                  schemaName && schemaObj.name === schemaName;
                                const schemaDesc = String(
                                  schemaObj.description || ""
                                );
                                if (matchesByName && schemaDesc === newValue) {
                                  descriptionSaved = true;
                                }
                              }
                            });
                          }
                        });
                      }

                      // Only update template manually as a last resort
                      if (!descriptionSaved) {
                        logger.log(
                          "PDFME did not save description automatically, updating manually..."
                        );
                        const templateToUpdate = cloneDeep(currentTemplate);
                        if (
                          templateToUpdate.schemas &&
                          Array.isArray(templateToUpdate.schemas)
                        ) {
                          let changed = false;
                          templateToUpdate.schemas.forEach((schemaArray) => {
                            if (Array.isArray(schemaArray)) {
                              schemaArray.forEach((schema: unknown) => {
                                if (schema && typeof schema === "object") {
                                  const schemaObj = schema as Record<
                                    string,
                                    unknown
                                  >;
                                  const matchesByName =
                                    schemaName && schemaObj.name === schemaName;
                                  if (matchesByName) {
                                    schemaObj.description = newValue;
                                    changed = true;
                                  }
                                }
                              });
                            }
                          });

                          if (changed) {
                            designer.current.updateTemplate(templateToUpdate);
                            // If we manually update template, PDFME will likely close the panel, so re-open it
                            reOpenPanel(schemaName);
                          }
                        }
                      } else {
                        // Even if saved automatically, PDFME sometimes blurs/resets focus,
                        // so let's verify if we need to re-click the field to be safe
                        reOpenPanel(schemaName);
                      }
                    }
                  }, 500);
                });

                overlay.addEventListener("click", (e) => {
                  if (e.target === overlay) closeModal();
                });

                buttonContainer.appendChild(cancelBtn);
                buttonContainer.appendChild(saveBtn);
                modal.appendChild(title);
                modal.appendChild(textarea);
                modal.appendChild(buttonContainer);
                overlay.appendChild(modal);
                document.body.appendChild(overlay);

                setTimeout(() => textarea.focus(), 100);
              });
            }
          }
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

      return () => observer.disconnect();
    };

    const cleanup = setupDescriptionModals();
    return cleanup;
  }, []);

  /**
   * Opens a searchable popup modal to select a field from a list.
   * Used for MLS, BBA, and Purchase Contract mappings.
   */
  const openFieldPickerPopup = useCallback(
    (
      title: string,
      fields: string[],
      currentValue: string,
      onSelect: (value: string) => void,
      onClear: () => void
    ) => {
      const overlay = document.createElement("div");
      overlay.setAttribute("data-mapping-popup", "true");
      overlay.style.cssText =
        "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:10000;";

      const modal = document.createElement("div");
      modal.style.cssText =
        "background:white;border-radius:12px;padding:24px;width:500px;max-width:90vw;max-height:70vh;display:flex;flex-direction:column;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);";

      const header = document.createElement("div");
      header.style.cssText =
        "display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;";

      const titleEl = document.createElement("h3");
      titleEl.textContent = title;
      titleEl.style.cssText =
        "margin:0;font-size:18px;font-weight:600;color:#111;";

      const countEl = document.createElement("span");
      countEl.textContent = `${fields.length} fields`;
      countEl.style.cssText =
        "font-size:12px;color:#888;font-weight:400;margin-left:8px;";

      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "&times;";
      closeBtn.style.cssText =
        "background:none;border:none;font-size:24px;cursor:pointer;color:#666;padding:0;line-height:1;";

      const titleWrapper = document.createElement("div");
      titleWrapper.style.cssText = "display:flex;align-items:baseline;";
      titleWrapper.appendChild(titleEl);
      titleWrapper.appendChild(countEl);
      header.appendChild(titleWrapper);
      header.appendChild(closeBtn);

      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.placeholder = "Search fields...";
      searchInput.value = "";
      searchInput.style.cssText =
        "width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;margin-bottom:12px;outline:none;";
      searchInput.addEventListener(
        "focus",
        () => (searchInput.style.borderColor = "#25c2a0")
      );
      searchInput.addEventListener(
        "blur",
        () => (searchInput.style.borderColor = "#ddd")
      );

      const listContainer = document.createElement("div");
      listContainer.style.cssText =
        "flex:1;overflow-y:auto;border:1px solid #eee;border-radius:8px;min-height:200px;max-height:300px;";

      const renderList = (filter: string) => {
        const filtered = filter
          ? fields.filter((f) => f.toLowerCase().includes(filter.toLowerCase()))
          : fields;

        if (fields.length === 0) {
          listContainer.innerHTML =
            '<div style="padding:40px 20px;text-align:center;color:#999;">No fields to map from in this template</div>';
          return;
        }

        listContainer.innerHTML =
          filtered.length === 0
            ? '<div style="padding:20px;text-align:center;color:#999;">No matching fields</div>'
            : filtered
                .map(
                  (field) => `
                    <div class="field-item" data-field="${field}" style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:14px;${field === currentValue ? "background:#e8faf5;color:#25c2a0;font-weight:500;" : ""}">
                        ${field}
                    </div>
                `
                )
                .join("");

        listContainer.querySelectorAll(".field-item").forEach((item) => {
          item.addEventListener("mouseenter", () => {
            (item as HTMLElement).style.background = "#f5f5f5";
          });
          item.addEventListener("mouseleave", () => {
            const isSelected = item.getAttribute("data-field") === currentValue;
            (item as HTMLElement).style.background = isSelected
              ? "#e8faf5"
              : "";
          });
          item.addEventListener("click", () => {
            const value = item.getAttribute("data-field") || "";
            onSelect(value);
            closeModal();
          });
        });
      };

      searchInput.addEventListener("input", () =>
        renderList(searchInput.value)
      );
      renderList("");

      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText =
        "display:flex;gap:8px;justify-content:flex-end;margin-top:16px;";

      const clearBtn = document.createElement("button");
      clearBtn.textContent = "Clear";
      clearBtn.style.cssText =
        "padding:8px 16px;border:1px solid #ddd;border-radius:6px;background:white;color:#666;font-size:14px;cursor:pointer;";
      clearBtn.addEventListener("click", () => {
        onClear();
        closeModal();
      });

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.style.cssText =
        "padding:8px 16px;border:1px solid #ddd;border-radius:6px;background:white;color:#333;font-size:14px;cursor:pointer;";

      buttonContainer.appendChild(clearBtn);
      buttonContainer.appendChild(cancelBtn);

      const closeModal = () => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      };

      // ESC key to close
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeModal();
          document.removeEventListener("keydown", handleKeyDown);
        }
      };
      document.addEventListener("keydown", handleKeyDown);

      closeBtn.addEventListener("click", closeModal);
      cancelBtn.addEventListener("click", closeModal);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
      });

      modal.appendChild(header);
      modal.appendChild(searchInput);
      modal.appendChild(listContainer);
      modal.appendChild(buttonContainer);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      setTimeout(() => searchInput.focus(), 100);
    },
    []
  );

  /**
   * Gets the currently selected schema ID from the PDFME designer.
   */
  const getActiveSchemaId = useCallback((): string | null => {
    if (!designer.current) return null;

    const d = designer.current as any;
    let selection = d.getSelection?.() || d.getSelectedSchema?.();
    let activeId = Array.isArray(selection) ? selection[0] : selection;

    if (!activeId) {
      const labels = Array.from(document.querySelectorAll("label"));
      const nameLabel = labels.find((l) => l.textContent?.trim() === "Name");
      const input = nameLabel?.parentElement?.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      if (input && designer.current) {
        const name = input.value;
        const t = designer.current.getTemplate();
        for (const page of t.schemas) {
          for (const [id, s] of Object.entries(page)) {
            if ((s as any).name === name) {
              activeId = id;
              break;
            }
          }
          if (activeId) break;
        }
      }
    }
    return activeId || null;
  }, []);

  /**
   * Updates a schema property for the currently selected field.
   * Enforces mutual exclusivity for mapper fields: only one mapper can be selected at a time.
   */
  const updateSchemaProperty = useCallback(
    (propertyName: string, value: string | null) => {
      if (!designer.current) return;

      const activeId = getActiveSchemaId();
      if (!activeId) return;

      const template = designer.current.getTemplate();
      let pageIndex = -1;
      for (let i = 0; i < template.schemas.length; i++) {
        if (
          (template.schemas[i] as unknown as Record<string, unknown>)[activeId]
        ) {
          pageIndex = i;
          break;
        }
      }
      if (pageIndex === -1) return;

      const newTemplate = cloneDeep(template);
      const pageSchema = newTemplate.schemas[pageIndex] as unknown as Record<
        string,
        unknown
      >;
      const schema = pageSchema[activeId] as Record<string, unknown>;

      // Define all mapper properties that are mutually exclusive
      const mapperProperties = [
        "agent_mapping",
        "mls_alternative",
        "bba_mapping",
        "purchase_contract_mapping",
      ];

      // If setting a mapper property to a non-null value, clear all other mappers
      if (
        mapperProperties.includes(propertyName) &&
        value !== null &&
        value !== ""
      ) {
        mapperProperties.forEach((mapperProp) => {
          if (mapperProp !== propertyName) {
            delete schema[mapperProp];
          }
        });
        // Set the selected mapper
        schema[propertyName] = value;
      } else if (value === null) {
        // Clearing a mapper - just delete it
        delete schema[propertyName];
      } else {
        // Setting a non-mapper property - update normally
        schema[propertyName] = value;
      }

      designer.current.updateTemplate(newTemplate);
    },
    [getActiveSchemaId]
  );

  // Effect to attach popups to MLS/BBA/Purchase input fields
  useEffect(() => {
    if (!jurisdictionCode) return;

    // Debounced re-injection to avoid rapid-fire updates
    let debounceTimer: NodeJS.Timeout | null = null;

    const attachToInputs = () => {
      // Find all relevant input fields
      const allElements = Array.from(
        document.querySelectorAll("span, label, div, p")
      );

      // Define mapper properties that are mutually exclusive
      const mapperProperties = [
        "agent_mapping",
        "mls_alternative",
        "bba_mapping",
        "purchase_contract_mapping",
      ];

      // Helper to attach popup to an input
      const attachPopup = (
        fieldName: string,
        fields: string[],
        onSelect: (val: string) => void
      ) => {
        allElements.forEach((el) => {
          // Must be an exact match AND the element should only contain this text (not a parent with multiple labels)
          if (
            el.textContent?.trim() === fieldName &&
            el.childElementCount === 0
          ) {
            // Find the input field associated with this label - look for sibling or nearby input
            let input: HTMLInputElement | null = null;

            // First try: look in the same form-item row (immediate parent or grandparent)
            const parent = el.parentElement;
            if (parent) {
              // Look for input in the same row/container as the label
              input = parent.querySelector(
                'input[type="text"]'
              ) as HTMLInputElement;

              // If not found, try grandparent (for nested label structures)
              if (!input && parent.parentElement) {
                input = parent.parentElement.querySelector(
                  'input[type="text"]'
                ) as HTMLInputElement;
              }
            }

            // Fallback: use form-item but verify it's the right one
            if (!input) {
              const formItem = el.closest(
                '[class*="form-item"], [class*="FormItem"], .ant-form-item'
              );
              if (formItem) {
                // Only use if this form item contains just this one label
                const labels = formItem.querySelectorAll("label, span");
                const matchingLabels = Array.from(labels).filter(
                  (l) => l.textContent?.trim() === fieldName
                );
                if (matchingLabels.length === 1) {
                  input = formItem.querySelector(
                    'input[type="text"]'
                  ) as HTMLInputElement;
                }
              }
            }

            if (input && !input.dataset.popupAttached) {
              // Skip if this is the "Name" input field - check by looking for nearby "Name" label
              const inputContainer =
                input.closest(
                  '[class*="form-item"], [class*="FormItem"], .ant-form-item'
                ) || input.parentElement?.parentElement;
              if (inputContainer) {
                const nearbyLabels =
                  inputContainer.querySelectorAll("label, span");
                const isNameField = Array.from(nearbyLabels).some(
                  (l) => l.textContent?.trim() === "Name"
                );
                if (isNameField && fieldName !== "Name") {
                  return; // Skip - don't attach popup to Name field
                }
              }

              // Make it look like the description field
              input.dataset.popupAttached = "true";
              input.readOnly = true;
              input.style.cursor = "pointer";
              input.style.backgroundColor = "#f9fafb";

              // Add click handler
              input.addEventListener("click", (e) => {
                e.stopPropagation();
                e.preventDefault();

                const currentValue = input!.value || "";
                openFieldPickerPopup(
                  `Select ${fieldName}`,
                  fields,
                  currentValue,
                  (newValue) => {
                    // Determine which mapper property is being set
                    let propName = "";
                    if (
                      fieldName === "MLS Property" ||
                      fieldName === "MLS Alternative (Internal)"
                    )
                      propName = "mls_alternative";
                    else if (fieldName === "BBA Map") propName = "bba_mapping";
                    else if (fieldName === "Purchase Contract Map")
                      propName = "purchase_contract_mapping";
                    else if (fieldName === "Agent Map")
                      propName = "agent_mapping";

                    // If this is a mapper field, clear other mapper inputs visually
                    if (propName && mapperProperties.includes(propName)) {
                      const otherMapperLabels = [
                        "Agent Map",
                        "MLS Property",
                        "MLS Alternative (Internal)",
                        "BBA Map",
                        "Purchase Contract Map",
                      ].filter((label) => label !== fieldName);

                      otherMapperLabels.forEach((otherLabel) => {
                        const otherElements = Array.from(
                          document.querySelectorAll("span, label, div, p")
                        );
                        otherElements.forEach((el) => {
                          if (
                            el.textContent?.trim() === otherLabel &&
                            el.childElementCount === 0
                          ) {
                            const parent =
                              el.parentElement?.parentElement ||
                              el.parentElement;
                            if (parent) {
                              const otherInput = parent.querySelector(
                                'input[type="text"]'
                              ) as HTMLInputElement;
                              if (otherInput && otherInput !== input) {
                                const clearSetter =
                                  Object.getOwnPropertyDescriptor(
                                    window.HTMLInputElement.prototype,
                                    "value"
                                  )?.set;
                                if (clearSetter) {
                                  clearSetter.call(otherInput, "");
                                } else {
                                  otherInput.value = "";
                                }
                                otherInput.dispatchEvent(
                                  new Event("input", { bubbles: true })
                                );
                                otherInput.dispatchEvent(
                                  new Event("change", { bubbles: true })
                                );
                              }
                            }
                          }
                        });
                      });
                    }

                    // Update input value directly
                    const nativeSetter = Object.getOwnPropertyDescriptor(
                      window.HTMLInputElement.prototype,
                      "value"
                    )?.set;
                    if (nativeSetter) {
                      nativeSetter.call(input, newValue);
                    } else {
                      input!.value = newValue;
                    }
                    input!.dispatchEvent(new Event("input", { bubbles: true }));
                    input!.dispatchEvent(
                      new Event("change", { bubbles: true })
                    );

                    // Update schema - this will also clear other mappers
                    if (propName) {
                      updateSchemaProperty(propName, newValue);
                    }
                  },
                  () => {
                    // Clear value
                    const nativeSetter = Object.getOwnPropertyDescriptor(
                      window.HTMLInputElement.prototype,
                      "value"
                    )?.set;
                    if (nativeSetter) {
                      nativeSetter.call(input, "");
                    } else {
                      input!.value = "";
                    }
                    input!.dispatchEvent(new Event("input", { bubbles: true }));
                    input!.dispatchEvent(
                      new Event("change", { bubbles: true })
                    );

                    let propName = "";
                    if (
                      fieldName === "MLS Property" ||
                      fieldName === "MLS Alternative (Internal)"
                    )
                      propName = "mls_alternative";
                    else if (fieldName === "BBA Map") propName = "bba_mapping";
                    else if (fieldName === "Purchase Contract Map")
                      propName = "purchase_contract_mapping";
                    else if (fieldName === "Agent Map")
                      propName = "agent_mapping";

                    if (propName) {
                      updateSchemaProperty(propName, null);
                    }
                  }
                );
              });
            }
          }
        });
      };

      // Attach to each field type based on template type
      if (type !== "BBA") {
        attachPopup("MLS Property", mlsFieldsRef.current || [], (v) =>
          updateSchemaProperty("mls_alternative", v)
        );
        attachPopup(
          "MLS Alternative (Internal)",
          mlsFieldsRef.current || [],
          (v) => updateSchemaProperty("mls_alternative", v)
        );
        attachPopup(
          "Purchase Contract Map",
          purchaseFieldsRef.current || [],
          (v) => updateSchemaProperty("purchase_contract_mapping", v)
        );
      }
      attachPopup("BBA Map", bbaFieldsRef.current || [], (v) =>
        updateSchemaProperty("bba_mapping", v)
      );
      attachPopup("Agent Map", agentFieldsRef.current || [], (v) =>
        updateSchemaProperty("agent_mapping", v)
      );
    };

    const debouncedAttach = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(attachToInputs, 500);
    };

    const observer = new MutationObserver(debouncedAttach);
    observer.observe(document.body, { childList: true, subtree: true });

    const handleSelection = () => {
      setTimeout(attachToInputs, 200);
    };
    window.addEventListener("pdfme-selection-change", handleSelection);

    // Initial attach
    setTimeout(attachToInputs, 1000);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
      window.removeEventListener("pdfme-selection-change", handleSelection);
    };
  }, [
    jurisdictionCode,
    openFieldPickerPopup,
    updateSchemaProperty,
    mlsFields,
    bbaFields,
    purchaseFields,
    agentFields,
    type,
  ]);

  const navItems: NavItem[] = [
    {
      label: "Change BasePDF",
      content: (
        <input
          type="file"
          accept="application/pdf"
          className="w-full text-sm border rounded"
          onChange={onChangeBasePDF}
        />
      ),
    },
    {
      label: "",
      content: (
        <div className="flex gap-2">
          <Button
            id="reset-template"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onResetTemplate}
          >
            Reset
          </Button>
        </div>
      ),
    },
    {
      label: "",
      content: (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onSaveRemote}
          >
            Save
          </Button>
          <Button
            id="generate-pdf"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={async () => {
              const startTimer = performance.now();
              await generatePDF(designer.current);
              const endTimer = performance.now();
              toast.info(
                `Generated PDF in ${Math.round(endTimer - startTimer)}ms ⚡️`
              );
            }}
          >
            Generate PDF
          </Button>
        </div>
      ),
    },
  ];

  if (isLoadingTemplate) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-black">
        <DesignerHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading template...</div>
        </div>
      </div>
    );
  }

  if (!jurisdictionCode || !type) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-black">
        <DesignerHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">
            Missing required parameters: jurisdictionCode and type
          </div>
        </div>
      </div>
    );
  }

  if (templateError) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-black">
        <DesignerHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">
            Error loading template:
            {templateError instanceof Error
              ? templateError.message
              : "Unknown error"}
          </div>
        </div>
      </div>
    );
  }

  if (!templateData && !isLoadingTemplate) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-black">
        <DesignerHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Template not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <DesignerHeader />
      <DesignerNavBar items={navItems} />
      <div ref={designerRef} className="flex-1 w-full" />
    </div>
  );
}

function DesignerAppWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Loading designer...</div>
        </div>
      }
    >
      <DesignerApp />
    </Suspense>
  );
}

export default DesignerAppWrapper;
