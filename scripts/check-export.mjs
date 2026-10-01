import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { questionSets } from '../src/data/questionSets/index.ts';

const basePath = (process.env.PAGES_BASE_PATH || '').replace(/\/$/, '');
let checked = 0;
function checkAsset(url, context) {
  assert.ok(url.startsWith(`${basePath}/`), `${context}: unexpected asset prefix ${url}`);
  const assetPath = url.slice(basePath.length).split('?')[0];
  assert.ok(existsSync(join('out', assetPath.slice(1))), `${context}: missing asset ${url}`);
  checked++;
}
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
      checkAsset(url, path);
    }
    const manifestLink = html.match(/<link\b[^>]*rel="manifest"[^>]*href="([^"\s]+)"/);
    assert.ok(manifestLink, `${path}: missing manifest link`);
    assert.equal(manifestLink[1], `${basePath}/manifest.webmanifest`, `${path}: incorrect manifest prefix`);
    checkAsset(manifestLink[1], path);
    for (const [relation, name] of [['icon', 'icon.svg'], ['apple-touch-icon', 'apple-touch-icon.png']]) {
      const link = html.match(new RegExp(`<link\\b[^>]*rel="${relation}"[^>]*href="([^"\\s]+)"`));
      assert.ok(link, `${path}: missing ${relation}`);
      assert.equal(link[1], `${basePath}/app-icons/${name}`, `${path}: incorrect ${relation} prefix`);
      checkAsset(link[1], path);
    }
    for (const [, url] of html.matchAll(/src="([^"\s]*\/question-assets\/[^"\s]*)"/g)) {
      assert.ok(url.startsWith(`${basePath}/question-assets/`), `${path}: incorrect question image prefix ${url}`);
      checkAsset(url, path);
    }
  }
}
checkDirectory('out');
const manifest = JSON.parse(readFileSync('out/manifest.webmanifest', 'utf8'));
assert.equal(manifest.name, '競賽複習題庫');
assert.equal(manifest.lang, 'zh-Hant');
assert.equal(manifest.start_url, `${basePath}/`);
assert.equal(manifest.scope, `${basePath}/`);
assert.ok(manifest.icons?.length, 'Manifest has no icons');
for (const icon of manifest.icons) {
  assert.ok(icon.src.startsWith(`${basePath}/app-icons/`), `Incorrect manifest icon prefix ${icon.src}`);
  checkAsset(icon.src, 'manifest');
}
// Later-question images may not appear in the prerendered first question.
for (const set of questionSets) {
  for (const question of set.questions) {
    for (const image of [question.image, ...question.choices.map(choice => choice.image)]) {
      if (image) checkAsset(`${basePath}${image}`, `${set.id} question ${question.number}`);
    }
  }
}
assert.ok(checked > 0, 'No exported HTML assets checked');
console.log(`已驗證 ${checked} 個靜態資源路徑，部署前綴：${basePath || '/'}`);
