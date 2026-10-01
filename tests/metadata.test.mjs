import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import manifest, { dynamic } from '../src/app/manifest.ts';

test('home-screen manifest follows local, current and renamed repository paths', () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  try {
    for (const prefix of ['', '/competition-practice', '/renamed-practice/']) {
      process.env.NEXT_PUBLIC_BASE_PATH = prefix;
      const result = manifest();
      const root = `${prefix.replace(/\/$/, '')}/`;
      assert.equal(result.name, '競賽複習題庫');
      assert.equal(result.short_name, '競賽題庫');
      assert.equal(result.lang, 'zh-Hant');
      assert.equal(result.scope, root);
      assert.equal(result.start_url, root);
      assert.equal(result.display, 'standalone');
      for (const icon of result.icons) {
        assert.ok(icon.src.startsWith(`${root}app-icons/`));
        assert.ok(existsSync(new URL(`../public/app-icons/${icon.src.split('/').at(-1)}`, import.meta.url)));
      }
    }
    assert.equal(dynamic, 'force-static');
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test('raster home-screen icons declare their actual PNG dimensions', () => {
  for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    const png = readFileSync(new URL(`../public/app-icons/${name}`, import.meta.url));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
});
