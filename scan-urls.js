const fs = require('fs');
const path = require('path');

function findUrls(dir) {
  let urls = new Set();
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        findUrls(fullPath).forEach(u => urls.add(u));
      }
    } else {
      if (['.ts', '.tsx', '.js', '.jsx', '.html', '.css'].some(ext => fullPath.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const matches = content.match(/https?:\/\/[^\/"'`\s]+/g);
        if (matches) {
          matches.forEach(m => urls.add(m));
        }
      }
    }
  }
  return urls;
}

const urls = findUrls('.');
const origins = new Set();
for (const u of urls) {
  try {
    const url = new URL(u);
    origins.add(url.origin);
  } catch(e) {}
}

console.log(Array.from(origins).sort().join('\n'));
