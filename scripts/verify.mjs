import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cwd = fileURLToPath(new URL('../', import.meta.url));
if (Number(process.versions.node.split('.')[0]) < 24) {
  console.error('Verification requires Node.js 24 or newer.');
  process.exit(1);
}
if (!existsSync(new URL('../node_modules/next/package.json', import.meta.url))) {
  console.error('Install the existing locked dependencies with npm ci first.');
  process.exit(1);
}
const npmCli = process.env.npm_execpath;
if (!npmCli) {
  console.error('Use npm run verify (or bash init.sh).');
  process.exit(1);
}

let basePath = process.env.PAGES_BASE_PATH;
if (basePath === undefined) {
  const git = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd, encoding: 'utf8' });
  const repository = git.status === 0 ? git.stdout.trim().split(/[/:]/).pop()?.replace(/\.git$/, '') : undefined;
  if (!repository || !/^[\w.-]+$/.test(repository)) {
    console.error('Cannot derive the repository name; set PAGES_BASE_PATH explicitly.');
    process.exit(1);
  }
  basePath = repository.toLowerCase().endsWith('.github.io') ? '' : `/${repository}`;
}
if (basePath !== '' && !/^\/[\w.-]+$/.test(basePath)) {
  console.error('PAGES_BASE_PATH must be empty or a single /repository-name prefix.');
  process.exit(1);
}

const env = { ...process.env, PAGES_BASE_PATH: basePath };
console.log(`Verification export prefix: ${basePath || '/'}`);
const steps = [
  ['run', 'validate:data'], ['run', 'lint'], ['run', 'typecheck'], ['test'], ['run', 'build'],
];
for (const args of steps) {
  const result = spawnSync(process.execPath, [npmCli, ...args], { cwd, env, stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    console.error(`Verification stopped at npm ${args.join(' ')}.`);
    process.exit(result.status || 1);
  }
}
const exported = spawnSync(process.execPath, ['scripts/check-export.mjs'], { cwd, env, stdio: 'inherit' });
if (exported.error || exported.status !== 0) process.exit(exported.status || 1);
console.log('All verification gates passed.');
