const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'src', 'config');
const targetDir = path.join(__dirname, '..', 'dist', 'config');

fs.mkdirSync(targetDir, { recursive: true });

for (const file of fs.readdirSync(sourceDir)) {
  if (!file.endsWith('.json')) continue;
  fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
}
