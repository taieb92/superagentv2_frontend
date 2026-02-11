const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Find all .tsx and .ts files
const findFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (
        !file.startsWith(".") &&
        file !== "node_modules" &&
        file !== ".next" &&
        file !== "dist" &&
        file !== "build"
      ) {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

const removeWhitespaceFragments = (content) => {
  // Remove {" "} fragments with various spacing patterns
  let cleaned = content
    .replace(/\{\s*" "\s*\}/g, "") // Standard {" "}
    .replace(/\{\s*" "\s*\}/g, "") // With extra spaces
    .replace(/\{\s*"\s*"\s*\}/g, "") // With space between quotes
    .replace(/\{\s*"  "\s*\}/g, "") // With multiple spaces
    .replace(/>\s*\{\s*" "\s*\}\s*</g, "><") // Between tags
    .replace(/>\s*\{\s*" "\s*\}\s*\n/g, ">\n") // Before newline
    .replace(/\n\s*\{\s*" "\s*\}\s*</g, "\n<") // After newline
    .replace(/\n\s*\n\s*\n+/g, "\n\n") // Remove excessive blank lines
    .replace(/\n\s+\n/g, "\n\n"); // Remove lines with only whitespace

  // Final cleanup - remove any remaining fragments
  cleaned = cleaned.replace(/\{\s*" "\s*\}/g, "");

  return cleaned.trim();
};

const files = findFiles(process.cwd());
let modifiedCount = 0;

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const cleaned = removeWhitespaceFragments(content);

  if (content !== cleaned) {
    fs.writeFileSync(filePath, cleaned, "utf8");
    modifiedCount++;
    console.log(`Cleaned: ${filePath}`);
  }
});

console.log(`\nCleaned ${modifiedCount} files`);
