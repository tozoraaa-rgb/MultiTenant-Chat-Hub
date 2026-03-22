import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isWindows = process.platform === 'win32';
const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

if (!isWindows) {
  process.exit(0);
}

const archToSuffix = {
  x64: 'x64',
  arm64: 'arm64',
  ia32: 'ia32',
};

const archSuffix = archToSuffix[process.arch];

if (!archSuffix) {
  console.warn(
    `[ensure-windows-optional-deps] Unsupported Windows architecture '${process.arch}'. Skipping optional native dependency install.`,
  );
  process.exit(0);
}

const packages = [
  `@rollup/rollup-win32-${archSuffix}-msvc`,
  `@esbuild/win32-${archSuffix}`,
  `@swc/core-win32-${archSuffix}-msvc`,
];

const missingPackages = [];

for (const pkg of packages) {
  try {
    require.resolve(pkg);
    console.log(`[ensure-windows-optional-deps] ${pkg} already installed.`);
  } catch {
    missingPackages.push(pkg);
  }
}

if (missingPackages.length === 0) {
  process.exit(0);
}

console.log(
  `[ensure-windows-optional-deps] Installing missing packages in one pass: ${missingPackages.join(', ')}`,
);

execSync(`npm i -D ${missingPackages.join(' ')} --no-save --no-package-lock`, {
  stdio: 'inherit',
  cwd: repoRoot,
});

for (const pkg of missingPackages) {
  try {
    require.resolve(pkg);
  } catch {
    throw new Error(
      `[ensure-windows-optional-deps] Failed to install '${pkg}'. Please run: npm i -D ${missingPackages.join(' ')} --no-save`,
    );
  }
}
