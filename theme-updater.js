const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace Dark Theme Backgrounds -> Semantic Backgrounds
  content = content.replace(/bg-zinc-950/g, 'bg-card');
  content = content.replace(/bg-zinc-900/g, 'bg-secondary');
  content = content.replace(/bg-black\/80/g, 'bg-background/90');
  content = content.replace(/bg-black\/60/g, 'bg-background/70');
  content = content.replace(/bg-black/g, 'bg-background');

  content = content.replace(/bg-white\/5/g, 'bg-foreground/5');
  content = content.replace(/bg-white\/10/g, 'bg-foreground/10');
  content = content.replace(/bg-white\/20/g, 'bg-foreground/20');

  // 2. Borders
  content = content.replace(/border-white\/10/g, 'border-border');
  content = content.replace(/border-white\/20/g, 'border-border');
  content = content.replace(/border-white/g, 'border-border');

  // 3. Text colors globally
  content = content.replace(/text-white\/[0-9]+/g, 'text-muted-foreground');
  content = content.replace(/text-white/g, 'text-foreground');

  // 4. Safely revert text-foreground back to text-white inside buttons/elements that have 'purple' or 'blue'
  // Single-line string literal className=""
  content = content.replace(/(className="[^"]*?(?:purple|bg-gradient)[^"]*?)text-foreground([^"]*")/g, '$1text-white$2');
  content = content.replace(/(className="[^"]*?)text-foreground([^"]*?(?:purple|bg-gradient)[^"]*")/g, '$1text-white$2');

  // Multi-line template literal className={` `}
  content = content.replace(/(className=\{`[^`]*?(?:purple|bg-gradient)[^`]*?)text-foreground([^`]*`\})/g, '$1text-white$2');
  content = content.replace(/(className=\{`[^`]*?)text-foreground([^`]*?(?:purple|bg-gradient)[^`]*`\})/g, '$1text-white$2');

  // 5. Special case for the Top Banner in Header (which uses bg-gradient)
  content = content.replace(/className="text-sm text-foreground">\s*🎉 Sale/g, 'className="text-sm text-white">\n            🎉 Sale');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

// Reset App.tsx dark class
function updateAppTsx() {
  const appTsxPath = path.join(directoryPath, 'App.tsx');
  if (fs.existsSync(appTsxPath)) {
    let content = fs.readFileSync(appTsxPath, 'utf8');
    content = content.replace(/classList\.add\("dark"\)/g, 'classList.remove("dark")');
    fs.writeFileSync(appTsxPath, content, 'utf8');
  }
}

walkDir(directoryPath);
updateAppTsx();
console.log('Update complete.');
