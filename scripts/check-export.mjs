import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const basePath = (process.env.PAGES_BASE_PATH || '').replace(/\/$/, '');
let checked = 0;
function checkDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { checkDirectory(path); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const html = readFileSync(path, 'utf8');
    const assets = [...html.matchAll(/(?:src|href)="([^"\s]*\/_next\/[^"\s]*)"/g)];
    assert.ok(assets.length, `${path}: missing generated CSS/JavaScript references`);
    for (const [, url] of assets) {
      assert.ok(url.startsWith(`${basePath}/_next/`), `${path}: unexpected asset prefix ${url}`);
      const assetPath = url.slice(basePath.length).split('?')[0];
      assert.ok(existsSync(join('out', assetPath.slice(1))), `${path}: missing asset ${url}`);
      checked++;
    }
  }
}
checkDirectory('out');
assert.ok(checked > 0, 'No exported HTML assets checked');
console.log(`已驗證 ${checked} 個靜態資源路徑，部署前綴：${basePath || '/'}`);
