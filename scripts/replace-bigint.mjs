import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = 'C:\\00.My document\\@@\\星隅人格系统项目\\fate-gate\\src\\app\\api';

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.ts')) processFile(p);
  }
}

function processFile(path) {
  const content = readFileSync(path, 'utf-8');
  if (!content.includes('BigInt(')) return;
  const newContent = content.replaceAll('BigInt(', 'Number(');
  writeFileSync(path, newContent, 'utf-8');
  console.log('Fixed:', path.replace(root, ''));
}

walk(root);
console.log('Done');
