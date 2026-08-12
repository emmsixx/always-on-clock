import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawVersion = process.argv[2] ?? process.env.GITHUB_REF_NAME ?? '';
const version = rawVersion.replace(/^v/, '');

if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Expected a semantic version or v-prefixed tag, received: ${rawVersion}`);
}

const writeJsonVersion = (relativePath) => {
  const filePath = path.join(root, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const document = JSON.parse(source);
  document.version = version;
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  fs.writeFileSync(filePath, `${JSON.stringify(document, null, 2).replaceAll('\n', newline)}${newline}`);
};

writeJsonVersion('package.json');
writeJsonVersion('src-tauri/tauri.conf.json');

const cargoTomlPath = path.join(root, 'src-tauri/Cargo.toml');
const cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
const updatedCargoToml = cargoToml.replace(
  /^(version = ")[^"]+("\n)/m,
  `$1${version}$2`,
);
if (updatedCargoToml === cargoToml) {
  throw new Error('Could not find the package version in src-tauri/Cargo.toml');
}
fs.writeFileSync(cargoTomlPath, updatedCargoToml);

const cargoLockPath = path.join(root, 'src-tauri/Cargo.lock');
const cargoLock = fs.readFileSync(cargoLockPath, 'utf8');
const updatedCargoLock = cargoLock.replace(
  /(name = "always-on-clock"\nversion = ")[^"]+("\n)/,
  `$1${version}$2`,
);
if (updatedCargoLock === cargoLock) {
  throw new Error('Could not find the package version in src-tauri/Cargo.lock');
}
fs.writeFileSync(cargoLockPath, updatedCargoLock);

console.log(`Synchronized release version: ${version}`);
