import { Plugin, Schema } from "@pdfme/common";
import { image as baseImage } from "@pdfme/schemas";

interface CustomSignature extends Schema {
  type: "signature";
}

export const customSignature: Plugin<CustomSignature> = {
  ...baseImage,

  ui: async (arg) => {
    const { schema, value, onChange, rootElement, mode } = arg;

    if (!rootElement) return;

    // Clear root element
    rootElement.innerHTML = "";
    rootElement.style.width = "100%";
    rootElement.style.height = "100%";
    rootElement.style.position = "relative";
    rootElement.style.display = "flex";
    rootElement.style.flexDirection = "column";
    rootElement.style.boxSizing = "border-box";

    // Create container - invisible when positioning, just shows border outline
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.border = "1px dashed #d1d5db";
    container.style.borderRadius = "4px";
    container.style.backgroundColor = "transparent";
    container.style.opacity = "0.3";
    container.style.pointerEvents = "none";

    rootElement.appendChild(container);

    // Initialize with empty value (no photo, just text placeholder)
    if (onChange && (!value || value === "")) {
      onChange({ key: "content", value: "" });
    }
  },

  propPanel: {
    schema: {
      type: {
        title: "Type",
        type: "string",
        default: "signature",
        readOnly: true,
      },
      name: {
        title: "Name",
        type: "string",
        required: true,
      },
      position: {
        title: "Position",
        type: "object",
        properties: {
          x: { type: "number", title: "X" },
          y: { type: "number", title: "Y" },
        },
        required: true,
      },
      width: {
        title: "Width",
        type: "number",
        default: 200,
      },
      height: {
        title: "Height",
        type: "number",
        default: 100,
      },
      required: {
        title: "Required",
        type: "boolean",
        default: false,
      },
      readOnly: {
        title: "Read Only",
        type: "boolean",
        default: false,
      },
    },
    defaultSchema: {
      type: "signature",
      name: "signature",
      position: { x: 0, y: 0 },
      width: 200,
      height: 100,
      required: false,
      readOnly: false,
    },
  },
};
