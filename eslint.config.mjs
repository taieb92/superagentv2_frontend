/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    // Allow console.error for error logging (we use logger utility, but keep this for compatibility)
    "no-console": ["warn", { allow: ["error", "warn"] }],
    // Enforce consistent return
    "consistent-return": "warn",
    // Prevent unused variables (except those starting with _)
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    // Prevent any types
    "@typescript-eslint/no-explicit-any": "warn",
    // Require explicit return types on exported functions
    "@typescript-eslint/explicit-module-boundary-types": "off",
    // Allow non-null assertions (use sparingly)
    "@typescript-eslint/no-non-null-assertion": "warn",
  },
};

export default eslintConfig;
