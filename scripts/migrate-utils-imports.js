#!/usr/bin/env node
/**
 * Script to migrate imports from local utils to @requestly/utils package
 * Updates all imports across the codebase
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import mappings: old path -> new import source
const importMappings = {
  'utils/FormattingHelper': '@requestly/utils',
  'utils/DateTimeUtils': '@requestly/utils',
  'utils/URLUtils': '@requestly/utils',
  'utils/EnvUtils': '@requestly/utils',
  'utils/try': '@requestly/utils',
  'utils/FunctionUtils': '@requestly/utils',
  'utils/osUtils': '@requestly/utils',
  // Handle relative paths
  '../../../utils/FormattingHelper': '@requestly/utils',
  '../../../utils/URLUtils': '@requestly/utils',
  '../../../../utils/FormattingHelper': '@requestly/utils',
  '../../../../../utils/FormattingHelper': '@requestly/utils',
  '../../../../../../../../../utils/FormattingHelper': '@requestly/utils',
  '../../../../../../utils/FormattingHelper': '@requestly/utils',
  '../../../../../../../utils/FormattingHelper': '@requestly/utils',
  '../../../../../../../../utils/FormattingHelper': '@requestly/utils',
  '../../../../../../../../../../utils/FormattingHelper': '@requestly/utils',
};

const srcDir = path.join(__dirname, '../clients/web/src');

// Find all JS/TS/JSX/TSX files
const files = glob.sync(`${srcDir}/**/*.{js,jsx,ts,tsx}`, {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
});

console.log(`Found ${files.length} files to process`);

let updatedCount = 0;
let errorCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let wasModified = false;

    // Update each import mapping
    Object.entries(importMappings).forEach(([oldPath, newPath]) => {
      // Match both single and double quotes
      const patterns = [
        // from "utils/..."
        new RegExp(`from\\s+["']${oldPath.replace(/\//g, '\\/')}["']`, 'g'),
        // require('utils/...')
        new RegExp(`require\\s*\\(\\s*["']${oldPath.replace(/\//g, '\\/')}["']\\s*\\)`, 'g'),
        // import('utils/...')
        new RegExp(`import\\s*\\(\\s*["']${oldPath.replace(/\//g, '\\/')}["']\\s*\\)`, 'g'),
      ];

      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          const replacement = pattern.toString().includes('from')
            ? `from "${newPath}"`
            : pattern.toString().includes('require')
            ? `require("${newPath}")`
            : `import("${newPath}")`;

          content = content.replace(pattern, replacement);
          wasModified = true;
        }
      });
    });

    if (wasModified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
      console.log(`✓ Updated: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    errorCount++;
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n✅ Migration complete!`);
console.log(`   Updated: ${updatedCount} files`);
console.log(`   Errors: ${errorCount} files`);
console.log(`   Total processed: ${files.length} files`);
