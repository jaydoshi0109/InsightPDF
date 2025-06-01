const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
// Directories to process
const directories = [
  'app',
  'components',
  'context',
  'lib',
  'utils',
  'actions',
  'scripts'
];
// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];
// Function to process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    // Remove statements
    content = content.replace(/\/\*.*?\*\/|([^\\:]\/\/.*|\/\*[\s\S]*?\*\/)/g, (match, group1) => {
      // Preserve comments
      return group1 ? match : '';
    });
    // Remove , , , etc.
    content = content.replace(/\bconsole\.(log|warn|error|info|debug|time|timeEnd|group|groupEnd|table|trace|count|countReset|groupCollapsed|clear|dir|dirxml|assert|profile|profileEnd|timeLog|timeStamp|context|debugger)(\([^)]*\)|`[^`]*`|\s*;?)/g, '');
    // Remove empty lines with just whitespace
    content = content.replace(/^\s*[\r\n]/gm, '');
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      ;
      return true;
    }
    return false;
  } catch (error) {
    ;
    return false;
  }
}
// Process all files in directories
function processDirectories() {
  let filesProcessed = 0;
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const processDirectory = (dirPath) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      entries.forEach(entry => {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          processDirectory(fullPath);
        } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
          if (processFile(fullPath)) {
            filesProcessed++;
          }
        }
      });
    };
    processDirectory(dir);
  });
  return filesProcessed;
}
// Run the cleanup
;
const processedCount = processDirectories();
;
