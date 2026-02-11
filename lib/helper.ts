"use client";

import {
  checkTemplate,
  Font,
  getDefaultFont,
  getInputFromTemplate,
  Template,
} from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { PDFDocument } from "@pdfme/pdf-lib";
import { Designer, Form, Viewer } from "@pdfme/ui";
import { getPlugins } from "./plugins";
import { logger } from "./utils/logger";

/**
 * Validates that all schemas have both `name` and `description` fields filled.
 *
 * @param template - The PDF template to validate
 * @returns Object with `isValid` boolean and `errors` array of missing field messages
 *
 * @example
 * ```ts
 * const validation = validateTemplateFields(template);
 * if (!validation.isValid) {
 *   console.error(validation.errors);
 * }
 * ```
 */
export const validateTemplateFields = (
  template: Template
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!template.schemas || !Array.isArray(template.schemas)) {
    return { isValid: false, errors: ["Template has no schemas"] };
  }

  template.schemas.forEach((schemaArray, pageIndex) => {
    if (!Array.isArray(schemaArray)) return;

    schemaArray.forEach((schema: unknown, schemaIndex) => {
      if (!schema || typeof schema !== "object") return;

      const schemaObj = schema as Record<string, unknown>;
      const schemaName = schemaObj.name;
      const schemaDescription = schemaObj.description;

      // Check name field
      if (
        !schemaName ||
        (typeof schemaName === "string" && schemaName.trim() === "")
      ) {
        errors.push(
          `Page ${pageIndex + 1}, Schema ${schemaIndex + 1}: "name" field is required`
        );
      }

      // Check description field
      if (
        !schemaDescription ||
        (typeof schemaDescription === "string" &&
          schemaDescription.trim() === "")
      ) {
        errors.push(
          `Page ${pageIndex + 1}, Schema ${schemaIndex + 1}: "description" field is required`
        );
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Removes the `title` field from all schemas in a template.
 * This ensures that title fields are not included in saved templates or JSON output.
 *
 * @param template - The PDF template to clean
 * @returns A new template object with all `title` fields removed from schemas
 *
 * @example
 * ```ts
 * const cleaned = removeTitleFromTemplate(template);
 * localStorage.setItem('template', JSON.stringify(cleaned));
 * ```
 */
export const removeTitleFromTemplate = (template: Template): Template => {
  const cleanedTemplate = { ...template };
  if (cleanedTemplate.schemas) {
    cleanedTemplate.schemas = cleanedTemplate.schemas.map((schemaArray) => {
      if (Array.isArray(schemaArray)) {
        return schemaArray.map((schema: unknown) => {
          if (schema && typeof schema === "object") {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { title, ...rest } = schema as Record<string, unknown>;
            return rest as typeof schema;
          }
          return schema;
        }) as typeof schemaArray;
      }
      return schemaArray;
    }) as typeof cleanedTemplate.schemas;
  }
  return cleanedTemplate;
};

/**
 * Returns the font configuration for PDF generation.
 * Includes default fonts plus custom fonts (PinyonScript, NotoSerifJP, NotoSansJP).
 *
 * @returns Font configuration object with all available fonts
 */
export const getFontsData = (): Font => ({
  ...getDefaultFont(),
  "PinyonScript-Regular": {
    fallback: false,
    data: "https://fonts.gstatic.com/s/pinyonscript/v22/6xKpdSJbL9-e9LuoeQiDRQR8aOLQO4bhiDY.ttf",
  },
  NotoSerifJP: {
    fallback: false,
    data: "https://fonts.gstatic.com/s/notoserifjp/v30/xn71YHs72GKoTvER4Gn3b5eMRtWGkp6o7MjQ2bwxOubAILO5wBCU.ttf",
  },
  NotoSansJP: {
    fallback: false,
    data: "https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75vY0rw-oME.ttf",
  },
});

/**
 * Reads a file and returns its contents as a Promise.
 *
 * @param file - The file to read, or null
 * @param type - The format to read the file as: 'text', 'dataURL', or 'arrayBuffer'
 * @returns Promise that resolves to the file contents as string (text/dataURL) or ArrayBuffer
 * @throws Error if file reading fails
 *
 * @example
 * ```ts
 * const pdfData = await readFile(file, 'dataURL');
 * template.basePdf = pdfData;
 * ```
 */
export const readFile = (
  file: File | null,
  type: "text" | "dataURL" | "arrayBuffer"
) => {
  return new Promise<string | ArrayBuffer>((r) => {
    const fileReader = new FileReader();
    fileReader.addEventListener("load", (e) => {
      if (e && e.target && e.target.result && file !== null) {
        r(e.target.result);
      }
    });
    if (file !== null) {
      if (type === "text") {
        fileReader.readAsText(file);
      } else if (type === "dataURL") {
        fileReader.readAsDataURL(file);
      } else if (type === "arrayBuffer") {
        fileReader.readAsArrayBuffer(file);
      }
    }
  });
};

const getTemplateFromJsonFile = (file: File) => {
  return readFile(file, "text").then((jsonStr) => {
    const template: Template = JSON.parse(jsonStr as string);
    checkTemplate(template);
    // Remove title fields from loaded template
    return removeTitleFromTemplate(template);
  });
};

/**
 * Handles loading a template from a file input.
 * Validates the template, removes title fields, and updates the designer/viewer/form.
 *
 * @param e - File input change event
 * @param currentRef - Reference to the Designer, Form, or Viewer instance to update
 *
 * @example
 * ```tsx
 * <input
 *   type="file"
 *   accept="application/json"
 *   onChange={(e) => handleLoadTemplate(e, designer.current)}
 * />
 * ```
 */
export const handleLoadTemplate = (
  e: React.ChangeEvent<HTMLInputElement>,
  currentRef: Designer | Form | Viewer | null
) => {
  if (e.target && e.target.files && e.target.files[0]) {
    getTemplateFromJsonFile(e.target.files[0])
      .then((t) => {
        if (!currentRef) return;
        currentRef.updateTemplate(t);
      })
      .catch((e) => {
        alert(`Invalid template file.
--------------------------
${e}`);
      });
  }
};

/**
 * Type guard to check if basePdf is a PDF file (not a configuration object)
 */
const isPdfFile = (
  basePdf: unknown
): basePdf is string | ArrayBuffer | Uint8Array => {
  if (typeof basePdf === "string") return true;
  if (basePdf instanceof ArrayBuffer) return true;
  if (basePdf instanceof Uint8Array) return true;
  return false;
};

/**
 * Sanitizes a PDF by loading it with ignoreEncryption: true and re-saving it.
 * This fixes issues where the base PDF has permissions encryption (owner password).
 */
const sanitizePdf = async (
  basePdf: string | ArrayBuffer | Uint8Array
): Promise<string> => {
  try {
    const pdfDoc = await PDFDocument.load(basePdf, { ignoreEncryption: true });
    const base64 = await pdfDoc.saveAsBase64();
    return `data:application/pdf;base64,${base64}`;
  } catch (e) {
    console.error("PDF Sanitization failed:", e);
    // Alert the user that this PDF is problematic
    alert(
      'The PDF template is encrypted and cannot be processed automatically.\n\nPlease define a password or unlock the PDF using an external tool (e.g. "Save as PDF" in Chrome or online tools) and re-upload it.'
    );
    // Return original to let generate() try (it will likely fail, but we warned the user)
    if (typeof basePdf === "string") return basePdf;
    throw e;
  }
};

/**
 * Generates a PDF from the current template and opens it in a new window.
 * Automatically extracts inputs from Viewer/Form or generates default inputs from template.
 *
 * @param currentRef - Reference to Designer, Form, or Viewer instance
 * @throws Error if PDF generation fails
 *
 * @example
 * ```ts
 * await generatePDF(designer.current);
 * // Opens PDF in new browser window
 * ```
 */
export const generatePDF = async (
  currentRef: Designer | Form | Viewer | null
) => {
  if (!currentRef) return;
  const template = currentRef.getTemplate();

  // Sanitize basePdf to handle encryption (only if it's a PDF file, not a config object)
  if (template.basePdf && isPdfFile(template.basePdf)) {
    try {
      template.basePdf = await sanitizePdf(template.basePdf);
    } catch (e) {
      console.error("Failed to sanitize PDF:", e);
    }
  }

  const options = currentRef.getOptions();
  const inputs =
    typeof (currentRef as Viewer | Form).getInputs === "function"
      ? (currentRef as Viewer | Form).getInputs()
      : getInputFromTemplate(template);
  const font = getFontsData();

  try {
    const pdf = await generate({
      template,
      inputs,
      options: {
        font,
        lang: options.lang,
        title: "pdfme",
      },
      plugins: getPlugins(),
    });

    const blob = new Blob([pdf.buffer], { type: "application/pdf" });
    window.open(URL.createObjectURL(blob));
  } catch (e) {
    alert(e + "\n\nCheck the console for full stack trace");
    throw e;
  }
};

/**
 * Fetches a template by ID from the API.
 *
 * @param templateId - The ID of the template to fetch
 * @returns Promise that resolves to the template
 * @throws Error if template fetch fails or template is invalid
 *
 * @example
 * ```ts
 * const template = await getTemplateById('template-123');
 * designer.updateTemplate(template);
 * ```
 */
export const getTemplateById = async (
  templateId: string
): Promise<Template> => {
  try {
    const response = await fetch(`/api/templates/${templateId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }
    const template: Template = await response.json();
    checkTemplate(template);
    return template;
  } catch (error) {
    logger.error("Error fetching template:", error);
    throw error;
  }
};

/**
 * Creates a blank PDF template with default A4 dimensions.
 *
 * @returns A new blank template with empty schemas and default basePdf dimensions
 *
 * @example
 * ```ts
 * const blank = getBlankTemplate();
 * designer.updateTemplate(blank);
 * ```
 */
export const getBlankTemplate = () =>
  ({
    schemas: [{}],
    basePdf: {
      width: 210,
      height: 297,
      padding: [20, 10, 20, 10],
    },
  }) as Template;

/**
 * Normalizes a raw pdfme layout from the API so it is valid for @pdfme/common.
 * Ensures `schemas` is an array and `basePdf` is present and valid to avoid
 * "expected array, received undefined" and "Invalid input" errors from checkTemplate.
 *
 * @param layout - Raw layout from API (may have undefined schemas/basePdf)
 * @returns Normalized layout safe to pass to createTemplateFromLayout / checkTemplate
 */
export function normalizePdfmeLayoutForContract(layout: unknown): {
  basePdf: Template["basePdf"];
  schemas: Template["schemas"];
} {
  const blank = getBlankTemplate();
  if (!layout || typeof layout !== "object") {
    return { basePdf: blank.basePdf, schemas: blank.schemas };
  }
  const raw = layout as Record<string, unknown>;
  const schemas =
    Array.isArray(raw.schemas) && raw.schemas.length > 0
      ? raw.schemas
      : blank.schemas;
  const basePdf =
    raw.basePdf != null &&
    raw.basePdf !== "" &&
    (typeof raw.basePdf === "string" ||
      (typeof raw.basePdf === "object" &&
        raw.basePdf !== null &&
        "width" in raw.basePdf))
      ? (raw.basePdf as Template["basePdf"])
      : blank.basePdf;
  return { basePdf, schemas };
}
