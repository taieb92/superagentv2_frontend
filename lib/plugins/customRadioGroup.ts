import { Plugin, Schema } from "@pdfme/common";
import { radioGroup as baseRadioGroup } from "@pdfme/schemas";

/**
 * Custom Radio Group Plugin for PDFMe
 *
 * Designed for grouped single-option radio fields where each field represents
 * one option in a mutually exclusive group. All fields in the same group share
 * a `group` property.
 *
 * Example template structure:
 * - Field: payment.cash      | type: radioGroup | group: payment_group
 * - Field: payment.check     | type: radioGroup | group: payment_group
 * - Field: payment.wire      | type: radioGroup | group: payment_group
 *
 * When one is selected, others in the group are automatically cleared.
 */

interface CustomRadioGroup extends Schema {
  group?: string;
  color?: string;
}

// Create checkmark SVG string
const createCheckmarkSVG = (color: string = "#000000") => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
};

// Create empty box SVG string
const createEmptyBoxSVG = (color: string = "#000000") => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>`;
};

export const customRadioGroup: Plugin<CustomRadioGroup> = {
  ...baseRadioGroup,

  ui: async (arg) => {
    const { schema, value, onChange, rootElement, mode } = arg;

    if (!rootElement) return;

    // Cleanup previous listeners
    if ((rootElement as any).__cleanupRadioGroup) {
      (rootElement as any).__cleanupRadioGroup();
      delete (rootElement as any).__cleanupRadioGroup;
    }

    // Setup root element
    rootElement.innerHTML = "";
    rootElement.style.width = "100%";
    rootElement.style.height = "100%";
    rootElement.style.position = "relative";
    rootElement.style.display = "flex";
    rootElement.style.alignItems = "center";
    rootElement.style.justifyContent = "center";
    rootElement.style.boxSizing = "border-box";

    const color = (schema as any).color || "#000000";
    const group = (schema as any).group;
    const currentValue = value || "";

    // Determine if selected: any truthy non-empty value means "selected"
    const isSelected = Boolean(
      currentValue &&
      currentValue !== "" &&
      currentValue !== "false" &&
      currentValue !== "0"
    );

    // Use a stable ID for this element instance (for group coordination)
    let instanceId = (rootElement as any).__pdfme_instance_id;
    if (!instanceId) {
      instanceId = Math.random().toString(36).substring(7);
      (rootElement as any).__pdfme_instance_id = instanceId;
    }

    // Group change listener - clears this field when another in the group is selected
    if (group && mode !== "viewer" && !schema.readOnly && onChange) {
      const handleGroupChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (
          customEvent.detail.group === group &&
          customEvent.detail.sourceId !== instanceId
        ) {
          // Clear this field and update visual
          onChange({ key: "content", value: "" });
          const iconDiv = rootElement.querySelector("div > div");
          if (iconDiv) {
            iconDiv.innerHTML = createEmptyBoxSVG(color);
          }
        }
      };

      globalThis.addEventListener(
        "pdfme-radio-group-change",
        handleGroupChange
      );

      const observer = new MutationObserver(() => {
        if (!document.body.contains(rootElement)) {
          globalThis.removeEventListener(
            "pdfme-radio-group-change",
            handleGroupChange
          );
          observer.disconnect();
          delete (rootElement as any).__cleanupRadioGroup;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      (rootElement as any).__cleanupRadioGroup = () => {
        globalThis.removeEventListener(
          "pdfme-radio-group-change",
          handleGroupChange
        );
        observer.disconnect();
      };
    }

    // Create container
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.cursor =
      mode === "viewer" || schema.readOnly ? "default" : "pointer";
    container.style.userSelect = "none";

    // Create icon
    const iconContainer = document.createElement("div");
    iconContainer.style.width = "20px";
    iconContainer.style.height = "20px";
    iconContainer.style.display = "flex";
    iconContainer.style.alignItems = "center";
    iconContainer.style.justifyContent = "center";
    iconContainer.innerHTML = isSelected
      ? createCheckmarkSVG(color)
      : createEmptyBoxSVG(color);

    container.appendChild(iconContainer);

    // Click handler
    if (mode !== "viewer" && !schema.readOnly && onChange) {
      container.addEventListener("click", () => {
        const newValue = isSelected ? "" : "true";
        onChange({ key: "content", value: newValue });

        // Notify other fields in the group to clear
        if (group && newValue) {
          setTimeout(() => {
            globalThis.dispatchEvent(
              new CustomEvent("pdfme-radio-group-change", {
                detail: { group, sourceId: instanceId },
              })
            );
          }, 0);
        }
      });
    }

    rootElement.appendChild(container);
  },

  pdf: baseRadioGroup.pdf as any,

  propPanel: {
    ...baseRadioGroup.propPanel,
    schema: {
      group: {
        title: "Group Name",
        type: "string",
      },
      color: {
        title: "Color",
        type: "string",
        widget: "color",
      },
    },
    defaultSchema: {
      ...baseRadioGroup.propPanel.defaultSchema,
      group: "",
      color: "#000000",
    },
  },
};
