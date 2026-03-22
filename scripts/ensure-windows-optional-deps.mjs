import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const isWindows = process.platform === 'win32';
const require = createRequire(import.meta.url);

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

for (const pkg of packages) {
  try {
    require.resolve(pkg);
    console.log(`[ensure-windows-optional-deps] ${pkg} already installed.`);
  } catch {
    console.log(`[ensure-windows-optional-deps] Installing missing ${pkg}...`);
    execSync(`npm i -D ${pkg} --no-save`, { stdio: 'inherit' });
  }
}
